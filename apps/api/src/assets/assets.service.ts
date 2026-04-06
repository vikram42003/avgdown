import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { AssetResponseDto } from "./assets.dto";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import { prisma } from "@avgdown/db";

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AssetResponseDto[]> {
    return await this.prisma.asset.findMany();
  }

  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (asset === null) {
      this.logger.warn(`Lookup failed: Asset with id ${id} not found`);
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async remove(id: string): Promise<AssetResponseDto> {
    return await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id } });
      if (asset === null) {
        this.logger.warn(`Lookup failed: Asset with id ${id} not found`);
        throw new NotFoundException(`Asset with id ${id} not found`);
      }

      const deletedAsset = await tx.asset.delete({ where: { id } });
      this.logger.log(`Asset successfully deleted: ${deletedAsset.symbol} (ID: ${id})`);

      return deletedAsset;
    });
  }
}
