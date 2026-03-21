## Misc
- We dont need rimraf or cross-env, bun handles it automatically, its got like polyfills and stuff

## Todo
- Do swagger stuff once the project is done
- Make a separate model for Exchange field and then remove the ts typeguard from types/src/assets

## Implementation rough work
1. Get all DISTINCT assets that have at least one active WatchlistEntry
         ↓
2. For each asset (one Finnhub call per asset, not per user):
         ↓
3. Fetch price from Finnhub → write price_snapshot
         ↓
4. Query last N price_snapshots for this asset → compute SMA
         ↓
5. Is current price < SMA?
         ↓ yes
6. Find ALL active WatchlistEntries for this asset
   (this gives you every user watching it)
         ↓
7. For each WatchlistEntry → write alert row → send email → hit webhook