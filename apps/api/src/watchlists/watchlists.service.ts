import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/database/prisma/prisma.service";
import { HISTORY_WINDOW } from "../constants";
import {
  WatchlistEntryCreateDto,
  WatchlistEntryUpdateDto,
  WatchlistEntryResponseDto,
  ChartDataDto,
  RecentAlertDto,
} from "./watchlist.dto";

@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, watchlistEntryData: WatchlistEntryCreateDto): Promise<WatchlistEntryResponseDto> {
    const data = { userId, ...watchlistEntryData };
    const createdWatchlistEntry = await this.prisma.watchlistEntry.create({ data, include: { asset: true } });

    return createdWatchlistEntry;
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
        watchlistEntry: { userId },
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        triggeredPrice: true,
        smaValue: true,
        createdAt: true,
        watchlistEntry: {
          select: {
            smaPeriod: true,
            asset: {
              select: {
                symbol: true,
                name: true,
                exchange: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return alerts.map((alert) => ({
      ...alert,
      triggeredPrice: alert.triggeredPrice.toNumber(),
      smaValue: alert.smaValue.toNumber(),
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
