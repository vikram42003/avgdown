"use client";

import { CartesianGrid, Line, LineChart, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatters";
import { useWatchlists, useChartData } from "@/hooks/useWatchlists";
import type { WatchlistEntryResponse, PriceSnapshotResponse } from "@avgdown/types";

// Chart config - keys must match the dataKey props on <Line>
const chartConfig = {
  price: { label: "Price", color: "var(--color-primary)" },
  sma: { label: "SMA", color: "var(--color-muted-foreground)" },
} satisfies ChartConfig;

// Normalise the API response ({ prices[], sma[] }) into the flat shape recharts needs
interface ChartDataPoint {
  fetchedAt: string;
  price: number;
  sma: number | null;
}

// Individual chart card

function WatchlistChartCard({ entry }: Readonly<{ entry: WatchlistEntryResponse }>) {
  const { chartData, isLoading } = useChartData(entry.id);

  // Format prices so that they look good on the chart
  const formatPrice = (v: number) => formatCurrency(v, entry.asset.exchange);
  const formatPriceTick = (v: number) => {
    const sym = getCurrencySymbol(entry.asset.exchange);
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
    return `${sym}${v.toFixed(2)}`;
  };

  // Normalise into flat points
  const data: ChartDataPoint[] =
    chartData?.prices.map((p: PriceSnapshotResponse, i: number) => ({
      fetchedAt: typeof p.fetchedAt === "string" ? p.fetchedAt : p.fetchedAt.toISOString(),
      price: p.price,
      sma: chartData.sma[i] ?? null,
    })) ?? [];

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-semibold text-base">{entry.asset.symbol}</span>
          <span className="text-muted-foreground text-sm ml-2">· {entry.asset.name}</span>
        </div>
        <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
          SMA-{entry.smaPeriod}
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : (
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />

            <XAxis dataKey="fetchedAt" tickLine={false} axisLine={false} tick={false} />

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
                    const raw = payload?.[0]?.payload?.fetchedAt;
                    if (!raw) return "";
                    return new Date(raw).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name) => [
                    formatPrice(Number(value)),
                    name === "price" ? "Price" : `SMA-${entry.smaPeriod}`,
                  ]}
                />
              }
            />

            <Line
              type="monotone"
              dataKey="price"
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

            {/* Alert marker — shown if the last SMA value is above the last price */}
            {data.length > 0 &&
              (() => {
                const last = data.at(-1)!;
                if (last.sma !== null && last.price < last.sma) {
                  return (
                    <ReferenceDot
                      x={last.fetchedAt}
                      y={last.price}
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
          <span className="inline-block h-0.5 w-4 rounded bg-primary" /> Price
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
    <div className="flex items-baseline justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-40 w-full rounded-lg" />
  </div>
);

// Container for the Charts

const WatchlistCharts = () => {
  const { watchlists, isLoading } = useWatchlists();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar-primary">
      <h4 className="font-semibold text-lg mb-4 ml-1">Watchlists</h4>
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          new Array(4).fill(0).map((_, i) => <ChartCardSkeleton key={i} />) // NOSONAR: its a static set of skeletons bro shut up sonar line
        ) : watchlists.length === 0 ? (
          <p className="col-span-2 text-sm text-muted-foreground ml-1">No watchlists yet. Create one to get started!</p>
        ) : (
          watchlists.map((entry) => <WatchlistChartCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
};

export default WatchlistCharts;
