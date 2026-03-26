import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { WatchlistService } from "./watchlist.service";
import { CreateWatchlistDto } from "./dto/create-watchlist.dto";
import { UpdateWatchlistDto } from "./dto/update-watchlist.dto";

@Controller("watchlist")
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  create(@Body() createWatchlistDto: CreateWatchlistDto) {
    return this.watchlistService.create(createWatchlistDto);
  }

  @Get()
  findAll() {
    return this.watchlistService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.watchlistService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateWatchlistDto: UpdateWatchlistDto) {
    return this.watchlistService.update(+id, updateWatchlistDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.watchlistService.remove(+id);
  }
}
