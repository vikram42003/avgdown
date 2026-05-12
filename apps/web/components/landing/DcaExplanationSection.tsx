"use client";

import { TrendDownIcon, WalletIcon } from "@phosphor-icons/react/dist/ssr";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip,
  ComposedChart, Line, Scatter, ZAxis
} from "recharts";

const data = [
  { month: "Jan", price: 100, standardValue: 100, avgDownValue: 100, standardBuy: 100, avgDownBuy: null },
  { month: "Feb", price: 85,  standardValue: 190, avgDownValue: 210, standardBuy: 85,  avgDownBuy: 85 },
  { month: "Mar", price: 80,  standardValue: 275, avgDownValue: 430, standardBuy: 80,  avgDownBuy: 80 },
  { month: "Apr", price: 95,  standardValue: 395, avgDownValue: 510, standardBuy: 95,  avgDownBuy: null },
  { month: "May", price: 110, standardValue: 540, avgDownValue: 590, standardBuy: 110, avgDownBuy: null },
  { month: "Jun", price: 90,  standardValue: 650, avgDownValue: 800, standardBuy: 90,  avgDownBuy: 90 },
  { month: "Jul", price: 75,  standardValue: 720, avgDownValue: 1050, standardBuy: 75,  avgDownBuy: 75 },
  { month: "Aug", price: 85,  standardValue: 860, avgDownValue: 1190, standardBuy: 85,  avgDownBuy: null },
  { month: "Sep", price: 100, standardValue: 1050, avgDownValue: 1400, standardBuy: 100, avgDownBuy: null },
  { month: "Oct", price: 115, standardValue: 1250, avgDownValue: 1610, standardBuy: 115, avgDownBuy: null },
  { month: "Nov", price: 95,  standardValue: 1360, avgDownValue: 1850, standardBuy: 95,  avgDownBuy: 95 },
  { month: "Dec", price: 125, standardValue: 1650, avgDownValue: 2430, standardBuy: 125, avgDownBuy: null },
];

export function DcaExplanationSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <div>
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">
              Why Average Down?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Buy the dips, <br className="hidden sm:block" />
              skip the peaks.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Dollar-Cost Averaging (DCA) is a popular strategy where you invest a fixed amount regularly, regardless of the price. While it reduces the impact of volatility, it means you&apos;re still buying when the asset is overbought.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              <strong>AvgDown</strong> takes this a step further. By monitoring the Simple Moving Average (SMA), it alerts you to invest <em>only</em> when the asset is trading below its recent average. This ensures you are strictly accumulating during dips, driving your average cost basis much lower over time.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-primary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <WalletIcon className="size-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Blind DCA</span>
                </div>
                <div className="text-2xl font-bold">$1,650</div>
                <div className="text-xs mt-1">Final portfolio value</div>
              </div>
              <div className="glass-primary rounded-xl p-4 relative overflow-hidden border-primary/30">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <TrendDownIcon className="size-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">AvgDown DCA</span>
                </div>
                <div className="text-2xl font-bold">$2,430</div>
                <div className="text-xs mt-1">+47% higher total value</div>
              </div>
            </div>
          </div>

          {/* Right - Charts Stack */}
          <div className="glass-primary rounded-3xl p-6 sm:p-8 relative flex flex-col gap-8">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
            
            {/* Top Chart: Portfolio Value */}
            <div className="relative">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1">1. The Reward</h3>
                <p className="text-sm text-muted-foreground">Total Portfolio Value (Cumulative)</p>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAvgDown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-muted-foreground)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-card)', 
                        borderColor: 'var(--color-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--color-foreground)'
                      }}
                      itemStyle={{ color: 'var(--color-foreground)' }}
                      formatter={(value: unknown) => {
                        if (typeof value !== "number") return ["", undefined];
                        return [`$${value}`, undefined];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      name="Standard Portfolio"
                      dataKey="standardValue" 
                      stroke="var(--color-muted-foreground)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorStandard)" 
                    />
                    <Area 
                      type="monotone" 
                      name="AvgDown Portfolio"
                      dataKey="avgDownValue" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAvgDown)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-border opacity-50 relative" />

            {/* Bottom Chart: Asset Price & Action */}
            <div className="relative">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1">2. The Action</h3>
                <p className="text-sm text-muted-foreground">Volatile Asset Price & Buying Points</p>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} 
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-card)', 
                        borderColor: 'var(--color-border)',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value: unknown, name: string) => {
                        if (typeof value !== "number") return ["", undefined];
                        if (name === "Asset Price") return [`$${value}`, "Asset Price"];
                        if (name === "Standard Buy") return [`Bought at $${value}`, "Standard Buy"];
                        if (name === "AvgDown Buy") return [`Bought at $${value}`, "AvgDown Buy"];
                        return [value, name];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      name="Asset Price"
                      stroke="var(--color-foreground)" 
                      strokeOpacity={0.6}
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                    />
                    <ZAxis range={[60, 60]} />
                    <Scatter dataKey="standardBuy" name="Standard Buy" fill="var(--color-muted-foreground)" />
                    <Scatter dataKey="avgDownBuy" name="AvgDown Buy" fill="var(--color-primary)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Shared Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-2 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Standard Approach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                <span className="text-xs font-medium text-foreground">AvgDown Approach</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
