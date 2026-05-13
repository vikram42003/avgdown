import math
import yfinance as yf
from datetime import date


# Number of daily chart points served by the frontend/API.
HISTORY_WINDOW = 40


def fetch_prices_bulk(
    symbols: list[str], period="1d", interval="15m"
) -> tuple[dict[str, float], dict[str, str]]:
    """
    Fetches prices for all the assets passed in, in bulk
    Returns good prices for all the ones we could fetch and failed prices for the ones we could not
    """
    try:
        data = yf.download(
            tickers=symbols,
            period=period,
            interval=interval,
            group_by="ticker",
            threads=True,
            progress=False,
        )

        prices_by_symbol = {}
        failed_symbols = {}
        single_symbol = len(symbols) == 1
        for symbol in symbols:
            try:
                closes = data["Close"] if single_symbol and "Close" in data else data[symbol]["Close"]
                price = closes.dropna().iloc[-1]
                if math.isnan(price):
                    failed_symbols[symbol] = "yfinance returned NaN for this timeframe"
                else:
                    prices_by_symbol[symbol] = float(price)
            except KeyError:
                failed_symbols[symbol] = (
                    "Ticker completely missing from yfinance response"
                )
            except IndexError:
                failed_symbols[symbol] = "Empty price series returned by yfinance"
        return (prices_by_symbol, failed_symbols)

    except Exception as e:
        # Handles complete request failure or other uncaught errors
        print(f"Failed to fetch prices with yfinance for {symbols}: {e}")
        return ({}, {s: str(e) for s in symbols})


def fetch_daily_closes_bulk(
    symbols: list[str],
    min_completed_closes: int,
) -> tuple[dict[str, list[tuple[date, float]]], dict[str, str]]:
    """
    Fetches completed daily close history for each symbol.

    Returns:
        - dict mapping symbol -> list of (date, close) chronologically
        - dict mapping failed symbol -> error message
    """
    if not symbols:
        return {}, {}

    unique_symbols = list(dict.fromkeys(symbols))

    # yfinance period is calendar-ish, so add a buffer for weekends/holidays.
    days_needed = min_completed_closes + 30

    try:
        data = yf.download(
            tickers=unique_symbols,
            period=f"{days_needed}d",
            interval="1d",
            group_by="ticker",
            threads=True,
            progress=False,
        )
    except Exception as e:
        print(f"Failed to fetch daily data from yfinance: {e}")
        return {}, {s: str(e) for s in unique_symbols}

    results: dict[str, list[tuple[date, float]]] = {}
    failed: dict[str, str] = {}
    single_symbol = len(unique_symbols) == 1

    for symbol in unique_symbols:
        try:
            closes = data["Close"] if single_symbol and "Close" in data else data[symbol]["Close"]
            closes = closes.dropna().tail(min_completed_closes)
            if len(closes) < min_completed_closes:
                failed[symbol] = f"Not enough daily closes: got {len(closes)}, need {min_completed_closes}"
                continue

            results[symbol] = [(idx.date(), float(val)) for idx, val in closes.items()]
        except (KeyError, IndexError) as e:
            failed[symbol] = f"Missing or empty daily close series: {e}"

    return results, failed
