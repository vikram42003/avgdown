"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";
import { AssetCard, AssetCardSkeleton } from "@/components/dashboard/AssetCard";
import type { AssetResponse, AssetType } from "@avgdown/types";

const ASSET_TYPES: (AssetType | "ALL")[] = ["ALL", "STOCK", "ETF", "CRYPTO"];

interface AssetGridProps {
  initialAssets: AssetResponse[];
}

export function AssetGrid({ initialAssets }: Readonly<AssetGridProps>) {
  const { assets, isLoading } = useAssets(initialAssets);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<AssetType | "ALL">("ALL");

  const filtered = assets.filter((a) => {
    const matchesType = activeType === "ALL" || a.assetType === activeType;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.exchange.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <>
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

        {/* Sliding pill type filter */}
        <fieldset
          className="relative grid p-1 glass rounded-lg w-fit overflow-hidden border-0 m-0"
          style={{ gridTemplateColumns: `repeat(${ASSET_TYPES.length}, 1fr)` }}
        >
          <legend className="sr-only">Asset type filter</legend>
          <div
            className="absolute top-1 bottom-1 rounded-md bg-primary transition-all duration-200 ease-in-out pointer-events-none"
            style={{
              width: `calc((100% - 8px) / ${ASSET_TYPES.length})`,
              left: `calc(4px + ${ASSET_TYPES.indexOf(activeType)} * (100% - 8px) / ${ASSET_TYPES.length})`,
            }}
          />
          {ASSET_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={activeType === type}
              onClick={() => setActiveType(type)}
              className={cn(
                "relative z-10 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 text-center",
                activeType === type ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {type === "ALL" ? "All" : type}
            </button>
          ))}
        </fieldset>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {new Array(12).fill(0).map((_, i) => (
            <AssetCardSkeleton key={i} /> // NOSONAR
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl px-6 py-16 text-center">
          <MagnifyingGlassIcon className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No assets match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </>
  );
}
