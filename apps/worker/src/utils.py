import logging
import re
from models import TriggeredAlert
from db import get_alerted_today_entries
from datetime import datetime, timezone
from decimal import Decimal

logger = logging.getLogger(__name__)

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
    """Filter out alerts for entries that already have any alert row today."""
    pending_entry_ids = []
    for user_alerts in alerts_by_user.values():
        pending_entry_ids.extend(user_alerts.keys())

    if not pending_entry_ids:
        return {}

    already_alerted_ids = get_alerted_today_entries(pending_entry_ids)

    skipped_count = 0
    filtered_alerts = {}
    for user_id, user_alerts in alerts_by_user.items():
        # Build a new dict for each user, excluding recently alerted IDs
        remaining = {}
        for eid, alert in user_alerts.items():
            if eid in already_alerted_ids:
                skipped_count += 1
            else:
                remaining[eid] = alert
        
        if remaining:
            filtered_alerts[user_id] = remaining

    if skipped_count > 0:
        logger.info("Skipping %d alerts - already alerted today", skipped_count)

    return filtered_alerts


def validate_domain_name(domain: str) -> str:
    """
    Validates a domain name to prevent link injection.
    Allows only letters, digits, hyphens, and dots.
    Returns a safe fallback domain if validation fails.
    """
    if domain and re.match(r"^[a-zA-Z0-9.-]+$", domain):
        return domain
    
    logger.warning(f"Invalid domain name detected: {domain!r}. Using fallback.")
    return "avgdown.com"


def get_currency_symbol(symbol: str, explicit_currency: str = None) -> str:
    """
    Derives a currency symbol for formatting based on the asset symbol
    or an optional explicit currency.
    """
    if explicit_currency:
        curr = explicit_currency.upper()
        symbols = {"USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "INR": "₹"}
        return symbols.get(curr, f"{curr} ")

    symbol_upper = symbol.upper()

    # Regex patterns for crypto/currency pairs
    # Treat crypto pairs (e.g. BTC-USD, ETH-EUR, or containing "/") as no symbol (use raw value or empty)
    if re.search(r"^[A-Z0-9]{3,}/[A-Z0-9]{3,}$", symbol_upper) or any(suffix in symbol_upper for suffix in ["-USD", "-BTC", "-ETH"]):
        return ""

    # Check common Yahoo Finance suffixes and patterns
    # EUR: =F (futures), .PA (Paris), .HE (Helsinki), .DE (Germany)
    # GBP: .L (London)
    # JPY: .T (Tokyo)
    # INR: .BO (Bombay), .NS (National Stock Exchange of India)
    if re.search(r"(?:-EUR|=F|\.(?:PA|HE|DE))$", symbol_upper):
        return "€"
    if re.search(r"(?:-GBP|\.L)$", symbol_upper):
        return "£"
    if re.search(r"(?:-JPY|\.T)$", symbol_upper):
        return "¥"
    if re.search(r"(?:-INR|\.(?:BO|NS))$", symbol_upper):
        return "₹"

    # Default fallback for regular stocks (usually USD/$)
    return "$"
