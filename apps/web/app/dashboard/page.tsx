import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import WatchlistCharts from "@/components/dashboard/WatchlistCharts";

export default function Dashboard() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-6">
        <h2 className="font-bold text-4xl">Overview</h2>
      </div>

      <DashboardSummaryCards />

      <div className="flex min-h-0 flex-1 gap-8 mt-6">
        <div className="flex-7/10 glass-primary rounded-xl p-4">
          <WatchlistCharts />
        </div>
        <div className="flex-3/10 glass-primary rounded-xl p-4">
          <RecentAlerts />
        </div>
      </div>
    </section>
  );
}
