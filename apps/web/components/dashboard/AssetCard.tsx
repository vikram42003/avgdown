import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AssetResponse, AssetType, Exchange } from "@avgdown/types";

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  STOCK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ETF: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  CRYPTO: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export const EXCHANGE_LABEL: Record<Exchange, string> = {
  NASDAQ: "NASDAQ",
  NYSE: "NYSE",
  NSE: "NSE",
  BSE: "BSE",
  BINANCE: "Binance",
  COINBASE: "Coinbase",
};

export function AssetCard({ asset }: Readonly<{ asset: AssetResponse }>) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2 hover:bg-primary/5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-base">{asset.symbol}</span>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
          ASSET_TYPE_COLORS[asset.assetType],
        )}>
          {asset.assetType}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{asset.name}</p>
      <span className="text-xs text-muted-foreground mt-auto">{EXCHANGE_LABEL[asset.exchange]}</span>
    </div>
  );
}

export const AssetCardSkeleton = () => (
  <div className="glass rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);
