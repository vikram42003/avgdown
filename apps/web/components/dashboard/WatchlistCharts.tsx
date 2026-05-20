"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { CartesianGrid, Line, LineChart, ReferenceDot, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PencilSimpleIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatters";
import { useWatchlists, useChartData } from "@/hooks/useWatchlists";
import { WatchlistFormSheet } from "@/components/dashboard/WatchlistFormSheet";
import { apiMutateVoid } from "@/lib/api";
import type { WatchlistEntryResponse } from "@avgdown/types";

interface WatchlistChartsProps {
  initialWatchlists?: WatchlistEntryResponse[];
}

// Chart config - keys must match the dataKey props on <Line>
const chartConfig = {
  close: { label: "Close", color: "var(--color-primary)" },
  sma: { label: "SMA", color: "var(--color-muted-foreground)" },
} satisfies ChartConfig;

interface ChartDataPoint {
  date: string;
  close: number;
  sma: number | null;
}

// Individual chart card

interface WatchlistChartCardProps {
  entry: WatchlistEntryResponse;
  onEditRequest: (entry: WatchlistEntryResponse) => void;
}

function WatchlistChartCard({ entry, onEditRequest }: Readonly<WatchlistChartCardProps>) {
  const { chartData, isLoading } = useChartData(entry.id);
  const { mutate } = useSWRConfig();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Format prices so that they look good on the chart
  const formatPrice = (v: number) => formatCurrency(v, entry.asset.exchange);
  const formatPriceTick = (v: number) => {
    const sym = getCurrencySymbol(entry.asset.exchange);
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
    return `${sym}${v.toFixed(2)}`;
  };

  const data: ChartDataPoint[] =
    chartData?.points.map((p) => {
      let normalizedDate = p.date;
      if (typeof p.date !== "string") {
        const year = p.date.getUTCFullYear();
        const month = String(p.date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(p.date.getUTCDate()).padStart(2, "0");
        normalizedDate = `${year}-${month}-${day}`;
      }
      return {
        date: normalizedDate,
        close: p.close,
        sma: p.sma,
      };
    }) ?? [];
  const isWarmingUp = chartData?.status === "WARMING_UP";

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiMutateVoid(`/watchlists/${entry.id}`, "DELETE");
      await mutate("/watchlists");
      toast.success(`Removed ${entry.asset.symbol} from watchlist`);
    } catch {
      toast.error("Failed to remove watchlist entry");
    } finally {
      setDeleteOpen(false);
      setDeleting(false);
    }
  }

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      {/* Card header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="font-semibold text-base">{entry.asset.symbol}</span>
          <span className="text-muted-foreground text-sm truncate">· {entry.asset.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
            SMA-{entry.smaPeriod}
          </span>

          {/* Edit */}
          <Button
            variant="ghost"
            size="sm"
            className="size-7 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Edit watchlist entry"
            onClick={() => onEditRequest(entry)}
          >
            <PencilSimpleIcon className="size-3.5" />
          </Button>

          {/* Delete with inline confirmation */}
          <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete watchlist entry"
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 glass p-3" align="end">
              <p className="text-sm font-medium mb-1">Remove {entry.asset.symbol}?</p>
              <p className="text-xs text-muted-foreground mb-3">This will permanently delete this watchlist entry.</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Removing…" : "Remove"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : isWarmingUp && data.length === 0 ? (
        <div className="h-40 w-full rounded-lg border border-border/60 bg-muted/20 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Preparing daily chart data
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />

            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={false} />

            <YAxis
              domain={["auto", "auto"]}
              tickLine={false}
              axisLine={false}
              width={45}
              tickFormatter={formatPriceTick}
              tick={{ fontSize: 10.5, fill: "var(--color-foreground)" }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const raw = payload?.[0]?.payload?.date;
                    if (!raw) return "";
                    return new Date(raw).toLocaleDateString(undefined, {
                      timeZone: "UTC",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name) => [
                    formatPrice(Number(value)),
                    name === "close" ? "Close" : `SMA-${entry.smaPeriod}`,
                  ]}
                />
              }
            />

            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="sma"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              connectNulls={false}
            />

            {/* Alert marker - shown if the last SMA value is above the last price */}
            {data.length > 0 &&
              (() => {
                const last = data.at(-1)!;
                if (last.sma !== null && last.close < last.sma) {
                  return (
                    <ReferenceDot
                      x={last.date}
                      y={last.close}
                      r={5}
                      fill="var(--color-destructive)"
                      stroke="var(--background)"
                      strokeWidth={1.5}
                    />
                  );
                }
                return null;
              })()}
          </LineChart>
        </ChartContainer>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-primary" /> Close
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-muted-foreground" />
          SMA-{entry.smaPeriod}
        </span>
      </div>
    </div>
  );
}

// Skeleton for the whole card while the watchlist list loads
const ChartCardSkeleton = () => (
  <div className="glass rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-40 w-full rounded-lg" />
  </div>
);

// Container for the Charts

const WatchlistCharts = ({ initialWatchlists }: Readonly<WatchlistChartsProps>) => {
  const { watchlists, isLoading } = useWatchlists(initialWatchlists);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WatchlistEntryResponse | undefined>(undefined);

  function handleAddNew() {
    setEditingEntry(undefined);
    setSheetOpen(true);
  }

  function handleEditRequest(entry: WatchlistEntryResponse) {
    setEditingEntry(entry);
    setSheetOpen(true);
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar-primary">
      <div className="flex items-center justify-between mb-4 ml-1">
        <h4 className="font-semibold text-lg">Watchlists</h4>
        <Button size="sm" onClick={handleAddNew} className="gap-1.5">
          <PlusIcon className="size-4" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          new Array(4).fill(0).map((_, i) => <ChartCardSkeleton key={i} />) // NOSONAR: its a static set of skeletons bro shut up sonar line
        ) : watchlists.length === 0 ? (
          <p className="col-span-2 text-sm text-muted-foreground ml-1">
            No watchlists yet.{" "}
            <button type="button" className="text-primary hover:underline" onClick={handleAddNew}>
              Add one to get started!
            </button>
          </p>
        ) : (
          watchlists.map((entry) => (
            <WatchlistChartCard key={entry.id} entry={entry} onEditRequest={handleEditRequest} />
          ))
        )}
      </div>

      {/* Single form sheet instance — create or edit depending on editingEntry */}
      <WatchlistFormSheet open={sheetOpen} onOpenChange={setSheetOpen} entry={editingEntry} />
    </div>
  );
};

export default WatchlistCharts;
