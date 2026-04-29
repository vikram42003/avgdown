import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import {
  WatchlistEntryCreateDto,
  WatchlistEntryUpdateDto,
  WatchlistEntryResponseDto,
  PriceSnapshotResponseDto,
  RecentAlertDto,
} from "./watchlist.dto";

import { assertFound } from "src/common/utils/assert-found";

@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: WatchlistEntryCreateDto): Promise<WatchlistEntryResponseDto> {
    // Extract user id from auth guard or something and then embed that to the recieved object and then create
    // WIP - Do it after auth

    // const watchlistEntry = await this.prisma.watchlistEntry.create({ data: createDto });
    // return watchlistEntry;
    return `This action adds a new watchlist` as any;
  }

  async findAll(): Promise<WatchlistEntryResponseDto[]> {
    return await this.prisma.watchlistEntry.findMany({ include: { asset: true } });
  }

  async findOne(id: string): Promise<WatchlistEntryResponseDto> {
    const watchlistEntry = await this.prisma.watchlistEntry.findUnique({ where: { id }, include: { asset: true } });
    return assertFound(watchlistEntry, `Watchlist entry with ID ${id} not found`);
  }

  async update(id: string, updateDto: WatchlistEntryUpdateDto): Promise<WatchlistEntryResponseDto> {
    return `This action updates a #${id} watchlist` as any;
  }

  async remove(id: string): Promise<WatchlistEntryResponseDto> {
    return `This action removes a #${id} watchlist` as any;
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

  async getChartData(entryId: string): Promise<PriceSnapshotResponseDto[]> {
    // First resolve the assetId from the watchlist entry
    const entry = await this.prisma.watchlistEntry.findUnique({
      where: { id: entryId },
      select: { assetId: true, smaPeriod: true },
    });

    if (!entry) throw new NotFoundException(`Watchlist entry with ID ${entryId} not found`);

    const priceSnapshots = await this.prisma.priceSnapshot.findMany({
      where: { assetId: entry.assetId },
      orderBy: { fetchedAt: "asc" },
      take: entry.smaPeriod,
    });

    return priceSnapshots.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }));
  }
}
