from decimal import Decimal
from models import WatchlistEntryProjection
from utils import generate_sma_drop_message


def sma_val_below_average(
    entries_by_symbol: dict[str, list[WatchlistEntryProjection]],
    price_snapshots_by_asset_id: dict[str, list[Decimal]],
    alerts_by_user: dict[str, dict[str, dict]],
    deviation_threshold: float
) -> None:
    """Calculates the SMA for each watchlist entry and add to alerts_by_user if the price is below the SMA"""

    # Error handling yet to be handled
    for symbol, entries in entries_by_symbol.items():
        for entry in entries:
            snapshots = price_snapshots_by_asset_id.get(entry.asset_id, [])
            # Only use up to sma_period snapshots
            snapshots = snapshots[:entry.sma_period]
            
            if not snapshots:
                continue

            # Need both as Decimals for precision
            sma_value = sum(snapshots) / entry.sma_period
            cur_latest_price = snapshots[0]
            
            threshold_multiplier = Decimal(str(1 - deviation_threshold))
            
            if cur_latest_price < (sma_value * threshold_multiplier):
                message = generate_sma_drop_message(
                    symbol=entry.asset_symbol, 
                    current_price=cur_latest_price, 
                    sma_value=sma_value, 
                    period=entry.sma_period
                )
                
                alerts_by_user[entry.user_id][entry.id] = {
                    "message": message,
                    "triggered_price": cur_latest_price,
                    "sma_value": sma_value,
                    "user_email": entry.user_email,
                    "webhook_url": entry.user_webhook_url
                }