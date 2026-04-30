"use client";

import { CartesianGrid, Line, LineChart, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatters";
import type { Exchange } from "@avgdown/types";

// ---------------------------------------------------------------------------
// Mock data — mirrors the shape of PriceSnapshotChartDataResponse + metadata
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  /** ISO string — used as X-axis label */
  fetchedAt: string;
  price: number;
  sma: number | null; // null for the first (smaPeriod - 1) points where SMA isn't defined yet
}

interface WatchlistChartEntry {
  entryId: string;
  symbol: string;
  name: string;
  exchange: Exchange;
  smaPeriod: number;
  /** The point where an alert fired, if any */
  alertPoint?: { fetchedAt: string; price: number };
  data: ChartDataPoint[];
}

function generateMockPrices(basePrice: number, smaPeriod: number, count = 40): ChartDataPoint[] {
  const prices: number[] = [];
  let current = basePrice;

  for (let i = 0; i < count; i++) {
    current = current * (1 + (Math.random() - 0.48) * 0.025);
    prices.push(Number.parseFloat(current.toFixed(2)));
  }

  return prices.map((price, i) => {
    const window = prices.slice(Math.max(0, i - smaPeriod + 1), i + 1);
    const sma =
      window.length === smaPeriod ? Number.parseFloat((window.reduce((a, b) => a + b, 0) / smaPeriod).toFixed(2)) : null;

    const date = new Date(Date.now() - (count - i) * 15 * 60 * 1000); // 15-min intervals
    return { fetchedAt: date.toISOString(), price, sma };
  });
}

const MOCK_WATCHLISTS: WatchlistChartEntry[] = [
  {
    entryId: "1",
    symbol: "BTC/USD",
    name: "Bitcoin",
    exchange: "BINANCE",
    smaPeriod: 20,
    alertPoint: undefined,
    data: generateMockPrices(65000, 20),
  },
  {
    entryId: "2",
    symbol: "ETH/USD",
    name: "Ethereum",
    exchange: "COINBASE",
    smaPeriod: 14,
    alertPoint: undefined,
    data: generateMockPrices(3100, 14),
  },
  {
    entryId: "3",
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    smaPeriod: 20,
    alertPoint: undefined,
    data: generateMockPrices(172, 20),
  },
  {
    entryId: "4",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    exchange: "NSE",
    smaPeriod: 10,
    alertPoint: undefined,
    data: generateMockPrices(2850, 10),
  },
];

// Inject a mock alert on the last point of the first watchlist
const btcData = MOCK_WATCHLISTS[0].data;
const alertIdx = btcData.length - 1;
MOCK_WATCHLISTS[0].alertPoint = {
  fetchedAt: btcData[alertIdx].fetchedAt,
  price: btcData[alertIdx].price,
};

// ---------------------------------------------------------------------------
// Chart config — keys must match the `dataKey` props on <Line>
// ---------------------------------------------------------------------------

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--color-primary)",
  },
  sma: {
    label: "SMA",
    color: "var(--color-muted-foreground)",
  },
} satisfies ChartConfig;

function WatchlistChartCard({ entry }: Readonly<{ entry: WatchlistChartEntry }>) {
  const formatPrice = (v: number) => formatCurrency(v, entry.exchange);

  // Abbreviated tick labels to prevent clipping: $69K, $2.8K, ₹2.8K etc.
  // Full price is always shown in the tooltip on hover.
  const formatPriceTick = (v: number) => {
    const sym = getCurrencySymbol(entry.exchange);
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
    return `${sym}${v.toFixed(2)}`;
  };

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-semibold text-base">{entry.symbol}</span>
          <span className="text-muted-foreground text-sm ml-2">· {entry.name}</span>
        </div>
        <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
          SMA-{entry.smaPeriod}
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-40 w-full">
        <LineChart data={entry.data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />

          <XAxis
            dataKey="fetchedAt"
            tickLine={false}
            axisLine={false}
            tick={false} // too dense at 15-min granularity; hide ticks, tooltip handles it
          />

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
                  return new Date(raw).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
                formatter={(value, name) => [
                  formatPrice(Number(value)),
                  name === "price" ? "Price" : `SMA-${entry.smaPeriod}`,
                ]}
              />
            }
          />

          {/* Price line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />

          {/* SMA line - dashed, muted */}
          <Line
            type="monotone"
            dataKey="sma"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
            connectNulls={false}
          />

          {/* Alert marker — red dot where price crossed below SMA */}
          {entry.alertPoint && (
            <ReferenceDot
              x={entry.alertPoint.fetchedAt}
              y={entry.alertPoint.price}
              r={5}
              fill="var(--color-destructive)"
              stroke="var(--background)"
              strokeWidth={1.5}
            />
          )}
        </LineChart>
      </ChartContainer>

      {/* Footer legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-primary" /> Price
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded bg-muted-foreground"
          />
          SMA-{entry.smaPeriod}
        </span>
        {entry.alertPoint && (
          <span className="flex items-center gap-1.5 text-destructive">
            <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> Alert triggered
          </span>
        )}
      </div>
    </div>
  );
}

const WatchlistCharts = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar-primary">
      <h4 className="font-semibold text-lg mb-4 ml-1">Watchlists</h4>
      <div className="grid grid-cols-2 gap-4">
        {MOCK_WATCHLISTS.map((entry) => (
          <WatchlistChartCard key={entry.entryId} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default WatchlistCharts;
