## Misc

- We dont need rimraf or cross-env, bun handles it automatically, its got like polyfills and stuff

## Important

- gha that periodically checks for update, if yfinance has been updated then repackages and reuploadds the lambda
- add a backup option if yfa fails, like alpha vantage
- im thinking yfinance initially + Alpha Vantage as backup, we do 15min with yfinance, automatic retry, if it fails then we put it in a missed queue implemented as a new table in the db, and every hour check the queue and process it with Aplha vantage batched requests, so a total of 24 requests in a day even if we do it all with Alpha Vantage + nubra has a third backup option if i think i'll need it, and then i'll observe it with my obesrvation layer if its causing too much trouble and I think this project might need to be upgraded then ill go with upstox, 300 amc is 25 a month, thats not too expensive, and I can even like start doing algorithmic tradign one day

## Todo

- Do swagger stuff once the project is done
- Make a separate model for Exchange field and then remove the ts typeguard from types/src/assets
- Uhh prettier may not be setup correctly, its only in api currently, so do do that
- Learn about that how that database package works and is compiled
- Learn how that seed script really works
- Add a lifecycle rule that deletes any price snapshot older than the longest SMA period from any watchlist for that particular asset

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

## Bugs I've noted down but have not fixed yet
1. Update upsertUser to check googleId when present to avoid unique constraint collisions.

   When googleId is provided, the current implementation only searches by email. If the user's Google account email changes, the upsert fails to find the existing user (stored under the old email), then attempts to create a new user with the same googleId, violating the unique constraint on the googleId column.

   **Why I havent fixed this particular issue**: The current scale of the app is very small, so the odds of this happening are miniscule, to handle it I gotta do a search before updating, which breaks the atomicity of the upsert operation, so I'm prioritizing the atomicity of the upsert operation over the odds of this happening. Will definitely be changing the behaviour when I see actual users through my Observability layer

## Special Notes for final documentation

### Zero-Config Environment Files
Every application in the monorepo (`apps/api`, `apps/web`, `apps/worker`) requires its own `.env` or `.env.local` file for local development. We do not use a single shared root `.env` because Vercel and AWS Lambda expect environment variables to be scoped to their specific deployments in production.

### 1. Data Fan-Out Architecture (The "Asset-First" Approach)

The system is built on an **Asset-First** architectural pattern.

- **The Core Problem**: If 500 users track Tesla (`TSLA`), making 500 individual Finnhub API calls every 15 minutes would instantly destroy our third-party rate limits.
- **The Solution (Normalization)**: Frontend users do not explicitly "create" assets. They search for a stock. The backend checks if the `Asset` exists in the database. If it doesn't, it seeds it. When a user tracks it, the backend creates a `WatchlistEntry` that simply points to the shared `Asset` via `assetId`.
- **The Worker**: The background AWS Lambda worker queries all distinct `Asset`s currently being tracked. It fetches the price of `TSLA` **exactly once**, saves a single `PriceSnapshot`, and then fans out the SMA calculation and Email Alerts to all 500 users linked to that single Asset.

### 2. Schema Validation Roles (CQRS/Segregation Pattern)

Because we use a Monorepo, our data boundaries must be completely bulletproof across the internet divide. Our `packages/types` structure implements separated schemas for each stage of the lifecycle:

- **Base Schema (`[Resource]Schema`)**: Mirrors the exact Prisma Postgres Row. Never sent over the internet raw to avoid leaking internal IDs, password hashes, or allowing users to spoof `createdAt`.
- **Creation Schema (`[Resource]RegisterSchema` / `CreateSchema`)**: Strictly what the frontend is allowed to send in a `POST` body. It uses `.omit()` to drop properties like `id` and `userId` (which the backend injects securely via JWTs), and drops `assetId` in favor of raw user-input like `symbol`.
- **Update Schema (`[Resource]UpdateSchema`)**: The same as the Create payload, but uses `.partial()` to allow sending a single field (like just changing `{ isActive: false }`).
- **Response Schema (`[Resource]ResponseSchema`)**: What the NestJS backend sends _back_ to Next.js. Strips out critical security fields (like `passwordHash` or `googleId`) using `.omit()`, and ensures `Date` objects are cast to strict `ISO DateTime Strings` for safe JSON serialization.

### 3. Core Data Models and Their Architectural Roles

The system maps domain driven design strictly into Postgres models. Each model serves a distinct purpose:

- **`User`**: The owner of the domain. Houses authentication details (password hashes, Google IDs) and the `webhookUrl` destination where alerts are pushed.
- **`Asset`**: The isolated financial ticker (e.g., TSLA). It serves as the "Hub" for the Fan-out process. Fetched lazily from a provider (like Finnhub) when a user searches for it, preventing duplicate rows across different users tracking the same stock.
- **`WatchlistEntry`**: The bridge between a `User` and an `Asset`. Houses the user-defined `smaPeriod` and `isActive` toggle. Drives the personalized SMA calculation since User A might want a 20-day SMA, and User B might want a 50-day SMA on the _same_ asset.
- **`PriceSnapshot`**: An immutable, time-stamped record of an `Asset`'s market price. This is completely decoupled from users. It acts as the shared historical timeline that every `WatchlistEntry` uses to compute its averages.
- **`Alert`**: The actual notification record. It is strictly generated by the AWS Lambda Worker, never from the frontend. It ties an executed trigger back to a `WatchlistEntry` (so the user knows their rules were met) and strictly tracks delivery status to prevent duplicating emails during a Lambda retry.

### 4. Bulk Historical Price Fetching with `CROSS JOIN LATERAL`

Fetching historical price snapshots for SMA calculation presents a specific N+1 query problem: each asset may have a different SMA window size (e.g., User A wants 20 periods for AAPL, User B wants 50 periods for NVDA). A naive loop would fire one `SELECT ... LIMIT N` query per asset, meaning 100 tracked assets = 100 DB roundtrips every 15 minutes.

The entire bulk fetch is reduced to **one single query** using two advanced Postgres features:

#### a) `VALUES` as a standalone table

Most developers only know `VALUES` inside INSERT statements. In Postgres, `VALUES` can function as a standalone table expression:

```sql
-- This creates a temporary 2-column table on the fly from your data
SELECT column1, column2
FROM (VALUES ('asset-uuid-1', 20), ('asset-uuid-2', 50)) AS v
```

The Python code constructs this dynamically by building `(%s, %s)` placeholders and flattening the `dict` into a parameter list for psycopg to bind safely.

#### b) `CROSS JOIN LATERAL` (the foreach loop of SQL)

A standard `JOIN` matches and merges rows between two already-computed tables. It cannot run a different subquery per row. `LATERAL` breaks this rule: for **every row on the left side** of the join, Postgres executes the right-side subquery from scratch, with the current left-side row's columns in scope.

```sql
SELECT p.asset_id, p.price
FROM requirements req               -- left side: our dynamic requirements table
CROSS JOIN LATERAL (                -- for each row in requirements...
    SELECT asset_id, price, fetched_at
    FROM price_snapshots
    WHERE asset_id = req.req_asset_id  -- ...use THIS row's asset_id
    ORDER BY fetched_at DESC
    LIMIT req.max_limit               -- ...and THIS row's custom limit
) p
```

This means asset-uuid-1 gets exactly 20 rows returned and asset-uuid-2 gets exactly 50, all within the same network roundtrip. The inner query also hits the `(asset_id, fetched_at DESC)` composite index defined in the Prisma schema, so it is efficient even as the `price_snapshots` table grows into millions of rows.

#### Why not a CTE with `ROW_NUMBER()`?

An alternative approach is using `ROW_NUMBER() OVER (PARTITION BY asset_id ORDER BY fetched_at DESC)` and filtering where `rn <= max_limit`. This works but has a drawback: Postgres must scan and rank *all* rows for *all* assets before filtering, meaning it cannot terminate a scan early once it has the top-N rows. `LATERAL` with `LIMIT` is typically more efficient because each inner scan bails out as soon as it hits its limit.


## Post-MVP Improvements

1. **Time-Weighted SMA (snapshot gap drift)**:
   The current SMA implementation is **snapshot-counted, not time-weighted**. The query is:
   ```sql
   SELECT price FROM price_snapshots
   WHERE asset_id = $1
   ORDER BY fetched_at DESC
   LIMIT $2  -- sma_period
   ```
   This means `sma_period = 20` always means "average the last 20 prices we have stored", regardless of the real-time gaps between those snapshots.

   **The drift:** When yfinance fails and Alpha Vantage backfills with one hourly snapshot instead of four 15-minute ones, the effective SMA window silently expands in clock-time (e.g., a "20-period SMA" might now cover 5h45min instead of 5h). The SMA also becomes slightly less sensitive to price moves that happened during the outage window since fewer data points represent that period.

   **Why this is acceptable for now:** For a DCA alerter operating on trend timescales (days/weeks), a fraction of a percent drift in SMA value from a 45-minute gap won't produce false triggers or miss real ones. The signal is directionally correct.

   **Future fix (if moving to a reliable API with no gaps):** Replace with a true time-weighted average:
   - Weight each snapshot by the duration it "represents" (i.e., time until the next snapshot).
   - Or use a fixed time window (`WHERE fetched_at > NOW() - INTERVAL '5 hours'`) instead of `LIMIT N`.
   - Or switch to EMA (`alpha * price_new + (1 - alpha) * ema_prev`) which is inherently gap-tolerant and only needs the previous EMA value.

2. **OAuth Error Redirects**: Currently, OAuth exceptions (e.g., Google rejecting the login or a database upsert failure during callback) return raw JSON errors to the browser (e.g., HTTP 401 or 500). Post-MVP, `googleOAuthCallback` should wrap its logic in a `try/catch` and gracefully redirect back to the frontend with an error parameter (e.g., `res.redirect(\`${redirectURL}?error=AuthFailed\`)`). This ensures the React application can parse the URL and display a localized toast notification rather than crashing the user out to a raw JSON screen.

3. **Advanced Alert Triggers (Post-MVP)**: 
   The MVP implements a simple static buffer (e.g., `Price < SMA * 0.98`) to detect crashes/dip buying opportunities. For future iterations:
   - **Math-Derived Thresholds (Standard Deviation)**: Instead of a static percentage like 2%, compute the Standard Deviation (σ) of the price history. Alert when the price drops below the Lower Bollinger Band (`SMA - 2σ`). This dynamically scales the threshold based on the asset's inherent volatility (e.g., S&P500 requires a smaller drop to trigger than a crypto coin).
   - **User-Defined Strategies**: Add columns to `WatchlistEntry` like `alertStrategy` (enum: `PERCENTAGE_DROP`, `BOLLINGER_BAND`) and `thresholdValue` to let power users configure their own deviation tolerances, moving the control entirely into the user's hands.
