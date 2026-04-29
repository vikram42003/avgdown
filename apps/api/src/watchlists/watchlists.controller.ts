import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from "@nestjs/common";
import { WatchlistsService } from "./watchlists.service";
import {
  WatchlistEntryResponseDto,
  WatchlistEntryCreateDto,
  WatchlistEntryUpdateDto,
  PriceSnapshotResponseDto,
  RecentAlertDto,
} from "./watchlist.dto";
import { AuthGuard } from "@nestjs/passport";
import type { AuthenticatedRequest } from "src/users/users.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("watchlists")
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Post()
  create(@Body() createDto: WatchlistEntryCreateDto): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.create(createDto);
  }

  @Get()
  findAll(): Promise<WatchlistEntryResponseDto[]> {
    return this.watchlistsService.findAll();
  }

  @Get("recent-alerts")
  getRecentAlerts(@Req() request: AuthenticatedRequest): Promise<RecentAlertDto[]> {
    return this.watchlistsService.getRecentAlerts(request.user.id);
  }

  @Get(":entryId/chart-data")
  getChartData(@Param("entryId") entryId: string): Promise<PriceSnapshotResponseDto[]> {
    return this.watchlistsService.getChartData(entryId);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: WatchlistEntryUpdateDto): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.remove(id);
  }
}
