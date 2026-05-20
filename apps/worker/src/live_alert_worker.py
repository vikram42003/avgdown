import logging
from decimal import Decimal
from datetime import datetime, timezone
from typing import List

from models import WatchlistEntryProjection, TriggeredAlert
from collections import defaultdict

from db import (
    add_missed_fetch_bulk,
    get_watchlist_entries,
    add_alerts_bulk,
    mark_alerts_as_delivered_by_id
)

logger = logging.getLogger(__name__)
from providers.yf import fetch_prices_bulk
from utils import map_symbol_exchange, filter_inactive_markets, filter_alerts
from logic.sma import sma_val_below_average
from logic.alerts import handle_alerts


def process_watchlist_entries(
    watchlist_entries: list[WatchlistEntryProjection],
) -> tuple[dict[str, list[WatchlistEntryProjection]], list[str]]:
    """
    Groups watchlist entries by asset and filters out inactive markets.

    Args:
        watchlist_entries: List of watchlist entries joined with asset data.

    Returns:
        A tuple containing:
        - A dictionary mapping symbol strings to their watchlist entries.
        - A list of active symbol strings whose markets are currently open.
    """

    # group entries by asset to build pairs for our market filter
    entries_by_asset = defaultdict(list)
    symbol_exchange_pairs = []
    seen_pairs = set()
    for entry in watchlist_entries:
        symbol_string = map_symbol_exchange(entry.asset_symbol, entry.asset_exchange)
        entries_by_asset[symbol_string].append(entry)
        pair = (symbol_string, entry.asset_exchange)
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            symbol_exchange_pairs.append(pair)

    # filter out assets whose markets are closed right now
    active_symbols = filter_inactive_markets(symbol_exchange_pairs)
    logger.debug("Active symbols count: %d", len(active_symbols))

    # return as a normal dict instead of defaultdict
    return dict(entries_by_asset), active_symbols


def process_alpha_vantage_backfill() -> None:
    """
    Runs the hourly Alpha Vantage backfill sequence to retry missed fetches.
    """
    now = datetime.now(timezone.utc)
    if now.minute <= 3 or now.minute >= 57:
        logger.info(
            "Running hourly Alpha Vantage backfill sequence. This is a placeholder path and will run once implemented."
        )
        # 1. Fetch unresolved missed fetches from DB
        #    (SELECT DISTINCT asset_id FROM missed_fetches WHERE resolved = false)

        # 2. Extract their symbols

        # 3. Hit Alpha Vantage in a bulk fetch just for those symbols

        # 4. Save successful prices AND mark them as resolved in missed_fetches
    else:
        logger.debug(
            "Skipping Alpha Vantage backfill because current minute is %d. It only runs around the top/bottom of the hour.",
            now.minute,
        )


def process_sma(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    prices_by_asset_id: dict[str, Decimal],
) -> dict[str, dict[str, TriggeredAlert]]:
    """
    Checks current prices against the provisional daily SMA and builds alerts.

    Args:
        entries_by_symbol: Dictionary mapping symbols to their watchlist entries.
        prices_by_asset_id: Dictionary mapping asset IDs to their current prices.

    Returns:
        A nested dictionary mapping user IDs to their triggered alerts.
    """
    SMA_VAL_BELOW_AVERAGE_DEVIATION_THRESHOLD = 0.02

    alerts_by_user: dict[str, dict[str, TriggeredAlert]] = defaultdict(dict)

    sma_val_below_average(
        entries_by_symbol,
        prices_by_asset_id,
        alerts_by_user,
        SMA_VAL_BELOW_AVERAGE_DEVIATION_THRESHOLD,
    )

    return dict(alerts_by_user)


def lambda_handler(event: dict, context: object) -> None:
    """
    Main entry point for the live alert worker.

    Args:
        event: Lambda event payload.
        context: Lambda execution context.
    """
    logger.info("Starting live alert worker")

    # grab all active watchlist entries from the db
    watchlist_entries = get_watchlist_entries()
    logger.info("Fetched %d active watchlist entries from DB", len(watchlist_entries))

    # group them up and toss out the ones where markets are closed
    entries_by_symbol, active_symbols = process_watchlist_entries(watchlist_entries)
    logger.info("After market filtering, %d active symbols remain", len(active_symbols))

    # fetch the latest prices for whatever's left
    prices_by_symbol, failed_symbols = fetch_prices_bulk(active_symbols)
    logger.info("Fetched prices for %d symbols", len(prices_by_symbol))
    if failed_symbols:
        sanitized_errors = [
            f"{symbol}: {str(error).splitlines()[0][:80]}"
            for symbol, error in failed_symbols.items()
        ]
        logger.warning(
            "Price fetch failures (%d) for symbols: %s; errors: %s",
            len(failed_symbols),
            list(failed_symbols.keys()),
            sanitized_errors,
        )

    # log any failures so we can retry them later with alpha vantage
    missed_fetches_to_insert = []
    for s, error_msg in failed_symbols.items():
        for entry in entries_by_symbol[s]:
            missed_fetches_to_insert.append((entry.asset_id, "yfinance", error_msg))

    logger.info("Prepared %d missed_fetch records", len(missed_fetches_to_insert))
    if missed_fetches_to_insert:
        add_missed_fetch_bulk(missed_fetches_to_insert)

    process_alpha_vantage_backfill()

    # build a flat dictionary of prices for the sma check
    prices_by_asset_id: dict[str, Decimal] = {}
    for s, p in prices_by_symbol.items():
        # multiple entries for the same symbol share the same asset_id
        asset_ids = {entry.asset_id for entry in entries_by_symbol[s]}
        for aid in asset_ids:
            prices_by_asset_id[aid] = Decimal(str(p))

    # check prices against the daily sma to see if anything triggered
    alerts_by_user = process_sma(entries_by_symbol, prices_by_asset_id)

    # toss out any alerts for entries that already went off today
    alerts_by_user = filter_alerts(alerts_by_user)
    filtered_alert_count = sum(len(user_alerts) for user_alerts in alerts_by_user.values())
    logger.info(
        "Alerts remaining after filtering already-alerted entries: %d",
        filtered_alert_count,
    )

    # bulk insert the new alerts as undelivered and get their ids
    flat_alerts_to_insert: List[TriggeredAlert] = []
    for user_alerts in alerts_by_user.values():
        flat_alerts_to_insert.extend(user_alerts.values())

    logger.info("Inserting %d alerts into DB", len(flat_alerts_to_insert))
    entry_to_alert_id = add_alerts_bulk(flat_alerts_to_insert)

    # dispatch emails and webhooks, then mark the successful ones as delivered
    handle_alerts(alerts_by_user, entry_to_alert_id)
    logger.info("Finished live alert worker")


if __name__ == "__main__":
    lambda_handler({}, {})
