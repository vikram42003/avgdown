"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";
import type { AssetType, Exchange } from "@avgdown/types";

const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  STOCK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ETF: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  CRYPTO: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const EXCHANGE_LABEL: Record<Exchange, string> = {
  NASDAQ: "NASDAQ",
  NYSE: "NYSE",
  NSE: "NSE",
  BSE: "BSE",
  BINANCE: "Binance",
  COINBASE: "Coinbase",
};

const AssetCardSkeleton = () => (
  <div className="glass rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default function BrowseAssetsPage() {
  const { assets, isLoading } = useAssets();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<AssetType | "ALL">("ALL");

  const assetTypes: (AssetType | "ALL")[] = ["ALL", "STOCK", "ETF", "CRYPTO"];

  const filtered = assets.filter((a) => {
    const matchesType = activeType === "ALL" || a.assetType === activeType;
    const q = query.toLowerCase();
    const matchesQuery = !q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.exchange.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <div>
          <h2 className="font-bold text-4xl">Browse Assets</h2>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {assets.length} assets across {new Set(assets.map((a) => a.exchange)).size} exchanges
            </p>
          )}
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search by symbol, name or exchange…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 p-1 glass rounded-lg w-fit">
          {assetTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                activeType === type
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {type === "ALL" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {new Array(12).fill(0).map((_, i) => <AssetCardSkeleton key={i} />)} {/* NOSONAR */}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl px-6 py-16 text-center">
          <MagnifyingGlassIcon className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No assets match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((asset) => (
            <div key={asset.id} className="glass rounded-xl p-4 flex flex-col gap-2 hover:bg-primary/5 transition-colors">
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
              <span className="text-xs text-muted-foreground mt-auto">{EXCHANGE_LABEL[asset.exchange as Exchange]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
