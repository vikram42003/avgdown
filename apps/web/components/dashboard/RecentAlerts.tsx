"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { useRecentAlerts } from "@/hooks/useWatchlists";
import type { RecentAlertResponse } from "@avgdown/types";

const AlertCard = ({ alert }: { alert: RecentAlertResponse }) => {
  const exchange = alert.watchlistEntry.asset.exchange;
  const rawDelta = alert.smaValue === 0 ? Number.NaN : ((alert.triggeredPrice - alert.smaValue) / alert.smaValue) * 100;
  const deltaPctStr = Number.isFinite(rawDelta) ? `${rawDelta.toFixed(2)}%` : "N/A";

  return (
    <div className="glass px-3 py-2 rounded space-y-1">
      <p className="font-medium">
        {alert.watchlistEntry.asset.symbol}{" "}
        <span className="font-normal text-muted-foreground text-sm">· {alert.watchlistEntry.asset.name}</span>
      </p>
      <p className="text-sm">
        {formatCurrency(alert.triggeredPrice, exchange)} crossed below SMA-{alert.watchlistEntry.smaPeriod} (
        {formatCurrency(alert.smaValue, exchange)})
        <br />
        <span className="text-destructive font-medium">{deltaPctStr}</span>
      </p>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatRelativeTime(alert.createdAt)}</span>
        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const AlertCardSkeleton = () => (
  <div className="glass px-3 py-2 rounded space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-3 w-24" />
  </div>
);

const RecentAlerts = () => {
  const { alerts, isLoading } = useRecentAlerts();

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 ml-4">Recent Alerts</h3>
      <div className="space-y-3 max-h-155 overflow-y-auto custom-scrollbar-primary">
        {isLoading ? (
          new Array(6).fill(0).map((_, i) => <AlertCardSkeleton key={i} />) // NOSONAR: its a static set of skeletons bro shut up sonar line
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground ml-4">No recent alerts.</p>
        ) : (
          alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
