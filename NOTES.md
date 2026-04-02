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

## Special Notes for final documentation

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
