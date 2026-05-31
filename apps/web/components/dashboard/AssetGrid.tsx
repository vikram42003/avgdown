"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";
import { useAssetSearch } from "@/hooks/useAssetSearch";
import { AssetCard, AssetCardSkeleton } from "@/components/dashboard/AssetCard";
import { WatchlistFormSheet } from "@/components/dashboard/WatchlistFormSheet";
import type { AssetResponse, AssetType, AssetSearchResult } from "@avgdown/types";

const ASSET_TYPES: (AssetType | "ALL")[] = ["ALL", "STOCK", "ETF", "CRYPTO"];

interface AssetGridProps {
  initialAssets: AssetResponse[];
}

export function AssetGrid({ initialAssets }: Readonly<AssetGridProps>) {
  const { assets, isLoading } = useAssets(initialAssets);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<AssetType | "ALL">("ALL");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<AssetResponse | null>(null);
  const [prefilledSearchResult, setPrefilledSearchResult] = useState<AssetSearchResult | null>(null);

  // Debounced search query for the backend
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 600);
    return () => clearTimeout(timer);
  }, [query]);

  const { results: searchResults, isLoading: searchLoading } = useAssetSearch(debouncedQuery);

  // True when the user has typed something and we should show search results
  const isSearching = query.trim().length > 0;

  const handleCreateWatchlist = (asset: AssetResponse) => {
    setPrefilledAsset(asset);
    setPrefilledSearchResult(null);
    setSheetOpen(true);
  };

  const handleCreateFromSearch = (result: AssetSearchResult) => {
    setPrefilledSearchResult(result);
    setPrefilledAsset(null);
    setSheetOpen(true);
  };

  // Filter popular assets locally (type filter only applies to popular section)
  const filtered = assets.filter((a) => {
    const matchesType = activeType === "ALL" || a.assetType === activeType;
    return matchesType;
  });

  return (
    <>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search any ticker or company name..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Sliding pill type filter — only shown when not searching */}
        {!isSearching && (
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
        )}
      </div>

      {/* Contextual search hints */}
      {isSearching ? (
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground/90">
              <span className="font-mono text-muted-foreground">.NS</span> = NSE
            </span>
            <span className="text-muted-foreground/80">·</span>
            <span className="text-muted-foreground/90">
              <span className="font-mono text-muted-foreground">.BO</span> = BSE
            </span>
            <span className="text-muted-foreground/80">·</span>
            <span className="text-muted-foreground/90">
              <span className="font-mono text-muted-foreground">INAV</span> tickers are ETF pricing instruments, not directly tradeable
            </span>
          </div>
          <span className="text-xs text-muted-foreground/75">
            Same company name may appear from multiple countries — check the exchange
          </span>
        </div>
      ) : null}

      {isSearching ? (
        // Search results section
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {searchLoading ? "Searching..." : `Search results for "${query}"`}
          </h3>
          {searchLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {new Array(4).fill(0).map((_, i) => (
                <AssetCardSkeleton key={i} /> // NOSONAR
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="glass rounded-xl px-6 py-16 text-center">
              <MagnifyingGlassPlusIcon className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {searchResults.map((result) => (
                <SearchResultCard
                  key={`${result.symbol}:${result.exchange}`}
                  result={result}
                  onAdd={handleCreateFromSearch}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Popular assets section
        <>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Assets</h3>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {new Array(12).fill(0).map((_, i) => (
                <AssetCardSkeleton key={i} /> // NOSONAR
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-xl px-6 py-16 text-center">
              <MagnifyingGlassIcon className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No assets match your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onCreateWatchlist={handleCreateWatchlist} />
              ))}
            </div>
          )}
        </>
      )}

      <WatchlistFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        prefilledAsset={prefilledAsset}
        prefilledSearchResult={prefilledSearchResult}
      />
    </>
  );
}

/**
 * Card for search results — similar to AssetCard but works with AssetSearchResult
 * (which may not have a DB id yet).
 */
function SearchResultCard({
  result,
  onAdd,
}: Readonly<{ result: AssetSearchResult; onAdd: (result: AssetSearchResult) => void }>) {
  return (
    <button
      type="button"
      onClick={() => onAdd(result)}
      className="group relative glass rounded-xl p-4 flex flex-col gap-2 hover:bg-primary/5 transition-colors text-left w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-sm break-all leading-snug">{result.symbol}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 bg-primary/10 text-primary border-primary/20">
          {result.assetType}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-snug">{result.name}</p>
      <span className="text-xs text-muted-foreground mt-auto">{result.exchange}</span>
    </button>
  );
}
