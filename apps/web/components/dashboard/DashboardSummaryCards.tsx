"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlists, useRecentAlerts } from "@/hooks/useWatchlists";
import type { WatchlistEntryResponse, RecentAlertResponse } from "@avgdown/types";

interface DashboardSummaryCardsProps {
  initialWatchlists?: WatchlistEntryResponse[];
  initialAlerts?: RecentAlertResponse[];
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
}

const SummaryCard = ({ title, value, isLoading }: SummaryCardProps) => {
  return (
    <div className="w-full sm:w-[calc(50%-1rem)] lg:flex-1 max-w-64 glass-primary px-2 py-4 rounded-md flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">{title}</div>
      {isLoading ? <Skeleton className="h-7 w-16 mt-0.5 mx-auto" /> : <div className="font-semibold text-xl">{value}</div>}
    </div>
  );
};

const DashboardSummaryCards = ({ initialWatchlists, initialAlerts }: Readonly<DashboardSummaryCardsProps>) => {
  const { watchlists, isLoading: watchlistsLoading } = useWatchlists(initialWatchlists);
  const { alerts, isLoading: alertsLoading } = useRecentAlerts(initialAlerts);

  // Only show loading state when there's no fallback data to display
  const isLoading = watchlistsLoading || alertsLoading;
  const assetCount = new Set(watchlists.map((w) => w.asset.id)).size;

  return (
    <div className="mt-12 mb-8 flex flex-wrap justify-between lg:justify-around gap-8 text-center">
      <SummaryCard title="Recent Alerts" value={alerts.length} isLoading={isLoading} />
      <SummaryCard
        title="Active Watchlists"
        value={watchlists.filter((w) => w.isActive).length}
        isLoading={isLoading}
      />
      <SummaryCard title="Total Assets Tracked" value={assetCount} isLoading={isLoading} />
    </div>
  );
};

export default DashboardSummaryCards;
