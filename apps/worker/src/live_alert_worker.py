from decimal import Decimal
from datetime import datetime, timezone
from typing import List

from models import WatchlistEntryProjection, TriggeredAlert
from collections import defaultdict
from providers.ses import send_alerts_via_email

from db import (
    add_missed_fetch_bulk,
    get_watchlist_entries,
    add_alerts_bulk,
    mark_alerts_as_delivered
)
from providers.yf import fetch_prices_bulk
from utils import map_symbol_exchange, filter_inactive_markets, filter_alerts
from logic.sma import sma_val_below_average


def process_watchlist_entries(
    watchlist_entries: list[WatchlistEntryProjection],
) -> tuple[dict[str, list[WatchlistEntryProjection]], list[str]]:
    """Groups watchlist entries by asset and filters for active markets"""

    # Group entries by asset, building (ticker, exchange) pairs for the market filter
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

    # Filter out assets whose markets are closed right now
    active_symbols = filter_inactive_markets(symbol_exchange_pairs)
    print(f"Active symbols ({len(active_symbols)}): {active_symbols}")

    # change entries_by_asset from defaultdict to dict
    return dict(entries_by_asset), active_symbols


def process_alpha_vantage_backfill() -> None:
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
    else:
        print(
            f"Skipping Alpha Vantage backfill because current minute is {now.minute}."
            " It only runs around the top/bottom of the hour."
        )


def process_sma(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    prices_by_asset_id: dict[str, Decimal],
) -> dict[str, dict[str, TriggeredAlert]]:
    """Checks current prices against the provisional daily SMA and builds alerts"""
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
    print("Starting live alert worker")

    # Fetch all watchlist entries (with joins on Assets and Users)
    watchlist_entries = get_watchlist_entries()
    print(f"Fetched {len(watchlist_entries)} active watchlist entries from DB")

    # Group entries by symbol and filter out symbols whose markets are inactive
    entries_by_symbol, active_symbols = process_watchlist_entries(watchlist_entries)
    print(f"After market filtering, {len(active_symbols)} active symbols remain")

    # Fetch the newest prices for all the active assets in bulk
    prices_by_symbol, failed_symbols = fetch_prices_bulk(active_symbols)
    print(f"Fetched prices for {len(prices_by_symbol)} symbols")
    if failed_symbols:
        print(f"Price fetch failures: {failed_symbols}")

    # Record any failed fetches for the Alpha Vantage backfill
    missed_fetches_to_insert = []
    for s, error_msg in failed_symbols.items():
        for entry in entries_by_symbol[s]:
            missed_fetches_to_insert.append((entry.asset_id, "yfinance", error_msg))

    print(f"Prepared {len(missed_fetches_to_insert)} missed_fetch records")
    if missed_fetches_to_insert:
        add_missed_fetch_bulk(missed_fetches_to_insert)

    process_alpha_vantage_backfill()

    # Build a flat dict of asset_id -> current Decimal price for the SMA comparison
    prices_by_asset_id: dict[str, Decimal] = {}
    for s, p in prices_by_symbol.items():
        for entry in entries_by_symbol[s]:
            prices_by_asset_id[entry.asset_id] = Decimal(str(p))

    # Compare prices against an in-memory provisional daily SMA
    alerts_by_user = process_sma(entries_by_symbol, prices_by_asset_id)

    # Filter out entries that already have any alert row today
    alerts_by_user = filter_alerts(alerts_by_user)
    filtered_alert_count = sum(len(user_alerts) for user_alerts in alerts_by_user.values())
    print(f"Alerts remaining after filtering already-alerted entries: {filtered_alert_count}")

    # Bulk add alerts to DB with delivered=False
    flat_alerts_to_insert: List[TriggeredAlert] = []
    for user_alerts in alerts_by_user.values():
        flat_alerts_to_insert.extend(user_alerts.values())

    print(f"Inserting {len(flat_alerts_to_insert)} alerts into DB")
    add_alerts_bulk(flat_alerts_to_insert)

    # Send alerts and mark successful ones as delivered
    watchlist_ids_for_alerts_successfully_sent = send_alerts_via_email(alerts_by_user)
    print(f"Alerts sent successfully for {len(watchlist_ids_for_alerts_successfully_sent)} watchlist entries")
    mark_alerts_as_delivered(watchlist_ids_for_alerts_successfully_sent)
    print("Finished live alert worker")


if __name__ == "__main__":
    lambda_handler({}, {})
