import math
import yfinance as yf


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
