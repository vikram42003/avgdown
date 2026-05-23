## Stuff that is left to do

### Pre MVP -

1. ✅ CORS Configuration: Setup CORS in the NestJS API so the frontend can communicate with it.
2. ✅ Auth Guards: Properly add the correct auth guards across all necessary Nest server endpoints.
3. ✅ Complete Auth-Dependent Logic: Fill out the rest of the incomplete functions that rely on user authentication info.

4. ✅ Auth Pages: Build Login and Signup pages.
5. ✅ Data Fetching Layer: Wire up SWR for data fetching (prioritizing fresh data over global state).
6. ✅ Dashboard Data Wiring: Connect the dashboard components to the real backend endpoints.
7. ✅ Auth State Handling: Implement "Not logged in" states and protected route redirects.

8. ✅ Watchlist CRUD Flow: Build the Create/Edit Watchlist form (Modal/Sheet with asset search and SMA period input - this is the most critical user action!).
9. ✅ Sidebar Pages: Implement the remaining pages in the sidebar tabs (`/watchlists`, `/alerts`, `/browse-assets`).

10. ✅ Loading States: Add skeleton loaders for dashboard components (Charts, Alerts) so the UI doesn't flash empty.
11. ✅ Empty States: Design empty states for when the user has no watchlists or alerts.
12. ✅ Toast Notifications: Add toast feedback (via Sonner) for CRUD actions (e.g., "Watchlist created").
13. ✅ Error Handling: Add robust error boundaries and handling to critical areas.

14. ✅ Terraform Cron: Configure Event Bridge with Terraform to run the Lambda worker every 30 min (EventBridge Scheduler).
15. ✅ Database Cleanup: Implement daily cleanup of price snapshots, alerts, and failed fetches logs older than 1 year in the daily worker.
16. ✅ Add a basic Privacy Policy or Terms of Service link in the footer
17. Production Database: Setup Prisma migrations for production (`prisma migrate deploy` in the CI/CD or deployment step).
18. Hosting: Deploy the frontend, backend, and database!

---

### Post-MVP

19. Logging: Implement structured, centralized logging across the stack.
20. Theme Toggle: Add a Dark/Light mode switch in the settings tab.
21. Landing Page: Build a public landing page at the root `/` and move the main app to `/dashboard`.
22. Implement the Observability layer
23. Update Documentation and make charts/graphs and shit for it
24. GO THROUGH THE GUIDE.md AND SEE IF THERES ANYTHING ELSE LEFT
25. Webhook Reliability & Visibility: Webhooks are currently fire-and-forget with no retry logic.
    Failures are only logged. Consider: delivery receipts stored in DB, a retry queue (SQS/dead-letter),
    and a user-facing delivery log so they can debug their integrations.

### OTHER STUFF (handle it one day...)
26. Add a way for auth'd users to like setup password if they used oauth and vice versa
27. Implement the calculation of the delivery rate in dashboard summary cards
28. Limit the watchlist charts we initially load and add pagination/infinite scrolling
29. The alert we show on the WatchlistChart is a heuristic not ground truth, so maybe refactor it to show a real accurate alert by reading recent alerts or pinging for last alert for that watchlist
30. Add search/filter query param support to `GET /assets` in the backend (client-side filtering is fine for MVP since the list is seeded and finite)
31. Add focused tests/fixtures for yfinance response shapes (`download` single ticker, multiple tickers, `group_by`, `multi_level_index`) so provider parsing breaks loudly when yfinance changes its DataFrame structure
32. Move DNS management from Porkbun to Route 53, and manage it through IAC
33. (Maybe Imp) Implement Secure One-Click Email Unsubscribe, we send a one time presigned url + token along with emails so users can unsubscribe
34. Send emails in bulk in live_alerts_worker
---

## Webhook Payload Contract

When a user configures a `webhook_url` on their account, the worker will POST the following
JSON payload to that URL for every alert batch that fires for them. This is fired per-user,
once per worker run, after email delivery succeeds.

```json
{
  "event": "alert.triggered",
  "triggered_at": "2026-05-18T18:00:00Z",
  "alerts": [
    {
      "alert_id": "<uuid of the alert row in DB>",
      "symbol": "AAPL",
      "triggered_price": "182.50",
      "sma_value": "187.30"
    }
  ]
}
```

**Notes:**
- `triggered_at` is UTC ISO-8601.
- `triggered_price` and `sma_value` are serialized as strings to preserve decimal precision.
- `alert_id` can be used to correlate with the `/alerts` API endpoint.
- The webhook is **fire-and-forget** — failures are logged but not retried (see todo item #23).
- The webhook fires after email; if email dispatch itself fails for a user, the webhook still fires
  (the two are independent delivery channels).

---

## PR PLAN

✅ feat/backend-auth              → 1, 2, 3
✅ feat/frontend-auth-flow        → 4, 7
✅ feat/data-layer-dashboard      → 5, 6
✅ feat/watchlist-crud-app-pages  → 8, 9, 10, 11, 12, 13
feat/infra-deployment             → 14, 15, 16

feat/logging-observability        → 17, 20
feat/theme-toggle                 → 18
feat/landing-page                 → 19
chore/docs-review                 → 21, 22

## Things to learn more about
- **AWS SESv2 Email Identities (`aws_sesv2_email_identity`)**: Unified resource type in SESv2 that replaces the legacy SESv1 domain and email address identity resources. It permits associating default configuration sets directly to the identity.
- **Easy DKIM (3x CNAME records)**: Authenticates outbound emails and verifies domain ownership simultaneously. Recipient mail servers check these records to verify that the email actually originated from your domain and wasn't spoofed/tampered with in transit.
- **Custom MAIL FROM Domain (MX & SPF TXT records)**: Overrides the default `amazonses.com` envelope-sender address with your own subdomain (e.g., `mail.avgdown.xyz`). This aligns the "MAIL FROM" domain with your "From" header address, which is required for DMARC (Domain-based Message Authentication) to pass.

## Productivity Logs -

### 27 April 2026 - Morning
- [x] Update the colors in the design system for better readability and visual appeal.
- [x] Style sidebar collapse button
- [x] Add the 4 cards for displaying tracked stocks alerts triggered in the past 7 days etc

### 28 April 2026 - Evening
- [x] Decide on the remaining design for dashboard page
      - it'll be graphs of prices with line for alert on left side and recent alerts on right side
- [-] Add an endpoint to fetch recent price data

### 29 April 2026 - Afternoon
- [x] Add an endpoint to fetch recent price data
- [-] Style Recent Alerts component

### 30 April 2026 - Evening
- [x] Fully style Alerts component
- [x] Fully style watchlists component

### 1 May 2026 - Afternoon
- [x] Implement WatchlistChart component and fix chart types
- [x] Add DailySmaSnapshot model to schema and data layer
- [x] Migrate alert logic to daily SMA and implement daily close worker lambda

### 2 May 2026 - Afternoon
- [x] Update chart data API contract to use daily SMA series
- [x] Run database migrations and apply minor type fixes
- [x] Enable CORS locally (Task #1)

### 3 May 2026 - Night
- [x] Configure backend to use HTTP-only cookies for JWT auth (`cookie-parser`)
- [x] Implement complete Auth flow (Login, Register, Logout endpoints)
- [x] Apply `AuthGuard` to protect necessary backend controllers (Task #2)
- [x] Enforce user ownership in watchlist endpoints by validating `userId` (Task #3)

### 7 May 2026 - Night
- [x] Move dashboard to `/dashboard`, create initial login and signup pages (Task #4)
- [x] Extract `GoogleIcon` to `components/icons`, fix login page alignment
- [x] Add `proxy.ts` middleware for edge-level cookie existence checks on protected routes

### 8 May 2026 - Night
- [x] Fix P2028 transaction timeout — initially raised `maxWait`/`timeout` for Neon cold starts
- [x] Implement `ClientAuthGuard` with stale cookie handling and dashboard skeleton (Task #7)

### 21 May 2026 - Morning

- [x] Replace the OAuth user upsert interactive transaction with unique-constraint-driven writes plus P2002 retry handling. Auth needs correctness, but this path only mutates one `User` row and already has unique constraints on `email` and `googleId`; avoiding an interactive transaction keeps login resilient when the free-tier database is cold or slow to acquire a transaction.

### 9 May 2026 - Night
- [x] Implement SWR hooks: `useUser`, `useWatchlists`, `useRecentAlerts`, `useChartData` (Task #5)
- [x] Wire all dashboard components to real API data, replace all mock data (Task #6)
- [x] Fix chart tooltip date format to match daily candle granularity
