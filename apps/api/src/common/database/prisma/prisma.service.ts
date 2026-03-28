import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@avgdown/db";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.logger.log("PrismaService initialized and connecting...");
    await this.$connect();
  }

  async onModuleDestroy() {
    this.logger.log("PrismaService destroyed and disconnecting...");
    await this.$disconnect();
  }
}
