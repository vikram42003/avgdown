import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { WatchlistsService } from "./watchlists.service";
import { WatchlistEntryResponseDto, WatchlistEntryCreateDto, WatchlistEntryUpdateDto } from "./watchlist.dto";
import { AuthGuard } from "@nestjs/passport";

// @UseGuards(AuthGuard("jwt"))
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
