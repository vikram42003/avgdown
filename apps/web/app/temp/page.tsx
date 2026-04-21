import { TrendingDown, TrendingUp, BellRing, Plus } from "lucide-react";

export default function TempDesignIdea() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Overview</h1>
          <p className="text-muted text-sm">Your DCA targets and recent activity.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 text-sm shadow-glow cursor-pointer">
          <Plus size={16} />
          Add Watchlist
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: The "Distance to Target" replacement for graphs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Closest to Buying Target</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TargetCard 
              asset="AAPL" 
              name="Apple Inc." 
              currentPrice={168.20} 
              smaTarget={165.00} 
              percentAway={1.9} 
            />
            <TargetCard 
              asset="TSLA" 
              name="Tesla Inc." 
              currentPrice={180.40} 
              smaTarget={172.10} 
              percentAway={4.6} 
            />
            <TargetCard 
              asset="MSFT" 
              name="Microsoft Corp." 
              currentPrice={412.30} 
              smaTarget={395.00} 
              percentAway={4.1} 
            />
            <TargetCard 
              asset="NVDA" 
              name="NVIDIA Corp." 
              currentPrice={880.10} 
              smaTarget={800.00} 
              percentAway={9.1} 
            />
          </div>
        </div>

        {/* Right Side: Alerts Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Alerts</h2>
          <div className="glass rounded-xl p-5 space-y-5 h-[400px] overflow-y-auto">
            <AlertItem asset="AAPL" message="Price dropped below 50-day SMA ($165.00)" time="2h ago" />
            <AlertItem asset="GOOGL" message="Price dropped below 200-day SMA ($130.00)" time="1d ago" />
            <AlertItem asset="AMZN" message="Price dropped below 50-day SMA ($145.00)" time="3d ago" />
            
            {/* Empty state example if there were no alerts:
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
              <BellRing size={32} className="text-muted" />
              <p className="text-sm text-muted">No alerts triggered yet.<br/>We're monitoring the markets.</p>
            </div> 
            */}
          </div>
        </div>

      </div>
    </div>
  );
}

function TargetCard({ asset, name, currentPrice, smaTarget, percentAway }: { asset: string, name: string, currentPrice: number, smaTarget: number, percentAway: number }) {
  // A simple visual trick: if it's 1.9% away, the bar is almost full. 
  // Let's say 10% away is "0% full" and 0% away is "100% full".
  const fillPercentage = Math.max(0, 100 - (percentAway * 10));
  
  return (
    <div className="glass p-5 rounded-xl hover:bg-surface-hover/50 transition-colors border-border group cursor-pointer relative overflow-hidden">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="font-bold text-lg">{asset}</div>
            <div className="text-xs text-muted">{name}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-medium">${currentPrice.toFixed(2)}</div>
            <div className="text-xs text-muted">Target: ${smaTarget.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted">Distance to target</span>
            <span className={`${percentAway < 2 ? 'text-success glow-text' : 'text-brand'}`}>
              {percentAway}% away
            </span>
          </div>
          {/* Progress Bar Track */}
          <div className="w-full h-1.5 bg-[#1a1a1f] rounded-full overflow-hidden border border-border/50">
            {/* Progress Bar Fill */}
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${percentAway < 2 ? 'bg-success' : 'bg-brand'}`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ asset, message, time }: { asset: string; message: string; time: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-foreground">{asset.substring(0, 1)}</span>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm">{asset}</span>
          <span className="text-xs text-muted">{time}</span>
        </div>
        <p className="text-sm text-muted leading-snug">{message}</p>
      </div>
    </div>
  );
}
