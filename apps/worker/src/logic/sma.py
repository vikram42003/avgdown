from decimal import Decimal
from models import WatchlistEntryProjection, TriggeredAlert
from utils import generate_sma_drop_message
from db import get_daily_sma_bulk


def sma_val_below_average(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    prices_by_asset_id: dict[str, Decimal],
    alerts_by_user: dict[str, dict[str, TriggeredAlert]],
    deviation_threshold: float,
) -> None:
    """
    Compares the current live price for each asset against today's precomputed daily SMA.
    Fires an alert if the price is below the SMA by more than the deviation threshold.

    daily SMA is fetched from daily_sma_snapshots (written by the daily SMA worker).
    If no SMA exists for today yet (e.g. market just opened), the entry is skipped.
    """
    # Collect all (asset_id, period) pairs up-front for a single bulk DB fetch
    all_pairs = [
        (entry.asset_id, entry.sma_period)
        for entries in entries_by_symbol.values()
        for entry in entries
    ]
    daily_smas = get_daily_sma_bulk(all_pairs)

    for symbol, entries in entries_by_symbol.items():
        for entry in entries:
            current_price = prices_by_asset_id.get(entry.asset_id)
            if current_price is None:
                continue

            daily_sma = daily_smas.get((entry.asset_id, entry.sma_period))
            if daily_sma is None:
                # SMA not yet computed for today - skip rather than use stale data
                print(f"No daily SMA for {symbol} (period={entry.sma_period}), skipping.")
                continue

            threshold_multiplier = Decimal(str(1 - deviation_threshold))
            if current_price < (daily_sma * threshold_multiplier):
                message = generate_sma_drop_message(
                    symbol=entry.asset_symbol,
                    current_price=current_price,
                    sma_value=daily_sma,
                    period=entry.sma_period,
                )

                alerts_by_user[entry.user_id][entry.id] = TriggeredAlert(
                    message=message,
                    watchlist_entry_id=entry.id,
                    triggered_price=current_price,
                    delivered=False,
                    symbol=symbol,
                    sma_value=daily_sma,
                    user_email=entry.user_email,
                    webhook_url=entry.user_webhook_url,
                )
