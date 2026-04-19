from models import TriggeredAlert
from db import get_recently_alerted_entries
from datetime import datetime, timezone
from decimal import Decimal

# Trading hours in UTC for each exchange
# These are approximate — does not account for early closes or regional holidays
_EXCHANGE_HOURS_UTC = {
    "NYSE": {"days": range(0, 5), "open": 14, "close": 21},  # 9:30–4pm ET
    "NASDAQ": {"days": range(0, 5), "open": 14, "close": 21},
    "NSE": {"days": range(0, 5), "open": 3, "close": 10},  # 9:15am–3:30pm IST
    "BSE": {"days": range(0, 5), "open": 3, "close": 10},
    "BINANCE": {"days": range(0, 7), "open": 0, "close": 24},  # 24/7
    "COINBASE": {"days": range(0, 7), "open": 0, "close": 24},
}


def filter_inactive_markets(symbol_exchange_pairs: list[tuple[str, str]]) -> list[str]:
    """
    Given a list of (ticker_string, exchange) pairs, returns only the ticker strings
    whose exchange is currently open. Skips closed markets to avoid guaranteed NaNs.
    """
    now = datetime.now(timezone.utc)
    active = []

    for ticker, exchange in symbol_exchange_pairs:
        hours = _EXCHANGE_HOURS_UTC.get(exchange.upper())
        if hours is None:
            # Unknown exchange — let it through and let yfinance decide
            active.append(ticker)
            continue

        if (
            now.weekday() in hours["days"]
            and hours["open"] <= now.hour < hours["close"]
        ):
            active.append(ticker)

    return active


def map_symbol_exchange(symbol: str, exchange: str) -> str:
    """Map symbol and exchange to the format required by yfinance"""
    exchange = exchange.upper()

    # If already formatted (has suffix or crypto pair), return as-is
    if "." in symbol or "-" in symbol:
        return symbol

    if exchange == "NSE":
        return f"{symbol}.NS"
    elif exchange == "BSE":
        return f"{symbol}.BO"
    elif exchange in {"NASDAQ", "NYSE"}:
        return symbol
    elif exchange in {"BINANCE", "COINBASE"}:
        return symbol
    else:
        raise ValueError(f"Unsupported exchange: {exchange}")

def generate_sma_drop_message(symbol: str, current_price: Decimal, sma_value: Decimal, period: int) -> str:
    """Single source of truth for SMA alert messages"""
    return (
        f"The current value for {symbol} is trading below the average SMA value.\n"
        f"Current value: {current_price:.2f} | Average SMA for {period} period: {sma_value:.2f}"
    )

def filter_alerts(alerts_by_user: dict[str, dict[str, TriggeredAlert]]) -> dict[str, dict[str, TriggeredAlert]]:
    """Filter out alerts that were successfully sent out in the last 24 hours"""
    pending_entry_ids = []
    for user_alerts in alerts_by_user.values():
        pending_entry_ids.extend(user_alerts.keys())

    if not pending_entry_ids:
        return {}

    recently_alerted_ids = get_recently_alerted_entries(pending_entry_ids)

    filtered_alerts = {}
    for user_id, user_alerts in alerts_by_user.items():
        # Build a new dict for each user, excluding recently alerted IDs
        remaining = {
            eid: alert 
            for eid, alert in user_alerts.items() 
            if eid not in recently_alerted_ids
        }
        
        if remaining:
            filtered_alerts[user_id] = remaining

    return filtered_alerts