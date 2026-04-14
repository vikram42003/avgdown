import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { AssetResponseDto } from "./assets.dto";
import { PrismaService } from "src/common/database/prisma/prisma.service";

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
    return await this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id } });
      if (asset === null) {
        this.logger.warn(`Lookup failed: Asset with id ${id} not found`);
        throw new NotFoundException(`Asset with id ${id} not found`);
      }

      this.logger.log(`[Asset Deletion Protocol Initiated] Target: ${asset.symbol} (ID: ${id})`);

      const [alertsCount, weCount, psCount, mfCount] = await Promise.all([
        tx.alert.count({ where: { watchlistEntry: { assetId: id } } }),
        tx.watchlistEntry.count({ where: { assetId: id } }),
        tx.priceSnapshot.count({ where: { assetId: id } }),
        tx.missedFetch.count({ where: { assetId: id } }),
      ]);

      this.logger.warn(`Cascading delete will permanently remove:`);
      this.logger.warn(` - ${alertsCount} Alerts`);
      this.logger.warn(` - ${weCount} Watchlist Entries`);
      this.logger.warn(` - ${psCount} Price Snapshots`);
      this.logger.warn(` - ${mfCount} Missed Fetches`);

      const deletedAsset = await tx.asset.delete({ where: { id } });
      this.logger.log(`[Asset Deletion Complete] Asset successfully deleted: ${deletedAsset.symbol} (ID: ${id})`);

      return deletedAsset;
    });
  }
}
