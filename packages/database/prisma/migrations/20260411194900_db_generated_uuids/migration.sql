-- AlterTable
ALTER TABLE "alerts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "price_snapshots" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "watchlist_entries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "missed_fetches" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'yfinance',
    "error_msg" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missed_fetches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "missed_fetches_asset_id_resolved_idx" ON "missed_fetches"("asset_id", "resolved");

-- CreateIndex
CREATE INDEX "missed_fetches_resolved_created_at_idx" ON "missed_fetches"("resolved", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "missed_fetches" ADD CONSTRAINT "missed_fetches_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
