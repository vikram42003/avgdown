import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import { WatchlistEntryCreateDto, WatchlistEntryUpdateDto, WatchlistEntryResponseDto } from "./dto/watchlist.dto";

@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: WatchlistEntryCreateDto): Promise<WatchlistEntryResponseDto> {
    return "This action adds a new watchlist" as any;
  }

  async findAll(): Promise<WatchlistEntryResponseDto[]> {
    return await this.prisma.db.watchlistEntry.findMany();
  }

  async findOne(id: number): Promise<WatchlistEntryResponseDto> {
    return `This action returns a #${id} watchlist` as any;
  }

  async update(id: number, updateDto: WatchlistEntryUpdateDto): Promise<WatchlistEntryResponseDto> {
    return `This action updates a #${id} watchlist` as any;
  }

  async remove(id: number): Promise<WatchlistEntryResponseDto> {
    return `This action removes a #${id} watchlist` as any;
  }
}
