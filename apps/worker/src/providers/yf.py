import math
import yfinance as yf


def fetch_prices_bulk(
    symbols: list[str], period="1d", interval="15m"
) -> tuple[dict[str, float], list[str]]:
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

        prices = {}
        failed_symbols = []
        for ticker in symbols:
            try:
                price = data[ticker]["Close"].iloc[-1]
                if math.isnan(price):
                    failed_symbols.append(ticker)
                else:
                    prices[ticker] = float(price)
            except (KeyError, IndexError):
                # KeyError: ticker not in MultiIndex at all
                # IndexError: series completely empty
                failed_symbols.append(ticker)
        return (prices, failed_symbols)

    except Exception as e:
        print(f"Failed to fetch prices with yfinance for {symbols}: {e}")
        return ({}, symbols)
