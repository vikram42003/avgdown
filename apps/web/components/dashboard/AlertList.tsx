"use client";

import { BellIcon } from "@phosphor-icons/react";
import { useRecentAlerts } from "@/hooks/useWatchlists";
import { AlertRow, AlertRowSkeleton } from "@/components/dashboard/AlertRow";
import type { RecentAlertResponse } from "@avgdown/types";

interface AlertListProps {
  initialAlerts: RecentAlertResponse[];
}

export function AlertList({ initialAlerts }: Readonly<AlertListProps>) {
  const { alerts, isLoading } = useRecentAlerts(initialAlerts);

  if (isLoading) {
    return (
      <>
        {new Array(6).fill(0).map((_, i) => <AlertRowSkeleton key={i} />)} {/* NOSONAR */}
      </>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="glass rounded-xl px-6 py-16 text-center">
        <BellIcon className="size-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No alerts have fired yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Alerts appear here when an asset price crosses below its SMA.</p>
      </div>
    );
  }

  return (
    <>
      {alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
    </>
  );
}
