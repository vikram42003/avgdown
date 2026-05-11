"use client";

import { BellIcon } from "@phosphor-icons/react";
import { useRecentAlerts } from "@/hooks/useWatchlists";
import { AlertRow, AlertRowSkeleton } from "@/components/dashboard/AlertRow";

export default function AlertsPage() {
  const { alerts, isLoading } = useRecentAlerts();

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <div>
          <h2 className="font-bold text-4xl">Alerts</h2>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {alerts.length} recent alert{alerts.length === 1 ? "" : "s"} · click any row to expand details
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          new Array(6).fill(0).map((_, i) => <AlertRowSkeleton key={i} />) // NOSONAR
        ) : alerts.length === 0 ? (
          <div className="glass rounded-xl px-6 py-16 text-center">
            <BellIcon className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No alerts have fired yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Alerts appear here when an asset price crosses below its SMA.</p>
          </div>
        ) : (
          alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)
        )}
      </div>
    </section>
  );
}
