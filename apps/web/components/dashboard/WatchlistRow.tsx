"use client";

import { useState } from "react";
import { PencilSimpleIcon, TrashIcon, CalendarIcon, CircleIcon } from "@phosphor-icons/react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiMutate } from "@/lib/api";
import type { WatchlistEntryResponse } from "@avgdown/types";

interface WatchlistRowProps {
  entry: WatchlistEntryResponse;
  onEditRequest: (entry: WatchlistEntryResponse) => void;
}

export function WatchlistRow({ entry, onEditRequest }: Readonly<WatchlistRowProps>) {
  const { mutate } = useSWRConfig();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createdAt = new Date(entry.createdAt).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiMutate(`/watchlists/${entry.id}`, "DELETE");
      await mutate("/watchlists");
      toast.success(`Removed ${entry.asset.symbol} from watchlist`);
    } catch {
      toast.error("Failed to remove watchlist entry");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-4">
      {/* Asset icon + name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
          <span className="text-xs font-bold text-primary leading-none">{entry.asset.symbol.slice(0, 3)}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base leading-tight">{entry.asset.symbol}</span>
          <span className="text-sm text-muted-foreground truncate">{entry.asset.name}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs uppercase tracking-wide font-medium">Exchange</span>
          <span className="text-foreground font-medium">{entry.asset.exchange}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs uppercase tracking-wide font-medium">SMA Period</span>
          <span className="text-foreground font-medium">{entry.smaPeriod}d</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs uppercase tracking-wide font-medium">Status</span>
          <span className={cn("flex items-center gap-1 font-medium", entry.isActive ? "text-green-500" : "text-muted-foreground")}>
            <CircleIcon weight="fill" className="size-2" />
            {entry.isActive ? "Active" : "Paused"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="size-3.5" />
          {createdAt}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
          onClick={() => onEditRequest(entry)}
        >
          <PencilSimpleIcon className="size-4" />
        </Button>

        <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label="Delete"
            >
              <TrashIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 glass p-3" align="end">
            <p className="text-sm font-medium mb-1">Remove {entry.asset.symbol}?</p>
            <p className="text-xs text-muted-foreground mb-3">This will permanently delete this watchlist entry.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Removing…" : "Remove"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export const WatchlistRowSkeleton = () => (
  <div className="glass rounded-xl px-5 py-4 flex items-center gap-4">
    <Skeleton className="size-10 rounded-lg shrink-0" />
    <div className="flex flex-col gap-1.5 flex-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-40" />
    </div>
    <Skeleton className="h-4 w-32 hidden md:block" />
    <Skeleton className="size-8 rounded-md" />
  </div>
);
