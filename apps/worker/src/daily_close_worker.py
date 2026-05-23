import logging
from datetime import date, timedelta
from decimal import Decimal

from db import (
    cleanup_old_data,
    get_daily_price_snapshot_coverage,
    get_watchlist_entries,
    upsert_daily_price_snapshots_bulk,
)
from models import WatchlistEntryProjection
from providers.yf import HISTORY_WINDOW, fetch_daily_closes_bulk
from utils import map_symbol_exchange

logger = logging.getLogger(__name__)


def group_entries_by_symbol(
    watchlist_entries: list[WatchlistEntryProjection],
) -> tuple[dict[str, set[str]], dict[str, int], list[str]]:
    """
    Groups active watchlist entries by their corresponding yfinance symbol.

    Determines unique asset IDs and calculates the maximum SMA period required
    per symbol (since multiple watchlists for the same symbol can require different periods).

    Returns:
        A tuple of (asset_ids_by_symbol, max_period_by_symbol, sorted_asset_ids).
    """
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

    sorted_asset_ids = sorted({asset_id for ids in asset_ids_by_symbol.values() for asset_id in ids})

    return asset_ids_by_symbol, max_period_by_symbol, sorted_asset_ids


def filter_stale_symbols(
    asset_ids_by_symbol: dict[str, set[str]],
    max_period_by_symbol: dict[str, int],
    coverage_by_asset_id: dict[str, tuple[int, date | None]],
) -> tuple[list[str], dict[str, int], int]:
    """
    Checks DB coverage to identify which symbols are stale or missing historical daily closes.

    If all asset IDs associated with a symbol have sufficient recent historical entries
    (at least HISTORY_WINDOW + max_period - 1 entries, updated within the last 3 days),
    hydration for that symbol is skipped.

    Returns:
        A tuple of (symbols_to_fetch, required_closes_by_symbol, skipped_count).
    """
    today = date.today()
    stale_before = today - timedelta(days=3)
    symbols_to_fetch = []
    required_closes_by_symbol = {}
    skipped_count = 0

    for symbol, asset_ids in asset_ids_by_symbol.items():
        required_closes = HISTORY_WINDOW + max_period_by_symbol[symbol] - 1
        required_closes_by_symbol[symbol] = required_closes

        has_sufficient_coverage = True
        for asset_id in asset_ids:
            row_count, latest_date = coverage_by_asset_id.get(asset_id, (0, None))
            if row_count < required_closes or latest_date is None or latest_date < stale_before:
                has_sufficient_coverage = False
                break

        if has_sufficient_coverage:
            skipped_count += 1
        else:
            symbols_to_fetch.append(symbol)

    return symbols_to_fetch, required_closes_by_symbol, skipped_count


def hydrate_and_format_closes(
    symbols_to_fetch: list[str],
    required_closes_by_symbol: dict[str, int],
    asset_ids_by_symbol: dict[str, set[str]],
) -> list[tuple[str, date, Decimal, str]]:
    """
    Hydrates daily closes from yfinance for the stale symbols and formats them for database insert.

    Returns:
        A list of flattened daily price snapshot tuples: (asset_id, date, close_price, source).
    """
    fetch_requirements = {symbol: required_closes_by_symbol[symbol] for symbol in symbols_to_fetch}
    max_required_closes = max(fetch_requirements.values())

    logger.info(
        "Hydrating daily closes for %d symbols (need up to %d closes)...",
        len(symbols_to_fetch),
        max_required_closes,
    )

    daily_closes, failed_symbols = fetch_daily_closes_bulk(
        symbols_to_fetch,
        fetch_requirements,
    )

    if failed_symbols:
        logger.warning("Failed to fetch daily closes for: %s", failed_symbols)

    rows_to_upsert = []
    for symbol, series in daily_closes.items():
        required_count = required_closes_by_symbol[symbol]
        for asset_id in asset_ids_by_symbol[symbol]:
            # Take only the last N required closes from the fetched series
            for snapshot_date, close in series[-required_count:]:
                rows_to_upsert.append((asset_id, snapshot_date, Decimal(str(close)), "yfinance"))

    return rows_to_upsert


def lambda_handler(event: dict, context: object) -> None:
    """
    Daily Lambda: hydrates completed daily close prices from yfinance for every
    active asset. SMA values are computed from these closes by the API and live
    alert worker instead of being stored directly.

    Runs once per day via EventBridge
    """
    logger.info("Starting daily close worker")

    # Clean up snapshot, alert, and failed fetch logs older than 1 year
    cleanup_old_data()

    watchlist_entries = get_watchlist_entries()

    if not watchlist_entries:
        logger.info("No active watchlist entries - nothing to compute.")
        logger.info("Finished daily close worker")
        return

    logger.info("Found %d active watchlist entries", len(watchlist_entries))

    # Group active watchlists by their yfinance symbol
    asset_ids_by_symbol, max_period_by_symbol, asset_ids = group_entries_by_symbol(watchlist_entries)

    # Get database coverage for the active asset IDs
    coverage = get_daily_price_snapshot_coverage(asset_ids)

    # Identify which symbols need hydration
    symbols_to_fetch, required_closes_by_symbol, skipped = filter_stale_symbols(
        asset_ids_by_symbol, max_period_by_symbol, coverage
    )

    # Fetch daily closes and format them for upsert
    if symbols_to_fetch:
        rows_to_upsert = hydrate_and_format_closes(symbols_to_fetch, required_closes_by_symbol, asset_ids_by_symbol)
        if rows_to_upsert:
            logger.info("Preparing to upsert %d daily close rows", len(rows_to_upsert))
            upsert_daily_price_snapshots_bulk(rows_to_upsert)
            logger.info("Upserted %d daily close rows.", len(rows_to_upsert))
    else:
        logger.info("Daily close hydration skipped: %d symbols already have enough recent data.", skipped)

    logger.info("Finished daily close worker")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    lambda_handler({}, {})
