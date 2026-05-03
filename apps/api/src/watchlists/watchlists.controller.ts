import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from "@nestjs/common";
import { WatchlistsService } from "./watchlists.service";
import {
  WatchlistEntryResponseDto,
  WatchlistEntryCreateDto,
  WatchlistEntryUpdateDto,
  ChartDataDto,
  RecentAlertDto,
} from "./watchlist.dto";
import { AuthGuard } from "@nestjs/passport";
import type { AuthenticatedRequest } from "src/users/users.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("watchlists")
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() watchlistEntryData: WatchlistEntryCreateDto,
  ): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.create(request.user.id, watchlistEntryData);
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
  getChartData(@Req() request: AuthenticatedRequest, @Param("entryId") entryId: string): Promise<ChartDataDto> {
    return this.watchlistsService.getChartData(request.user.id, entryId);
  }

  @Get(":entryId")
  findOne(@Param("entryId") entryId: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.findOne(entryId);
  }

  @Patch(":entryId")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("entryId") entryId: string,
    @Body() watchlistUpdateData: WatchlistEntryUpdateDto,
  ): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.update(request.user.id, entryId, watchlistUpdateData);
  }

  @Delete(":entryId")
  remove(@Req() request: AuthenticatedRequest, @Param("entryId") entryId: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.remove(request.user.id, entryId);
  }
}
