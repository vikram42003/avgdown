from db import get_watchlist_entries

if __name__ == "__main__":
    watchListEntries = get_watchlist_entries()
    print(watchListEntries)

"""
Well, imagine we do have a watchlist in our db, now what the worker must do is
fetch all the watchlist entries that are active first and like track all the assets we have to fetch right now
now for that assetList, fetch the current price for each, and save that to the database
SPECIAL CASE: If the fetch was unsuccessful then we put that into MissedFetch list
Either way, we then fetch the last n snapshots of the price and then calculate the sma

Now, for each watchlist entry, we check if the sma has crossed the trigger price
If it has, we then check if the alert has already been sent
If not, we send the alert and mark it as sent
"""