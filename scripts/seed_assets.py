"""
Seed script for assets table.
Uses yfinance to fetch real metadata and asyncpg to write to Postgres directly.

Usage:
    source .venv/bin/activate
    pip install yfinance asyncpg python-dotenv
    python scripts/seed_assets.py
"""

import asyncio
import os
import yfinance as yf
import asyncpg
from dotenv import load_dotenv

# Loads DIRECT_URL from your .env.local at project root
load_dotenv(".env.local")

# The list of symbols we want to seed.
# Each entry maps to a row in the `assets` table.
# symbol      — the Yahoo Finance symbol (e.g. AAPL, RELIANCE.NS, BTC-USD)
# exchange    — must match your Exchange enum in schema.prisma
# asset_type  — must match your AssetType enum (STOCK, CRYPTO, ETF)
SYMBOLS = [
    # --- US Stocks ---
    {"symbol": "AAPL",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "TSLA",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "NVDA",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "MSFT",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "AMZN",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "GOOGL",      "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "META",       "exchange": "NASDAQ",  "asset_type": "STOCK"},
    {"symbol": "JPM",        "exchange": "NYSE",    "asset_type": "STOCK"},
    {"symbol": "BAC",        "exchange": "NYSE",    "asset_type": "STOCK"},
    {"symbol": "KO",         "exchange": "NYSE",    "asset_type": "STOCK"},

    # --- ETFs ---
    {"symbol": "SPY",        "exchange": "NYSE",    "asset_type": "ETF"},
    {"symbol": "QQQ",        "exchange": "NASDAQ",  "asset_type": "ETF"},
    {"symbol": "VTI",        "exchange": "NYSE",    "asset_type": "ETF"},

    # --- Crypto ---
    {"symbol": "BTC-USD",    "exchange": "BINANCE", "asset_type": "CRYPTO"},
    {"symbol": "ETH-USD",    "exchange": "BINANCE", "asset_type": "CRYPTO"},
    {"symbol": "SOL-USD",    "exchange": "BINANCE", "asset_type": "CRYPTO"},

    # --- Indian Stocks (NSE suffix: .NS) ---
    {"symbol": "RELIANCE.NS","exchange": "NSE",     "asset_type": "STOCK"},
    {"symbol": "TCS.NS",     "exchange": "NSE",     "asset_type": "STOCK"},
    {"symbol": "INFY.NS",    "exchange": "NSE",     "asset_type": "STOCK"},
    {"symbol": "HDFCBANK.NS","exchange": "NSE",     "asset_type": "STOCK"},
    {"symbol": "ICICIBANK.NS","exchange": "NSE",    "asset_type": "STOCK"},
]


async def seed(db_url: str):
    conn = await asyncpg.connect(db_url, timeout=30)
    print(f"🌱 Seeding {len(SYMBOLS)} assets...\n")

    for item in SYMBOLS:
        symbol = item["symbol"]
        try:
            # yfinance.Ticker.info gives us official name, sector, etc.
            info = yf.Ticker(symbol).info
            name = info.get("longName") or info.get("shortName") or symbol

            # We use an UPSERT: if the (symbol, exchange) pair already exists,
            # only update the name. This is idempotent — safe to re-run anytime.
            await conn.execute(
                """
                INSERT INTO assets (id, symbol, exchange, name, asset_type, created_at)
                VALUES (gen_random_uuid(), $1, $2::\"Exchange\", $3, $4::\"AssetType\", now())
                ON CONFLICT (symbol, exchange) DO UPDATE SET name = EXCLUDED.name
                """,
                symbol, item["exchange"], name, item["asset_type"]
            )
            print(f"  ✅ {symbol:<20} → {name}")

        except Exception as e:
            print(f"  ❌ {symbol:<20} → FAILED: {e}")

    await conn.close()
    print("\n✨ Seeding complete!")


if __name__ == "__main__":
    url = os.getenv("DIRECT_URL")
    if not url:
        raise RuntimeError("DIRECT_URL not found in .env.local — cannot connect to DB")
    asyncio.run(seed(url))
