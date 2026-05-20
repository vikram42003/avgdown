# Worker Readiness And Hydration Plan

## Goal

Before adding EventBridge schedules, prove that the workers are correct, rerunnable, and able to recover missing market data.

The immediate goal is speed: get to a local smoke-tested worker flow today or tomorrow, then add cleanup and infra scheduling.

## Architecture Decision

Market data fetching belongs in `apps/worker`, not the NestJS backend.

The backend should:

- create/read/update user watchlists
- serve chart data from the database
- return a clear loading/warming state when data is not ready

The workers should:

- call yfinance and future fallback providers
- hydrate missing daily market data
- upsert completed daily close snapshots
- fetch 15-minute/live prices for in-memory alert checks
- write missed fetches and alert records

This keeps the backend deterministic and fast. It also prevents user-facing API requests from depending directly on yfinance latency or provider failures.

## Data Readiness Contract

For a watchlist entry to be "ready", the database should have enough completed daily closes for its `(asset_id, sma_period)` pair.

Minimum useful readiness:

- `daily_price_snapshots` has at least `smaPeriod` rows for the asset
- the latest close date is the latest available trading day, or close enough for MVP
- chart endpoints can return an SMA series instead of an empty chart

Better readiness:

- `daily_price_snapshots` has up to `HISTORY_WINDOW + smaPeriod - 1` rows, currently enough to serve 40 chart points
- the worker fetched enough daily closes to compute the chart SMA correctly
- for a period `N`, the provider fetch needs roughly `N + HISTORY_WINDOW + buffer` daily candles

Important distinction:

- The DB stores completed daily closes, not computed SMA rows.
- The API computes chart SMA from stored daily closes.
- The live worker computes provisional alert SMA from `N - 1` stored closes plus the current live price.
- We do not permanently store 15-minute prices.

## Hydration Flow

Add or harden a worker path that can be run manually and later scheduled.

Suggested flow:

```txt
get active watchlist entries
dedupe into unique (asset_id, yf_symbol)
for each asset:
  check daily_price_snapshots coverage
  if enough recent rows exist:
    skip
  otherwise:
    fetch enough daily candles from provider
    upsert daily_price_snapshots
log summary:
  checked count
  skipped count
  hydrated count
  failed count
```

This lives in `apps/worker/src/daily_close_worker.py`.

Do not optimize too early with queues or complex provider abstractions. First make the manual worker boring and rerunnable.

## API And Frontend Behavior While Data Warms

Newly added watchlist entries may not have chart data immediately. That is acceptable for MVP if the UI is honest.

The chart endpoint should be able to represent:

```ts
{
  status: "READY" | "WARMING_UP";
  points: {
    date: string | Date;
    close: number;
    sma: number | null;
  }[];
  smaPeriod: number;
}
```

For fastest MVP, returning an empty chart series with a clear frontend warming state is enough. The backend should not call yfinance just because a user opened a chart.

Later upgrade path:

- user creates watchlist entry
- backend asynchronously invokes a hydration Lambda for that asset/period
- frontend shows warming state and revalidates

Avoid SQS until it is actually needed.

## Worker Hardening Checklist

Fix these before EventBridge:

- yfinance single-symbol and multi-symbol response shapes both work
- missing provider data logs a failure and does not crash the whole run
- not enough data for a period logs clearly and skips that pair
- live worker does not store 15-minute prices
- alert worker computes SMA from completed closes plus current live price
- alert dedupe suppresses any second alert for the same watchlist entry on the same DB day
- all DB writes are safe to rerun
- partial worker failure does not leave the DB in a misleading state
- worker logs enough summary information to debug local smoke tests

## Local Smoke Test Checklist

Use a real dev database or Neon branch with the real Prisma schema.

1. Apply migrations.
2. Seed assets.
3. Create one test user.
4. Create a few watchlist entries:
   - one US stock, e.g. `AAPL`
   - one crypto asset, e.g. `BTC-USD`
   - one NSE stock, e.g. `RELIANCE.NS`
5. Run the daily close hydration worker.
6. Inspect `daily_price_snapshots`.
7. Rerun the hydration worker and confirm it is safe/idempotent.
8. Run the 15-minute alert worker.
9. Inspect:
   - `daily_price_snapshots`
   - `missed_fetches`
   - `alerts`
10. Rerun the live alert worker and confirm no duplicate alert is created for the same watchlist entry today.

Useful manual commands:

```bash
python3 scripts/seed_assets.py

cd apps/worker
python3 src/daily_close_worker.py
python3 src/live_alert_worker.py
```

Useful inspection queries:

```sql
SELECT asset_id, COUNT(*) AS rows, MAX(date) AS latest_close
FROM daily_price_snapshots
GROUP BY asset_id
ORDER BY latest_close DESC;

SELECT watchlist_entry_id, triggered_price, sma_value, delivered, created_at
FROM alerts
ORDER BY created_at DESC
LIMIT 20;

SELECT asset_id, provider, error_msg, resolved, created_at
FROM missed_fetches
ORDER BY created_at DESC
LIMIT 20;
```

## Cleanup And Retention Policy

Neon does not provide automatic table-level TTL for app rows. Retention should be handled with SQL cleanup, either through `pg_cron` or a small scheduled cleanup Lambda.

Suggested MVP retention:

```sql
DELETE FROM missed_fetches
WHERE resolved = true
  AND created_at < now() - interval '7 days';

DELETE FROM alerts
WHERE created_at < now() - interval '90 days';
```

Keep `daily_price_snapshots` long enough for future indicators. They are compact and useful for charts.

```sql
DELETE FROM daily_price_snapshots
WHERE date < current_date - interval '1 year';
```

This can wait until after worker correctness is proven.

## EventBridge Readiness Checklist

Only add EventBridge after manual runs are predictable.

Before Terraform:

- hydration worker succeeds locally
- alert worker succeeds locally
- rerunning workers does not corrupt data
- provider failures are recorded instead of crashing everything
- cleanup strategy is decided
- Lambda env vars are known
- Lambda timeout and memory are reasonable
- logs are visible in CloudWatch

Suggested schedules:

- live alert worker: every 15 minutes, but internally skip closed markets
- daily close hydration worker: once per day after relevant markets have closed
- cleanup worker or `pg_cron`: once per day

## Today Or Tomorrow Execution Order

1. Harden `daily_close_worker.py` into a true daily close hydration worker.
2. Fix provider shape issues in `providers/yf.py`.
3. Compute live alert SMA from stored closes plus current live price.
4. Add or update API/frontend warming behavior if charts can be empty.
5. Run local smoke test.
6. Add cleanup SQL or cleanup worker.
7. Add EventBridge Terraform.
8. Deploy.
