from datetime import datetime, timezone
from db import add_price_snapshots_bulk, add_missed_fetch_bulk, get_watchlist_entries
from providers.yf import fetch_prices_bulk
from utils import map_symbol_exchange, filter_inactive_markets
from collections import defaultdict


def process_watchlist_entries(watchlist_entries):
    """Groups watchlist entries by asset and filters for active markets"""

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

    return entries_by_asset, active_symbols


def process_alpha_vantage_backfill():
    now = datetime.now(timezone.utc)
    if now.minute <= 3 or now.minute >= 57:
        print(
            "Running hourly Alpha Vantage backfill sequence...is what we'd do if this was implemented, gonna do it right after finishing up with the project"
        )
        # 1. Fetch unresolved missed fetches from DB
        #    (SELECT DISTINCT asset_id FROM missed_fetches WHERE resolved = false)

        # 2. Extract their symbols

        # 3. Hit Alpha Vantage in a bulk fetch just for those symbols

        # 4. Save successful prices AND mark them as resolved in missed_fetches


if __name__ == "__main__":
    # Fetch all watchlist entries (With joins on Assets and Users, since they'll be used next)
    watchlist_entries = get_watchlist_entries()

    # Group entries by asset and filter for active markets
    entries_by_asset, active_symbols = process_watchlist_entries(watchlist_entries)

    # Fetch the newest prices for all the active assets in bulk
    # returns symbol_exchane_pairs to latest price map
    symbol_exchange_to_price, failed_symbols = fetch_prices_bulk(active_symbols)

    # Bulk update prices in the db
    price_snapshots_to_insert = []
    for s, p in symbol_exchange_to_price.items():
        asset_id = entries_by_asset[s][0].asset_id
        price_snapshots_to_insert.append((asset_id, p))

    add_price_snapshots_bulk(price_snapshots_to_insert)

    # Bulk update missedFetch for the failed_symbols
    missed_fetches_to_insert = []
    for s, error_msg in failed_symbols.items():
        asset_id = entries_by_asset[s][0].asset_id
        missed_fetches_to_insert.append((asset_id, "yfinance", error_msg))

    if missed_fetches_to_insert:
        add_missed_fetch_bulk(missed_fetches_to_insert)

    # Process the failed fetches with alpha vantage, only if the lambda was called close to an hour time value
    process_alpha_vantage_backfill()

    # For each asset, get the max sma period asked by a user, with that we can calculate sma for that asset for any user whose sma <= max
    asset_id_to_highest_sma = {}
    for entries in entries_by_asset.values():
        asset_id = entries[0].asset_id
        asset_id_to_highest_sma[asset_id] = max(entry.sma_period for entry in entries)

    # Get price snapshots for the assets in bulk
    get_price_snapshots_bulk(asset_id_to_highest_sma.keys())


"""
Well, imagine we do have a watchlist in our db, now what the worker must do is
fetch all the watchlist entries that are active first and like track all the assets we have to fetch right now
now for that assetList, fetch the current price for each, and save that to the database
SPECIAL CASE: If the fetch was unsuccessful then we put that into MissedFetch list
Either way, we then fetch the last n snapshots of the price and then calculate the sma

Now, for each watchlist entry, we check if the sma has crossed the trigger price
If it has, we then check if the alert has already been sent
If not, we send the alert and mark it as sent




we have entries_by_asset[symbol] = [list of different users]
now to see which period's sma we have to like query for, we find the largest sma period to find out
how much data we have to fetch

and then calculate the smas based on that for each user individually, its a math calculation so no need to batch it, it'll be quick as is
after that we put that into alerts to send, and then send out alerts and then create the alert entries in the db in bulk
"""
