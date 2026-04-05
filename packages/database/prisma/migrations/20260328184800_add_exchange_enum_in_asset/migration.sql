/*
  Warnings:

  - Changed the type of `exchange` on the `assets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Exchange" AS ENUM ('NASDAQ', 'NYSE', 'NSE', 'BSE', 'BINANCE', 'COINBASE');

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "exchange",
ADD COLUMN     "exchange" "Exchange" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assets_symbol_exchange_key" ON "assets"("symbol", "exchange");
