from datetime import date, timedelta
from decimal import Decimal

from db import (
    get_daily_price_snapshot_coverage,
    get_watchlist_entries,
    upsert_daily_price_snapshots_bulk,
)
from providers.yf import HISTORY_WINDOW, fetch_daily_closes_bulk
from utils import map_symbol_exchange


def sma_worker_handler(event, context):
    """
    Daily Lambda: hydrates completed daily close prices from yfinance for every
    active asset. SMA values are computed from these closes by the API and live
    alert worker instead of being stored directly.

    Runs once per day via EventBridge, ideally ~30 min after the latest
    market close across all exchanges (e.g. 22:00 UTC covers US, EU, and Indian markets).
    """
    watchlist_entries = get_watchlist_entries()

    if not watchlist_entries:
        print("No active watchlist entries — nothing to compute.")
        return

    # Build unique yfinance symbols and track the DB asset IDs/max SMA period
    # behind each symbol. Multiple DB assets can map to the same yfinance symbol.
    asset_ids_by_symbol: dict[str, set[str]] = {}
    max_period_by_symbol: dict[str, int] = {}

    for entry in watchlist_entries:
        yf_symbol = map_symbol_exchange(entry.asset_symbol, entry.asset_exchange)
        if yf_symbol not in asset_ids_by_symbol:
            asset_ids_by_symbol[yf_symbol] = set()
            max_period_by_symbol[yf_symbol] = entry.sma_period
        asset_ids_by_symbol[yf_symbol].add(entry.asset_id)
        max_period_by_symbol[yf_symbol] = max(
            max_period_by_symbol[yf_symbol],
            entry.sma_period,
        )

    asset_ids = sorted({asset_id for ids in asset_ids_by_symbol.values() for asset_id in ids})
    coverage_by_asset_id = get_daily_price_snapshot_coverage(asset_ids)

    today = date.today()
    stale_before = today - timedelta(days=3)
    symbols_to_fetch = []
    required_closes_by_symbol = {}
    skipped = 0

    for symbol, asset_ids_for_symbol in asset_ids_by_symbol.items():
        required_closes = HISTORY_WINDOW + max_period_by_symbol[symbol] - 1
        required_closes_by_symbol[symbol] = required_closes

        has_all_asset_rows = True
        for asset_id in asset_ids_for_symbol:
            row_count, latest_date = coverage_by_asset_id.get(asset_id, (0, None))
            if row_count < required_closes or latest_date is None or latest_date < stale_before:
                has_all_asset_rows = False
                break

        if has_all_asset_rows:
            skipped += 1
        else:
            symbols_to_fetch.append(symbol)

    if not symbols_to_fetch:
        print(f"Daily close hydration skipped: {skipped} symbols already have enough recent data.")
        return

    max_required_closes = max(required_closes_by_symbol[s] for s in symbols_to_fetch)
    print(
        f"Hydrating daily closes for {len(symbols_to_fetch)} symbols "
        f"({skipped} skipped, need up to {max_required_closes} closes)..."
    )

    daily_closes_by_symbol, failed_symbols = fetch_daily_closes_bulk(
        symbols_to_fetch,
        max_required_closes,
    )

    if failed_symbols:
        print(f"Failed to fetch daily closes for: {failed_symbols}")

    # Flatten into (asset_id, date, close, source) rows for bulk upsert.
    rows_to_upsert = []
    for symbol, series in daily_closes_by_symbol.items():
        for asset_id in asset_ids_by_symbol[symbol]:
            for snapshot_date, close in series[-required_closes_by_symbol[symbol]:]:
                rows_to_upsert.append(
                    (asset_id, snapshot_date, Decimal(str(close)), "yfinance")
                )

    upsert_daily_price_snapshots_bulk(rows_to_upsert)
    print(f"Upserted {len(rows_to_upsert)} daily close rows.")


if __name__ == "__main__":
    sma_worker_handler({}, {})
