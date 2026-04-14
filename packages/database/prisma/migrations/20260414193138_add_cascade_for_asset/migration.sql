-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_watchlist_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "missed_fetches" DROP CONSTRAINT "missed_fetches_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "price_snapshots" DROP CONSTRAINT "price_snapshots_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_entries" DROP CONSTRAINT "watchlist_entries_asset_id_fkey";

-- AddForeignKey
ALTER TABLE "watchlist_entries" ADD CONSTRAINT "watchlist_entries_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watchlist_entry_id_fkey" FOREIGN KEY ("watchlist_entry_id") REFERENCES "watchlist_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missed_fetches" ADD CONSTRAINT "missed_fetches_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
