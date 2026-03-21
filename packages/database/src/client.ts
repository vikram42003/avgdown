import { PrismaClient } from "./generated/client/index.js";
import { PrismaNeon } from "@prisma/adapter-neon";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required but not defined. " +
    "Please set DATABASE_URL in your environment configuration."
  );
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;