-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CRYPTO', 'ETF');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "webhook_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "sma_period" INTEGER NOT NULL DEFAULT 20,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "watchlist_entry_id" TEXT NOT NULL,
    "triggered_price" DECIMAL(18,8) NOT NULL,
    "sma_value" DECIMAL(18,8) NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_symbol_exchange_key" ON "assets"("symbol", "exchange");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_entries_user_id_asset_id_key" ON "watchlist_entries"("user_id", "asset_id");

-- CreateIndex
CREATE INDEX "price_snapshots_asset_id_fetched_at_idx" ON "price_snapshots"("asset_id", "fetched_at" DESC);

-- AddForeignKey
ALTER TABLE "watchlist_entries" ADD CONSTRAINT "watchlist_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_entries" ADD CONSTRAINT "watchlist_entries_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watchlist_entry_id_fkey" FOREIGN KEY ("watchlist_entry_id") REFERENCES "watchlist_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
