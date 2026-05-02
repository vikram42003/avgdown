-- CreateTable
CREATE TABLE "daily_sma_snapshots" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "sma_value" DECIMAL(18,8) NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "daily_sma_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_sma_snapshots_asset_id_period_date_idx" ON "daily_sma_snapshots"("asset_id", "period", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_sma_snapshots_asset_id_period_date_key" ON "daily_sma_snapshots"("asset_id", "period", "date");

-- AddForeignKey
ALTER TABLE "daily_sma_snapshots" ADD CONSTRAINT "daily_sma_snapshots_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
