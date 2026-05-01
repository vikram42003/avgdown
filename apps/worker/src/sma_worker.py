from decimal import Decimal
from collections import defaultdict
from db import get_watchlist_entries, upsert_daily_sma_bulk
from providers.yf import fetch_daily_sma_bulk
from utils import map_symbol_exchange


def sma_worker_handler(event, context):
    """
    Daily Lambda: fetches a rolling daily SMA series from yfinance for every
    active (asset, sma_period) pair and upserts it into daily_sma_snapshots.

    Runs once per day via EventBridge, ideally ~30 min after the latest
    market close across all exchanges (e.g. 22:00 UTC covers US, EU, and Indian markets).
    """
    watchlist_entries = get_watchlist_entries()

    if not watchlist_entries:
        print("No active watchlist entries — nothing to compute.")
        return

    # Build the unique (yf_symbol, period) pairs and track asset_id per symbol
    asset_id_by_symbol: dict[str, str] = {}
    seen: set[tuple[str, int]] = set()
    symbol_period_pairs: list[tuple[str, int]] = []

    for entry in watchlist_entries:
        yf_symbol = map_symbol_exchange(entry.asset_symbol, entry.asset_exchange)
        asset_id_by_symbol[yf_symbol] = entry.asset_id
        pair = (yf_symbol, entry.sma_period)
        if pair not in seen:
            seen.add(pair)
            symbol_period_pairs.append(pair)

    print(f"Computing daily SMA for {len(symbol_period_pairs)} (symbol, period) pairs...")

    sma_series_by_pair, failed_pairs = fetch_daily_sma_bulk(symbol_period_pairs)

    if failed_pairs:
        print(f"Failed to fetch SMA for: {failed_pairs}")

    # Flatten into (asset_id, period, date, sma_value) rows for the bulk upsert
    rows_to_upsert = []
    for (symbol, period), series in sma_series_by_pair.items():
        asset_id = asset_id_by_symbol[symbol]
        for date, sma_val in series:
            rows_to_upsert.append((asset_id, period, date, sma_val))

    upsert_daily_sma_bulk(rows_to_upsert)
    print(f"Upserted {len(rows_to_upsert)} daily SMA rows.")


if __name__ == "__main__":
    sma_worker_handler({}, {})
