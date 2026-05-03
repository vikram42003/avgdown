import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/common/database/prisma/prisma.service";
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

    const HISTORY_WINDOW = 40;

    // Fetch the last HISTORY_WINDOW 15-min price snapshots (the chart's price line)
    const priceSnapshots = await this.prisma.priceSnapshot.findMany({
      where: { assetId: entry.assetId },
      orderBy: { fetchedAt: "desc" },
      take: HISTORY_WINDOW,
    });
    priceSnapshots.reverse();

    const prices = priceSnapshots.map((p) => ({ ...p, price: p.price.toNumber() }));

    // Fetch the last HISTORY_WINDOW daily SMA values for this asset+period
    const dailySmaRows = await this.prisma.dailySmaSnapshot.findMany({
      where: { assetId: entry.assetId, period: entry.smaPeriod },
      orderBy: { date: "desc" },
      take: HISTORY_WINDOW,
      select: { date: true, smaValue: true },
    });

    // Build a date -> sma_value lookup (dates are stored as YYYY-MM-DD midnight UTC)
    const smaByDate = new Map(dailySmaRows.map((r) => [r.date.toISOString().slice(0, 10), r.smaValue.toNumber()]));

    // Align the SMA to price points by day. Each 15-min snapshot maps to the SMA for that day.
    const sma = prices.map((p) => {
      const day = p.fetchedAt.toISOString().slice(0, 10);
      return smaByDate.get(day) ?? null;
    });

    return { prices, sma, smaPeriod: entry.smaPeriod };
  }
}
