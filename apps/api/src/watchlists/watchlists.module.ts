import { Module } from "@nestjs/common";
import { WatchlistsService } from "./watchlists.service";
import { WatchlistsController } from "./watchlists.controller";
import { AssetsModule } from "../assets/assets.module";

@Module({
  imports: [AssetsModule],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
})
export class WatchlistsModule {}
