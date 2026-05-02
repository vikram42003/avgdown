from decimal import Decimal
from datetime import datetime, timezone
from models import WatchlistEntryProjection, TriggeredAlert
from collections import defaultdict
from providers.ses import send_alerts_via_email

from db import (
    add_price_snapshots_bulk,
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
    for entry in watchlist_entries:
        symbol_string = map_symbol_exchange(entry.asset_symbol, entry.asset_exchange)
        entries_by_asset[symbol_string].append(entry)
        symbol_exchange_pairs.append((symbol_string, entry.asset_exchange))

    # Filter out assets whose markets are closed right now
    active_symbols = filter_inactive_markets(symbol_exchange_pairs)

    # change entries_by_asset from defaultdict to dict
    return dict(entries_by_asset), active_symbols


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


def process_sma(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    prices_by_asset_id: dict[str, Decimal],
) -> dict[str, dict[str, TriggeredAlert]]:
    """Checks current prices against today's daily SMA and builds alerts"""
    SMA_VAL_BELOW_AVERAGE_DEVIATION_THRESHOLD = 0.02

    alerts_by_user: dict[str, dict[str, TriggeredAlert]] = defaultdict(dict)

    sma_val_below_average(
        entries_by_symbol,
        prices_by_asset_id,
        alerts_by_user,
        SMA_VAL_BELOW_AVERAGE_DEVIATION_THRESHOLD,
    )

    return dict(alerts_by_user)


def lambda_handler(event, context):
    # Fetch all watchlist entries (with joins on Assets and Users)
    watchlist_entries = get_watchlist_entries()

    # Group entries by symbol and filter out symbols whose markets are inactive
    entries_by_symbol, active_symbols = process_watchlist_entries(watchlist_entries)

    # Fetch the newest prices for all the active assets in bulk
    prices_by_symbol, failed_symbols = fetch_prices_bulk(active_symbols)

    # Bulk insert new price snapshots into the DB
    price_snapshots_to_insert = []
    for s, p in prices_by_symbol.items():
        asset_id = entries_by_symbol[s][0].asset_id
        price_snapshots_to_insert.append((asset_id, Decimal(str(p))))

    add_price_snapshots_bulk(price_snapshots_to_insert)

    # Record any failed fetches for the Alpha Vantage backfill
    missed_fetches_to_insert = []
    for s, error_msg in failed_symbols.items():
        asset_id = entries_by_symbol[s][0].asset_id
        missed_fetches_to_insert.append((asset_id, "yfinance", error_msg))

    if missed_fetches_to_insert:
        add_missed_fetch_bulk(missed_fetches_to_insert)

    process_alpha_vantage_backfill()

    # Build a flat dict of asset_id -> current Decimal price for the SMA comparison
    prices_by_asset_id: dict[str, Decimal] = {
        entries_by_symbol[s][0].asset_id: Decimal(str(p))
        for s, p in prices_by_symbol.items()
    }

    # Compare prices against today's precomputed daily SMA
    alerts_by_user = process_sma(entries_by_symbol, prices_by_asset_id)

    # Filter out alerts that were successfully sent out in the last 24 hours
    alerts_by_user = filter_alerts(alerts_by_user)

    # Bulk add alerts to DB with delivered=False
    flat_alerts_to_insert = []
    for user_alerts in alerts_by_user.values():
        flat_alerts_to_insert.extend(user_alerts.values())
    add_alerts_bulk(flat_alerts_to_insert)

    # Send alerts and mark successful ones as delivered
    watchlist_ids_for_alerts_successfully_sent = send_alerts_via_email(alerts_by_user)
    mark_alerts_as_delivered(watchlist_ids_for_alerts_successfully_sent)


if __name__ == "__main__":
    lambda_handler({}, {})
