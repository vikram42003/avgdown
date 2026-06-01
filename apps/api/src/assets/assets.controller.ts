import { Controller, Get, Param, Delete, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AssetsService } from "./assets.service";
import { DevOnlyGuard } from "../common/guards/dev-only/dev-only.guard";
import { AssetResponseDto, AssetSearchResultDto } from "./assets.dto";

@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Returns all assets (kept for backward compat, e.g. Swagger).
   */
  @Get()
  findAll(): Promise<AssetResponseDto[]> {
    return this.assetsService.findAll();
  }

  /**
   * Returns only the curated "popular" assets shown on the browse page.
   */
  @Get("popular")
  findPopular(): Promise<AssetResponseDto[]> {
    return this.assetsService.findPopular();
  }

  /**
   * Searches Yahoo Finance for assets matching the query.
   * Results include `existingAssetId` when the asset already exists in our DB.
   */
  @UseGuards(AuthGuard("jwt"))
  @Get("search")
  search(@Query("q") query: string): Promise<AssetSearchResultDto[]> {
    if (!query || query.trim().length === 0) {
      return Promise.resolve([]);
    }
    return this.assetsService.search(query.trim());
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<AssetResponseDto> {
    return this.assetsService.findOne(id);
  }

  @UseGuards(DevOnlyGuard)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<AssetResponseDto> {
    return this.assetsService.remove(id);
  }
}
