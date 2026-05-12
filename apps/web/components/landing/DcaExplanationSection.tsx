"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  AreaChart,
  Area,
  Line,
  ReferenceDot,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Static data
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SIP_GROWTH = [120, 220, 310, 420, 510, 630, 750, 890, 1010, 1150, 1380, 1650];
const AVG_GROWTH = [140, 270, 390, 540, 670, 820, 1010, 1180, 1380, 1620, 1980, 2430];
const ASSET_PRICES = [102, 86, 78, 91, 108, 113, 82, 75, 88, 105, 112, 129];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  color: "var(--color-foreground)",
  fontSize: 11,
};

export function DcaExplanationSection() {
  const chartData = useMemo<{ month: string; price: number; sma: number | null }[]>(
    () =>
      MONTHS.map((month, i) => {
        const price = ASSET_PRICES[i] ?? 0;
        const prev1 = ASSET_PRICES[i - 1] ?? 0;
        const prev2 = ASSET_PRICES[i - 2] ?? 0;
        const sma = i < 2 ? null : Math.round((price + prev1 + prev2) / 3);
        return { month, price, sma };
      }),
    [],
  );

  // Buy signal months: price < 3-mo SMA
  const buySignals = useMemo(() => chartData.filter((d) => d.sma !== null && d.price < d.sma), [chartData]);

  const growthData = MONTHS.map((month, i) => ({
    month,
    sip: SIP_GROWTH[i],
    avgDown: AVG_GROWTH[i],
  }));

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Why Average Down?</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
              Buy the dips. <span className="text-primary italic">Not the peaks.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Regular DCA buys on a fixed schedule - peak or dip, it doesn&apos;t care.{" "}
              <strong className="text-foreground">AvgDown</strong> watches the Simple Moving Average and only triggers a
              buy when the asset trades <em>below</em> its recent average - meaning every dollar goes in at a discount.
            </p>
          </div>

          {/* Comparison strip */}
          <div className="grid grid-cols-2 divide-x divide-border border border-border/40 rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Regular DCA
                </span>
              </div>
              <div className="text-3xl font-bold text-muted-foreground">$1,650</div>
              <div className="text-xs text-muted-foreground mt-1">Final portfolio value</div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-widest">AvgDown DCA</span>
              </div>
              <div className="text-3xl font-bold text-primary">$2,430</div>
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary mt-2">
                +47% higher value
              </span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Portfolio Growth */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Portfolio Growth Over Time
              </p>
              <div className="flex items-center gap-5 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-dashed border-muted-foreground/70" />
                  <span className="text-[11px] text-muted-foreground">Regular DCA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-primary" />
                  <span className="text-[11px] text-foreground">AvgDown</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={176} minWidth={0}>
                <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillAvgDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                    tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: unknown, name: string | number | undefined) =>
                      typeof v === "number"
                        ? [`$${v.toLocaleString()}`, String(name) === "sip" ? "Regular DCA" : "AvgDown"]
                        : [String(v), String(name)]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="sip"
                    name="sip"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgDown"
                    name="avgDown"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#fillAvgDown)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right - Asset Price & Buy Signals */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Asset Price &amp; Buy Signals
              </p>
              <div className="flex items-center gap-5 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-dashed border-muted-foreground/70" />
                  <span className="text-[11px] text-muted-foreground">Price</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-primary" />
                  <span className="text-[11px] text-foreground">SMA (3-mo)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-foreground">Buy</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={176} minWidth={0}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                    tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                    domain={["dataMin - 8", "dataMax + 8"]}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: unknown, name: string | number | undefined) => {
                      if (typeof v !== "number") return [String(v), String(name)];
                      if (String(name) === "price") return [`$${v}`, "Asset Price"];
                      if (String(name) === "sma") return [`$${v}`, "3-mo SMA"];
                      return [`$${v}`, String(name)];
                    }}
                  />
                  {/* Asset price - dashed muted */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="price"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                  {/* 3-mo SMA - solid primary, skip first 2 nulls */}
                  <Line
                    type="monotone"
                    dataKey="sma"
                    name="sma"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls
                  />
                  {/* Buy signals - ReferenceDot per buy month, guaranteed to render */}
                  {buySignals.map((d) => (
                    <ReferenceDot
                      key={d.month}
                      x={d.month}
                      y={d.price}
                      r={5}
                      fill="var(--color-primary)"
                      stroke="var(--color-background)"
                      strokeWidth={1.5}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-center text-muted-foreground/50">
            Hypothetical simulation for illustration only. Not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
