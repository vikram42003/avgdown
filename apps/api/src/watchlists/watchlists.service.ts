import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/database/prisma/prisma.service";
import { AssetsService } from "../assets/assets.service";
import { HISTORY_WINDOW } from "../constants";
import {
  WatchlistEntryCreateDto,
  WatchlistEntryUpdateDto,
  WatchlistEntryResponseDto,
  ChartDataDto,
  RecentAlertDto,
} from "./watchlist.dto";

// yahoo-finance2 for backfilling daily price snapshots on watchlist creation
// eslint-disable-next-line @typescript-eslint/no-require-imports
const yahooFinance = require("yahoo-finance2").default as {
  chart: (
    symbol: string,
    opts: { period1: string; interval: "1d" },
  ) => Promise<{ quotes: { date: Date; close: number | null }[] }>;
};

@Injectable()
export class WatchlistsService {
  private readonly logger = new Logger(WatchlistsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async create(userId: string, dto: WatchlistEntryCreateDto): Promise<WatchlistEntryResponseDto> {
    // Resolve the asset — either by existing ID or by creating from search result
    let assetId: string;

    if (dto.assetId) {
      assetId = dto.assetId;
    } else {
      // New asset from search — find or create
      const asset = await this.assetsService.findOrCreateAsset(
        dto.symbol!,
        dto.exchange!,
        dto.name!,
        dto.assetType!,
      );
      assetId = asset.id;
    }

    const createdWatchlistEntry = await this.prisma.watchlistEntry.create({
      data: { userId, assetId, smaPeriod: dto.smaPeriod, isActive: dto.isActive },
      include: { asset: true },
    });

    // Synchronously backfill daily price snapshots so charts render immediately
    await this.backfillDailyCloses(assetId, createdWatchlistEntry.asset.symbol, dto.smaPeriod);

    return createdWatchlistEntry;
  }

  /**
   * Fetches historical daily closes from yahoo-finance2 and upserts them into
   * daily_price_snapshots. Runs synchronously during watchlist creation so the
   * user's chart is immediately available without waiting for the daily worker.
   */
  private async backfillDailyCloses(assetId: string, symbol: string, smaPeriod: number): Promise<void> {
    const requiredCloses = HISTORY_WINDOW + smaPeriod - 1;
    // Convert trading days to calendar days (5 per 7) + 14-day buffer for holidays
    const calendarDays = Math.ceil((requiredCloses * 7) / 5) + 14;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - calendarDays);
    const period1 = startDate.toISOString().split("T")[0]!;

    this.logger.log(`Backfilling ${requiredCloses} daily closes for ${symbol} (asset ${assetId})`);

    try {
      const result = await yahooFinance.chart(symbol, { period1, interval: "1d" });
      const quotes = result.quotes ?? [];

      // Filter out nulls and take the last N required
      const validQuotes = quotes.filter((q) => q.close !== null).slice(-requiredCloses);

      if (validQuotes.length === 0) {
        this.logger.warn(`No daily closes returned for ${symbol} — chart will be empty until daily worker runs`);
        return;
      }

      // Upsert in bulk using a single transaction
      await this.prisma.$transaction(
        validQuotes.map((q) =>
          this.prisma.dailyPriceSnapshot.upsert({
            where: {
              assetId_date: {
                assetId,
                date: new Date(q.date.toISOString().split("T")[0]!),
              },
            },
            update: { close: q.close!, source: "yahoo-finance2" },
            create: {
              assetId,
              date: new Date(q.date.toISOString().split("T")[0]!),
              close: q.close!,
              source: "yahoo-finance2",
            },
          }),
        ),
      );

      this.logger.log(`Backfilled ${validQuotes.length} daily closes for ${symbol}`);
    } catch (error) {
      // Non-fatal — the daily worker will catch up. Log and continue.
      this.logger.error(`Failed to backfill daily closes for ${symbol}: ${String(error)}`);
    }
  }

  async findAll(userId: string): Promise<WatchlistEntryResponseDto[]> {
    return await this.prisma.watchlistEntry.findMany({ where: { userId }, include: { asset: true } });
  }

  async findOne(userId: string, entryId: string): Promise<WatchlistEntryResponseDto> {
    const watchlistEntry = await this.prisma.watchlistEntry.findUnique({
      where: { id: entryId },
      include: { asset: true },
    });

    if (watchlistEntry?.userId !== userId) {
      throw new NotFoundException(`Watchlist entry with ID ${entryId} not found`);
    }

    return watchlistEntry;
  }

  async update(
    userId: string,
    entryId: string,
    watchlistUpdateData: WatchlistEntryUpdateDto,
  ): Promise<WatchlistEntryResponseDto> {
    const existingEntry = await this.prisma.watchlistEntry.findUnique({ where: { id: entryId } });
    if (existingEntry?.userId !== userId) {
      throw new NotFoundException(`Watchlist entry with ID ${entryId} not found`);
    }

    return await this.prisma.watchlistEntry.update({
      where: { id: entryId },
      data: watchlistUpdateData,
      include: { asset: true },
    });
  }

  async remove(userId: string, entryId: string): Promise<WatchlistEntryResponseDto> {
    const existingEntry = await this.prisma.watchlistEntry.findUnique({ where: { id: entryId } });
    if (existingEntry?.userId !== userId) {
      throw new NotFoundException(`Watchlist entry with ID ${entryId} not found`);
    }

    return await this.prisma.watchlistEntry.delete({
      where: { id: entryId },
      include: { asset: true },
    });
  }

  async getRecentAlerts(userId: string): Promise<RecentAlertDto[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const alerts = await this.prisma.alert.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        triggeredPrice: true,
        smaValue: true,
        createdAt: true,
        smaPeriod: true,
        symbol: true,
        assetName: true,
        exchange: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return alerts.map((alert) => ({
      id: alert.id,
      triggeredPrice: alert.triggeredPrice.toNumber(),
      smaValue: alert.smaValue.toNumber(),
      createdAt: alert.createdAt,
      watchlistEntry: {
        smaPeriod: alert.smaPeriod,
        asset: {
          symbol: alert.symbol,
          name: alert.assetName,
          exchange: alert.exchange,
        },
      },
    }));
  }

  async getChartData(userId: string, entryId: string): Promise<ChartDataDto> {
    // First resolve the assetId from the watchlist entry and verify ownership
    const entry = await this.prisma.watchlistEntry.findUnique({
      where: { id: entryId },
      select: { assetId: true, smaPeriod: true, userId: true },
    });

    if (entry?.userId !== userId) {
      throw new NotFoundException(`Watchlist entry with ID ${entryId} not found`);
    }

    const dailyRows = await this.prisma.dailyPriceSnapshot.findMany({
      where: { assetId: entry.assetId },
      orderBy: { date: "desc" },
      take: HISTORY_WINDOW + entry.smaPeriod - 1,
      select: { date: true, close: true },
    });
    dailyRows.reverse();

    const closes = dailyRows.map((row) => row.close.toNumber());
    const allPoints = dailyRows.map((row, index) => {
      const hasFullWindow = index + 1 >= entry.smaPeriod;
      const sma = hasFullWindow
        ? closes.slice(index + 1 - entry.smaPeriod, index + 1).reduce((sum, close) => sum + close, 0) / entry.smaPeriod
        : null;

      return {
        date: row.date,
        close: row.close.toNumber(),
        sma,
      };
    });

    return {
      points: allPoints.slice(-HISTORY_WINDOW),
      smaPeriod: entry.smaPeriod,
      status: dailyRows.length >= entry.smaPeriod ? "READY" : "WARMING_UP",
    };
  }
}
