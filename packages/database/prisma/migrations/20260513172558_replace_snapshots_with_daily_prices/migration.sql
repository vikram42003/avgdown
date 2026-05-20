/*
  Warnings:

  - You are about to drop the `daily_sma_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price_snapshots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "daily_sma_snapshots" DROP CONSTRAINT "daily_sma_snapshots_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "price_snapshots" DROP CONSTRAINT "price_snapshots_asset_id_fkey";

-- DropTable
DROP TABLE "daily_sma_snapshots";

-- DropTable
DROP TABLE "price_snapshots";

-- CreateTable
CREATE TABLE "daily_price_snapshots" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "close" DECIMAL(18,8) NOT NULL,
    "date" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'yfinance',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_price_snapshots_asset_id_date_idx" ON "daily_price_snapshots"("asset_id", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_price_snapshots_asset_id_date_key" ON "daily_price_snapshots"("asset_id", "date");

-- AddForeignKey
ALTER TABLE "daily_price_snapshots" ADD CONSTRAINT "daily_price_snapshots_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
