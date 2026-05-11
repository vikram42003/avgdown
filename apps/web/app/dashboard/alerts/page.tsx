"use client";

import { useState } from "react";
import { CaretDownIcon, BellIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRecentAlerts } from "@/hooks/useWatchlists";
import { formatCurrency } from "@/lib/formatters";
import type { RecentAlertResponse } from "@avgdown/types";

function AlertRow({ alert }: Readonly<{ alert: RecentAlertResponse }>) {
  const [expanded, setExpanded] = useState(false);

  const { asset, smaPeriod } = alert.watchlistEntry;
  const triggeredAt = new Date(alert.createdAt);
  const priceDiff = alert.triggeredPrice - alert.smaValue;
  const priceDiffPct = ((priceDiff / alert.smaValue) * 100).toFixed(2);
  const formattedPrice = formatCurrency(alert.triggeredPrice, asset.exchange);
  const formattedSma = formatCurrency(alert.smaValue, asset.exchange);

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Summary row - always visible */}
      <button
        type="button"
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-primary/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {/* Asset icon */}
        <div className="flex items-center justify-center size-9 rounded-lg bg-destructive/10 shrink-0">
          <BellIcon weight="fill" className="size-4 text-destructive" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base">{asset.symbol}</span>
            <span className="text-sm text-muted-foreground truncate">{asset.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Price crossed below SMA-{smaPeriod} · {triggeredAt.toLocaleDateString(undefined, {
              month: "short", day: "numeric", year: "numeric",
            })}
          </p>
        </div>

        {/* Price badge */}
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="font-mono font-semibold text-sm">{formattedPrice}</span>
          <span className="text-xs text-destructive font-medium">{priceDiffPct}% below SMA</span>
        </div>

        {/* Expand chevron */}
        <CaretDownIcon
          className={cn("size-4 text-muted-foreground shrink-0 transition-transform", expanded && "rotate-180")}
        />
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-card/30">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Triggered Price</span>
            <span className="font-mono font-semibold">{formattedPrice}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">SMA-{smaPeriod} Value</span>
            <span className="font-mono font-semibold">{formattedSma}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Difference</span>
            <span className="font-mono font-semibold text-destructive">
              {formatCurrency(Math.abs(priceDiff), asset.exchange)} ({priceDiffPct}%)
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Exchange</span>
            <span className="font-semibold">{asset.exchange}</span>
          </div>
          <div className="col-span-2 sm:col-span-4 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Triggered At</span>
            <span className="text-foreground">
              {triggeredAt.toLocaleString(undefined, {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const AlertRowSkeleton = () => (
  <div className="glass rounded-xl px-5 py-4 flex items-center gap-4">
    <Skeleton className="size-9 rounded-lg shrink-0" />
    <div className="flex flex-col gap-1.5 flex-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-4 w-20 hidden sm:block" />
    <Skeleton className="size-4 rounded" />
  </div>
);

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
