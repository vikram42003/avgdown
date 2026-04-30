import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import RecentAlerts from "@/components/dashboard/RecentAlerts";

export default function Dashboard() {
  return (
    <section className="flex flex-1 flex-col">
      {/* Putting down all the stuff i might need on this page in a div */}
      <div className="flex shrink-0 items-center justify-between mb-6">
        <h2 className="font-bold text-4xl">Overview</h2>

        <Button size="lg" className="rounded-md">
          <PlusIcon />
          Create New Watchlist
        </Button>
      </div>

      <DashboardSummaryCards />

      <div className="flex min-h-0 flex-1 gap-12 mt-6">
        <div className="flex-1 bg-red-500/20 rounded-xl p-4">
          graphs for like the stock prices, updates every 15 min in tandem with our lambda worker some stat cards or
          whatever like alerts triggered in last week, watchlists youre tracking all that
        </div>
        <div className="w-80 glass-primary rounded-xl p-4">
          <RecentAlerts />
        </div>
      </div>
      {/* Do not forget some sort of empty state, like no alerts no watchlists */}
    </section>
  );
}
