import { Injectable } from "@nestjs/common";
import { CreateWatchlistDto } from "./dto/create-watchlist.dto";
import { UpdateWatchlistDto } from "./dto/update-watchlist.dto";

@Injectable()
export class WatchlistsService {
  create(createWatchlistDto: CreateWatchlistDto) {
    return "This action adds a new watchlist";
  }

  findAll() {
    return `This action returns all watchlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} watchlist`;
  }

  update(id: number, updateWatchlistDto: UpdateWatchlistDto) {
    return `This action updates a #${id} watchlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} watchlist`;
  }
}
