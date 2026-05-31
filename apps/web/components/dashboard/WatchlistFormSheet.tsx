"use client";

import { useState, useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SpinnerButton } from "@/components/ui/spinner-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";
import { apiMutate } from "@/lib/api";
import type { WatchlistEntryResponse, AssetResponse, AssetSearchResult, WatchlistEntryUpdateDto } from "@avgdown/types";

interface WatchlistFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // undefined = create mode, defined = edit mode
  entry?: WatchlistEntryResponse;
  prefilledAsset?: AssetResponse | null;
  prefilledSearchResult?: AssetSearchResult | null;
}

type SelectedAsset =
  | { kind: "existing"; asset: AssetResponse }
  | { kind: "search"; result: AssetSearchResult };

export function WatchlistFormSheet({
  open,
  onOpenChange,
  entry,
  prefilledAsset,
  prefilledSearchResult,
}: Readonly<WatchlistFormSheetProps>) {
  const { mutate } = useSWRConfig();
  const { assets, isLoading: assetsLoading } = useAssets();
  const isEditMode = !!entry;

  // Form state
  const [selected, setSelected] = useState<SelectedAsset | null>(null);
  const [assetQuery, setAssetQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(20);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset / pre-populate whenever the sheet opens
  useEffect(() => {
    if (!open) return;
    setError(null);
    setDropdownOpen(false);
    if (entry) {
      setSelected({ kind: "existing", asset: entry.asset });
      setAssetQuery(entry.asset.symbol);
      setSmaPeriod(entry.smaPeriod);
      setIsActive(entry.isActive);
    } else if (prefilledSearchResult) {
      setSelected({ kind: "search", result: prefilledSearchResult });
      setAssetQuery(prefilledSearchResult.symbol);
      setSmaPeriod(20);
      setIsActive(true);
    } else if (prefilledAsset) {
      setSelected({ kind: "existing", asset: prefilledAsset });
      setAssetQuery(prefilledAsset.symbol);
      setSmaPeriod(20);
      setIsActive(true);
    } else {
      setSelected(null);
      setAssetQuery("");
      setSmaPeriod(20);
      setIsActive(true);
    }
  }, [open, entry, prefilledAsset, prefilledSearchResult]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Client-side asset filtering for the dropdown — max 8 results shown at once
  const filteredAssets = assets
    .filter(({ symbol, name }) => {
      const q = assetQuery.toLowerCase();
      return symbol.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    })
    .slice(0, 8);

  function handleAssetSelect(asset: AssetResponse) {
    setSelected({ kind: "existing", asset });
    setAssetQuery(asset.symbol);
    setDropdownOpen(false);
  }

  function handleAssetQueryChange(value: string) {
    setAssetQuery(value);
    setSelected(null);
    setDropdownOpen(value.length > 0);
  }

  function handleClearAsset() {
    setSelected(null);
    setAssetQuery("");
    setDropdownOpen(false);
  }

  // Derived display info from whatever is selected
  const selectedSymbol = selected?.kind === "existing" ? selected.asset.symbol : selected?.result.symbol;
  const selectedName =
    selected?.kind === "existing" ? selected.asset.name : selected?.result.name;
  const selectedExchange =
    selected?.kind === "existing" ? selected.asset.exchange : selected?.result.exchange;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    setError(null);

    if (!selected) {
      setError("Please select an asset.");
      return;
    }
    if (!Number.isFinite(smaPeriod) || smaPeriod < 1 || smaPeriod > 250) {
      setError("SMA period must be a valid number between 1 and 250.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        const payload: WatchlistEntryUpdateDto = {
          assetId: selected.kind === "existing" ? selected.asset.id : undefined,
          smaPeriod,
          isActive,
        };
        await apiMutate<WatchlistEntryResponse>(`/watchlists/${entry.id}`, "PATCH", payload);
        toast.success(`Updated ${selectedSymbol} watchlist entry`);
      } else {
        // Build create payload — either existing asset or new from search
        let payload: Record<string, unknown>;

        if (selected.kind === "existing") {
          payload = { assetId: selected.asset.id, smaPeriod, isActive: true };
        } else if (selected.result.existingAssetId) {
          // Search result that already exists in our DB
          payload = { assetId: selected.result.existingAssetId, smaPeriod, isActive: true };
        } else {
          // Brand new asset from search
          payload = {
            symbol: selected.result.symbol,
            exchange: selected.result.exchange,
            name: selected.result.name,
            assetType: selected.result.assetType,
            smaPeriod,
            isActive: true,
          };
        }

        await apiMutate<WatchlistEntryResponse>("/watchlists", "POST", payload);
        toast.success(`Added ${selectedSymbol} to watchlist`);
      }
      await mutate("/watchlists");
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const renderDropdownContent = () => {
    if (assetsLoading) {
      return (
        <div className="flex flex-col gap-2 p-2">
          {["sk-1", "sk-2", "sk-3"].map((key) => <Skeleton key={key} className="h-9 w-full" />)}
        </div>
      );
    }
    if (filteredAssets.length === 0) {
      return <p className="text-sm text-muted-foreground p-3">No popular assets found. Try the search on the browse page.</p>;
    }
    return (
      <ul className="max-h-52 overflow-y-auto custom-scrollbar-primary">
        {filteredAssets.map((asset) => (
          <li key={asset.id}>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 transition-colors text-left"
              onClick={() => handleAssetSelect(asset)}
            >
              <span className="font-semibold text-sm min-w-16">{asset.symbol}</span>
              <span className="text-sm text-muted-foreground truncate flex-1">{asset.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{asset.exchange}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };



  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit Watchlist Entry" : "Add to Watchlist"}</SheetTitle>
          <SheetDescription className="sr-only">
            {isEditMode ? "Edit the settings for this watchlist entry." : "Select an asset and configure its moving average period."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6 flex-1 px-6">
          {/* Asset search or selected state */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="asset-search">Asset</Label>
            
            {selected ? (
              <div className="glass p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center size-10 rounded-md bg-primary/10 shrink-0">
                    <span className="text-xs font-bold text-primary leading-none">{selectedSymbol?.slice(0, 3)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{selectedSymbol}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[200px]">
                      {selectedName} · {selectedExchange}
                    </span>
                  </div>
                </div>
                {!isEditMode && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearAsset}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    Change
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="asset-search"
                    className="pl-9"
                    placeholder="Search by symbol or name..."
                    value={assetQuery}
                    onChange={(e) => handleAssetQueryChange(e.target.value)}
                    onFocus={() => { if (assetQuery) setDropdownOpen(true); }}
                    autoComplete="off"
                    disabled={assetsLoading}
                  />
                </div>

                {/* Results dropdown */}
                {dropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-50 glass border border-border rounded-lg shadow-lg overflow-hidden">
                    {renderDropdownContent()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SMA Period */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sma-period">SMA Period (days)</Label>
            <Input
              id="sma-period"
              type="number"
              min={1}
              max={250}
              value={smaPeriod}
              onChange={(e) => setSmaPeriod(Number(e.target.value))}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-xs text-muted-foreground">
              Number of daily candles for the moving average. Common values: 20, 50, 200.
            </p>
          </div>

          {/* Active toggle — edit mode only */}
          {isEditMode && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="is-active">Active monitoring</Label>
                <p className="text-xs text-muted-foreground">Pause alerts without deleting the entry.</p>
              </div>
              <button
                id="is-active"
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-4 rounded-full bg-background shadow transition-transform",
                    isActive ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <SheetFooter className="flex gap-2 mt-auto pt-2 px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <SpinnerButton
              type="submit"
              disabled={!selected}
              isLoading={submitting}
              loadingText="Hold on, fetching price data..."
            >
              {isEditMode ? "Save Changes" : "Add to Watchlist"}
            </SpinnerButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
