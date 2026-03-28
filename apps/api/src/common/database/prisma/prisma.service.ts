import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { prisma } from "@avgdown/db";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  public readonly db: typeof prisma = prisma;

  async onModuleInit() {
    this.logger.log("PrismaService initialized and connecting...");
    await this.db.$connect();
  }

  async onModuleDestroy() {
    this.logger.log("PrismaService destroyed and disconnecting...");
    await this.db.$disconnect();
  }
}
