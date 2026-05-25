/*
  Warnings:

  - Added the required column `asset_name` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchange` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sma_period` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `alerts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_watchlist_entry_id_fkey";

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "asset_name" TEXT NOT NULL,
ADD COLUMN     "exchange" "Exchange" NOT NULL,
ADD COLUMN     "sma_period" INTEGER NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "watchlist_entry_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "alerts_user_id_created_at_idx" ON "alerts"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "alerts_watchlist_entry_id_created_at_idx" ON "alerts"("watchlist_entry_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watchlist_entry_id_fkey" FOREIGN KEY ("watchlist_entry_id") REFERENCES "watchlist_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
