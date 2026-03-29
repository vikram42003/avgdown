import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import { WatchlistEntryCreateDto, WatchlistEntryUpdateDto, WatchlistEntryResponseDto } from "./dto/watchlist.dto";

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

  async update(id: number, updateDto: WatchlistEntryUpdateDto): Promise<WatchlistEntryResponseDto> {
    return `This action updates a #${id} watchlist` as any;
  }

  async remove(id: number): Promise<WatchlistEntryResponseDto> {
    return `This action removes a #${id} watchlist` as any;
  }
}
