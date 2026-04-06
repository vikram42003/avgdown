import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { AssetResponseDto } from "./assets.dto";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import { prisma } from "@avgdown/db";

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<AssetResponseDto[]> {
    return await this.prismaService.asset.findMany();
  }

  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.prismaService.asset.findUnique({ where: { id } });
    if (asset === null) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async remove(id: string): Promise<AssetResponseDto> {
    return await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id } });
      if (asset === null) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }
      return tx.asset.delete({ where: { id } });
    });
  }
}
