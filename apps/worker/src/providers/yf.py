import math
import yfinance as yf
from datetime import date


# Number of daily SMA data points to store per asset/period.
# This matches the chart history window on the frontend.
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
        # The returned data is a pandas dataframe !!!!
        for symbol in symbols:
            try:
                price = data[symbol]["Close"].iloc[-1]
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


def fetch_daily_sma_bulk(
    symbol_period_pairs: list[tuple[str, int]],
) -> tuple[dict[tuple[str, int], list[tuple[date, float]]], list[tuple[str, int]]]:
    """
    For each (symbol, period) pair, fetches enough daily history from yfinance
    to compute a rolling SMA for the last HISTORY_WINDOW trading days.

    Returns:
        - dict mapping (symbol, period) -> list of (date, sma_value) chronologically
        - list of (symbol, period) pairs that failed
    """
    if not symbol_period_pairs:
        return {}, []

    unique_symbols = list({s for s, _ in symbol_period_pairs})
    max_period = max(p for _, p in symbol_period_pairs)

    # Need HISTORY_WINDOW + max_period - 1 daily closes to compute a full rolling SMA
    # series for the last HISTORY_WINDOW points. Add a buffer for weekends/holidays.
    days_needed = HISTORY_WINDOW + max_period + 15

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
        return {}, symbol_period_pairs

    results: dict[tuple[str, int], list[tuple[date, float]]] = {}
    failed: list[tuple[str, int]] = []

    for symbol, period in symbol_period_pairs:
        try:
            closes = data[symbol]["Close"].dropna()
            if len(closes) < period:
                print(f"Not enough daily data for {symbol} (period={period}): got {len(closes)} rows")
                failed.append((symbol, period))
                continue

            rolling_sma = closes.rolling(window=period).mean().dropna()
            series = rolling_sma.tail(HISTORY_WINDOW)
            results[(symbol, period)] = [(idx.date(), float(val)) for idx, val in series.items()]
        except (KeyError, IndexError) as e:
            print(f"Failed to compute SMA for {symbol} (period={period}): {e}")
            failed.append((symbol, period))

    return results, failed
