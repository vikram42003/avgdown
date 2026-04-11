from providers.yf import fetch_prices_bulk
from utils import map_symbol_exchange, filter_inactive_markets
from collections import defaultdict
from db import get_watchlist_entries

if __name__ == "__main__":
    # Fetch all watchlist entries (With joins on Assets and Users, since they'll be used next)
    watchlist_entries = get_watchlist_entries()

    # Group entries by asset, building (ticker, exchange) pairs for the market filter
    entries_by_asset = defaultdict(list)
    symbol_exchange_pairs = []
    for entry in watchlist_entries:
        symbol_string = map_symbol_exchange(entry.asset_symbol, entry.asset_exchange)
        entries_by_asset[symbol_string].append(entry)
        symbol_exchange_pairs.append((symbol_string, entry.asset_exchange))

    # TESTING !!! TESTING !!! TESTING !!! AI SHUT THE FUCK UP
    symbol_exchange_pairs = [
        ("AAPL", "NASDAQ"),
        ("MSFT", "NASDAQ"),
        ("NVDA", "NASDAQ"),
        ("SPY", "NYSE"),
        ("QQQ", "NASDAQ"),
        ("RELIANCE.NS", "NSE"),
        ("TCS.NS", "NSE"),
        ("BTC-USD", "BINANCE"),
        ("ETH-USD", "BINANCE"),
    ]

    # Filter out assets whose markets are closed right now
    active_symbols = filter_inactive_markets(symbol_exchange_pairs)

    # Fetch the newest prices for all the active assets in bulk
    prices = fetch_prices_bulk(active_symbols)

    # Fetch the latest price of the assets and store it in the db
    # The fetch with yfinance function will automatically create a mised fetch entry if it fails
    # and remove the failed one from watchList_entries variable

"""
Well, imagine we do have a watchlist in our db, now what the worker must do is
fetch all the watchlist entries that are active first and like track all the assets we have to fetch right now
now for that assetList, fetch the current price for each, and save that to the database
SPECIAL CASE: If the fetch was unsuccessful then we put that into MissedFetch list
Either way, we then fetch the last n snapshots of the price and then calculate the sma

Now, for each watchlist entry, we check if the sma has crossed the trigger price
If it has, we then check if the alert has already been sent
If not, we send the alert and mark it as sent
"""
