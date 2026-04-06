import { Controller, Get, Param, Delete, UseGuards } from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { DevOnlyGuard } from "src/common/guards/dev-only/dev-only.guard";
import { AssetResponseDto } from "./assets.dto";

@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(): Promise<AssetResponseDto[]> {
    return this.assetsService.findAll();
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
