import { PageTitle } from "@/components/common/PageTitle";
import { serverFetch } from "@/lib/serverFetch";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import WatchlistCharts from "@/components/dashboard/WatchlistCharts";
import type { WatchlistEntryResponse, RecentAlertResponse } from "@avgdown/types";

export default async function Dashboard() {
  // Fetch both in parallel since neither depends on the other
  const [initialWatchlists, initialAlerts] = await Promise.all([
    serverFetch<WatchlistEntryResponse[]>("/watchlists"),
    serverFetch<RecentAlertResponse[]>("/watchlists/recent-alerts"),
  ]);

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-6">
        <PageTitle title="Overview" />
      </div>

      <DashboardSummaryCards initialWatchlists={initialWatchlists} initialAlerts={initialAlerts} />

      <div className="flex min-h-0 flex-1 gap-8 mt-6">
        <div className="flex-7/10 glass-primary rounded-xl p-4">
          <WatchlistCharts initialWatchlists={initialWatchlists} />
        </div>
        <div className="flex-3/10 glass-primary rounded-xl p-4">
          <RecentAlerts initialAlerts={initialAlerts} />
        </div>
      </div>
    </section>
  );
}
