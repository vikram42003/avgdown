from decimal import Decimal
from models import WatchlistEntryProjection, TriggeredAlert
from utils import generate_sma_drop_message
from db import get_recent_daily_closes_bulk


def calculate_sma(values: list[Decimal]) -> Decimal:
    """Calculates a simple moving average from Decimal prices."""
    if not values:
        raise ValueError("calculate_sma requires a non-empty list of Decimal values")
    return sum(values) / Decimal(len(values))


def sma_val_below_average(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    prices_by_asset_id: dict[str, Decimal],
    alerts_by_user: dict[str, dict[str, TriggeredAlert]],
    deviation_threshold: float,
) -> None:
    """
    Compares the current live price against an intraday/provisional daily SMA.

    The SMA uses the last N-1 completed daily closes from daily_price_snapshots
    plus the current live price as today's provisional close.
    """
    closes_required_by_asset_id: dict[str, int] = {}
    for entries in entries_by_symbol.values():
        for entry in entries:
            closes_required_by_asset_id[entry.asset_id] = max(
                closes_required_by_asset_id.get(entry.asset_id, 0),
                entry.sma_period - 1,
            )

    recent_closes = get_recent_daily_closes_bulk(closes_required_by_asset_id)

    for symbol, entries in entries_by_symbol.items():
        for entry in entries:
            current_price = prices_by_asset_id.get(entry.asset_id)
            if current_price is None:
                continue

            required_daily_closes = entry.sma_period - 1
            completed_closes = recent_closes.get(entry.asset_id, [])
            if len(completed_closes) < required_daily_closes:
                print(
                    f"Not enough daily closes for {symbol} "
                    f"(period={entry.sma_period}, got={len(completed_closes)}, "
                    f"need={required_daily_closes}), skipping."
                )
                continue

            sma_inputs = [*completed_closes[:required_daily_closes], current_price]
            sma_value = calculate_sma(sma_inputs)

            threshold_multiplier = Decimal(str(1 - deviation_threshold))
            if current_price < (sma_value * threshold_multiplier):
                message = generate_sma_drop_message(
                    symbol=entry.asset_symbol,
                    current_price=current_price,
                    sma_value=sma_value,
                    period=entry.sma_period,
                )

                alerts_by_user[entry.user_id][entry.id] = TriggeredAlert(
                    message=message,
                    watchlist_entry_id=entry.id,
                    triggered_price=current_price,
                    delivered=False,
                    symbol=symbol,
                    sma_value=sma_value,
                    user_email=entry.user_email,
                    webhook_url=entry.user_webhook_url,
                )
