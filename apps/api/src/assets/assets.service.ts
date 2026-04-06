import { Injectable } from "@nestjs/common";
import { AssetResponseDto } from "./assets.dto";

@Injectable()
export class AssetsService {
  findAll(): Promise<AssetResponseDto[]> {
    return `This action returns all assets`;
  }

  findOne(id: string): Promise<AssetResponseDto> {
    return `This action returns a #${id} asset`;
  }

  remove(id: string): Promise<AssetResponseDto> {
    return `This action removes a #${id} asset`;
  }
}
