import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { WatchlistsService } from "./watchlists.service";
import { CreateWatchlistDto } from "./dto/create-watchlist.dto";
import { UpdateWatchlistDto } from "./dto/update-watchlist.dto";

@Controller("watchlists")
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Post()
  create(@Body() createWatchlistDto: CreateWatchlistDto) {
    return this.watchlistsService.create(createWatchlistDto);
  }

  @Get()
  findAll() {
    return this.watchlistsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.watchlistsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateWatchlistDto: UpdateWatchlistDto) {
    return this.watchlistsService.update(+id, updateWatchlistDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.watchlistsService.remove(+id);
  }
}
