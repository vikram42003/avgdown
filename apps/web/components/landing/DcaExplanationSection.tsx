"use client";

import { TrendDownIcon, WalletIcon } from "@phosphor-icons/react/dist/ssr";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { month: "Jan", price: 100, standardCost: 100, avgDownCost: 100 },
  { month: "Feb", price: 90, standardCost: 95, avgDownCost: 90 },
  { month: "Mar", price: 85, standardCost: 91.6, avgDownCost: 87.5 },
  { month: "Apr", price: 95, standardCost: 92.5, avgDownCost: 87.5 }, // AvgDown didn't buy
  { month: "May", price: 105, standardCost: 95, avgDownCost: 87.5 }, // AvgDown didn't buy
  { month: "Jun", price: 80, standardCost: 92.5, avgDownCost: 85 },
  { month: "Jul", price: 75, standardCost: 90, avgDownCost: 82.5 },
  { month: "Aug", price: 85, standardCost: 89.3, avgDownCost: 82.5 }, // AvgDown didn't buy
  { month: "Sep", price: 90, standardCost: 89.4, avgDownCost: 82.5 },
  { month: "Oct", price: 100, standardCost: 90.5, avgDownCost: 82.5 },
  { month: "Nov", price: 110, standardCost: 92.2, avgDownCost: 82.5 },
  { month: "Dec", price: 120, standardCost: 94.5, avgDownCost: 82.5 },
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
                <div className="text-2xl font-bold">$94.50</div>
                <div className="text-xs text-muted-foreground mt-1">Final average cost</div>
              </div>
              <div className="glass-primary rounded-xl p-4 relative overflow-hidden border-primary/30">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <TrendDownIcon className="size-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">AvgDown DCA</span>
                </div>
                <div className="text-2xl font-bold">$82.50</div>
                <div className="text-xs text-primary mt-1">12.6% better cost basis</div>
              </div>
            </div>
          </div>

          {/* Right - Chart */}
          <div className="glass-primary rounded-3xl p-6 sm:p-8 relative">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-1">Cost Basis Comparison</h3>
              <p className="text-sm text-muted-foreground">Simulated 12-month volatile market</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAvgDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
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
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
                    domain={['dataMin - 5', 'dataMax + 5']}
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
                      return [`$${value.toFixed(2)}`, undefined];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    name="Standard DCA Cost"
                    dataKey="standardCost" 
                    stroke="var(--color-muted-foreground)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStandard)" 
                  />
                  <Area 
                    type="monotone" 
                    name="AvgDown Cost"
                    dataKey="avgDownCost" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAvgDown)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Legend Custom */}
            <div className="flex flex-wrap items-center gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Standard DCA</span>
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
