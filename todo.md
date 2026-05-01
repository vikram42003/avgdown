Stuff that is left for the MVP -
1. Empty states
2. Not logged in state
3. Dark mode/light mode switch in the settings tab
4. Login and auth pages
5. Wiring up a state management / data fetching layer (SWR probably, no need for global state management solution is what i've concluded after pondering, i should prioritize fresh data in a financial app, and dashboard doesnt fetch the "full" data for it to be used in other pages like /alerts or /watchlists)
6. Actually using the backend for data and auth
7. Properly adding the correct guards in the Nest server
8. Filling out the rest of the incomplete funcs that were dependent on info from auth
9. Implement pages in the sidebar tabs
10. Maybe add a landing page and then move the dashboard to /dashboard and root page would be landing
11. Add error handling to places that might need it pretty importantly
12. Do the same for logging
13. Configure Event Bridge to like do the cron every 15 min with terraform
14. Hosting! and we're done!

`Gaps I'd call out
1. Loading / skeleton states (distinct from empty states) You have "empty states" but not loading states. These are different: empty = no data exists, loading = data is fetching. A dashboard that flashes blank content for 500ms before data arrives feels broken. You need skeleton placeholders for the chart cards and alert list. Shadcn has a Skeleton component already.

2. Create / Edit Watchlist form (this is the core user action) You have a "Create New Watchlist" button on the dashboard. That needs to actually work — a modal/sheet with an asset search and SMA period input. This is arguably the most important user flow in the entire app and it's not explicitly called out under item 9. Worth separating it out.

3. Toast notifications for CRUD actions When a user creates/deletes a watchlist or an action fails, they need feedback. Shadcn has Sonner for this. No one knows if an action succeeded without it.

4. CORS configuration on the NestJS API Once the frontend and API are on different origins (which they will be in production), NestJS will reject every browser request without @nestjs/cors configured. Easy to miss until deployment.

5. Prisma migrations in production prisma migrate dev is for local. In production you need prisma migrate deploy wired into your deployment pipeline. If you skip this, schema changes won't apply when you deploy. Where does this run — in the hosting step? Worth deciding now.

Things I'd not worry about for MVP
Rate limiting — add it, but it's not blocking
Mobile responsiveness — the 2-col chart grid will collapse on small screens, but if this is a personal finance dashboard you're not targeting mobile for V1
Dark/light mode toggle — you have it in your list already; just worth noting it's low-priority vs. the auth/data wiring
Items 3 (CORS) and 5 (Prisma migrations) are the ones most likely to bite you on deploy day and not appear on anyone's list until they do.
`

Productivity Logs -

27 April 2026 - Morning
- [x] Update the colors in the design system for better readability and visual appeal.
- [x] Style sidebar collapse button
- [x] Add the 4 cards for displaying tracked stocks alerts triggered in the past 7 days etc

28 April 2026 - Evening
- [x] Decide on the remaining design for dashboard page
      - it'll be graphs of prices with line for alert on left side and recent alerts on right side
- [-] Add an endpoint to fetch recent price data

29 April 2026 - Afternoon
- [x] Add an endpoint to fetch recent price data
- [-] Style Recent Alerts component

30 April 2026 - Evening
- [x] Fully style Alerts component
- [x] Fully style watchlists component