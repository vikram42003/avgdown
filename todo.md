## Stuff that is left to do

### Pre MVP -

1. CORS Configuration: Setup CORS in the NestJS API so the frontend can communicate with it.
2. Auth Guards: Properly add the correct auth guards across all necessary Nest server endpoints.
3. Complete Auth-Dependent Logic: Fill out the rest of the incomplete functions that rely on user authentication info.

4. Auth Pages: Build Login and Signup pages.
5. Data Fetching Layer: Wire up SWR for data fetching (prioritizing fresh data over global state).
6. Dashboard Data Wiring: Connect the dashboard components to the real backend endpoints.
7. Auth State Handling: Implement "Not logged in" states and protected route redirects.

8. Watchlist CRUD Flow: Build the Create/Edit Watchlist form (Modal/Sheet with asset search and SMA period input - this is the most critical user action!).
9. Sidebar Pages: Implement the remaining pages in the sidebar tabs (`/watchlists`, `/alerts`, `/browse-assets`).

10. Loading States: Add skeleton loaders for dashboard components (Charts, Alerts) so the UI doesn't flash empty.
11. Empty States: Design empty states for when the user has no watchlists or alerts.
12. Toast Notifications: Add toast feedback (via Sonner) for CRUD actions (e.g., "Watchlist created").
13. Error Handling: Add robust error boundaries and handling to critical areas.

14. Terraform Cron: Configure Event Bridge with Terraform to run the Lambda worker every 15 min.
15. Production Database: Setup Prisma migrations for production (`prisma migrate deploy` in the CI/CD or deployment step).
16. Hosting: Deploy the frontend, backend, and database!

---

### Post-MVP

17. Logging: Implement structured, centralized logging across the stack.
18. Theme Toggle: Add a Dark/Light mode switch in the settings tab.
19. Landing Page: Build a public landing page at the root `/` and move the main app to `/dashboard`.
20. Implement the Obseervability layer
21. Update Documentation and make charts/graphs and shit for it
22. GO THROUGH THE GUIDE.md AND SEE IF THERES ANYTHING ELSE LEFT

---

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
- [ ] DO the CORS configurations