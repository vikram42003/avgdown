import asyncio
import yfinance as yf
from prisma import Prisma # type: ignore

# The list of symbols we want to seed
# Note: Different symbols on Yahoo have different suffixes (.NS for NSE, -USD for Crypto)
SYMBOLS = [
    # US Stocks
    {"symbol": "AAPL", "exchange": "NASDAQ", "type": "STOCK"},
    {"symbol": "TSLA", "exchange": "NASDAQ", "type": "STOCK"},
    {"symbol": "NVDA", "exchange": "NASDAQ", "type": "STOCK"},
    {"symbol": "MSFT", "exchange": "NASDAQ", "type": "STOCK"},
    {"symbol": "AMZN", "exchange": "NASDAQ", "type": "STOCK"},
    
    # Crypto
    {"symbol": "BTC-USD", "exchange": "BINANCE", "type": "CRYPTO"},
    {"symbol": "ETH-USD", "exchange": "BINANCE", "type": "CRYPTO"},
    {"symbol": "SOL-USD", "exchange": "BINANCE", "type": "CRYPTO"},
    
    # Indian Stocks (NSE)
    {"symbol": "RELIANCE.NS", "exchange": "NSE", "type": "STOCK"},
    {"symbol": "TCS.NS", "exchange": "NSE", "type": "STOCK"},
    {"symbol": "INFY.NS", "exchange": "NSE", "type": "STOCK"},
    {"symbol": "HDFCBANK.NS", "exchange": "NSE", "type": "STOCK"},

    # ETFs / Indices
    {"symbol": "SPY", "exchange": "NYSE", "type": "ETF"},
    {"symbol": "QQQ", "exchange": "NASDAQ", "type": "ETF"},
]

async def main():
    db = Prisma()
    await db.connect()

    print(f"🌱 Starting seed for {len(SYMBOLS)} assets...")

    for item in SYMBOLS:
        symbol = item["symbol"]
        print(f"📦 Fetching metadata for {symbol}...")
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # yf.info contains 'longName', 'sector', 'industry' etc.
            name = info.get("longName") or info.get("shortName") or symbol
            
            await db.asset.upsert(
                where={
                    "symbol_exchange": {
                        "symbol": symbol,
                        "exchange": item["exchange"]
                    }
                },
                data={
                    "create": {
                        "symbol": symbol,
                        "exchange": item["exchange"],
                        "name": name,
                        "assetType": item["type"]
                    },
                    "update": {
                        "name": name
                    }
                }
            )
            print(f"✅ Seeding successful for {symbol} ({name})")
            
        except Exception as e:
            print(f"❌ Failed to seed {symbol}: {str(e)}")

    await db.disconnect()
    print("✨ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
