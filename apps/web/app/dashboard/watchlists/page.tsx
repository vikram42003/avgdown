"use client";

import { useState } from "react";
import { PlusIcon, PencilSimpleIcon, TrashIcon, CalendarIcon, CircleIcon } from "@phosphor-icons/react";
import { useSWRConfig } from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWatchlists } from "@/hooks/useWatchlists";
import { WatchlistFormSheet } from "@/components/dashboard/WatchlistFormSheet";
import { apiMutate } from "@/lib/api";
import type { WatchlistEntryResponse } from "@avgdown/types";

function WatchlistRow({ entry, onEditRequest }: Readonly<{ entry: WatchlistEntryResponse; onEditRequest: (e: WatchlistEntryResponse) => void }>) {
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
    } catch {
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-4">
      {/* Asset info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
          <span className="text-xs font-bold text-primary leading-none">{entry.asset.symbol.slice(0, 3)}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base leading-tight">{entry.asset.symbol}</span>
          <span className="text-sm text-muted-foreground truncate">{entry.asset.name}</span>
        </div>
      </div>

      {/* Stats row */}
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

const RowSkeleton = () => (
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

export default function WatchlistsPage() {
  const { watchlists, isLoading } = useWatchlists();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WatchlistEntryResponse | undefined>(undefined);

  function handleAddNew() {
    setEditingEntry(undefined);
    setSheetOpen(true);
  }

  function handleEditRequest(entry: WatchlistEntryResponse) {
    setEditingEntry(entry);
    setSheetOpen(true);
  }

  const activeCount = watchlists.filter((w) => w.isActive).length;

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <div>
          <h2 className="font-bold text-4xl">Watchlists</h2>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {watchlists.length} entr{watchlists.length === 1 ? "y" : "ies"} · {activeCount} active
            </p>
          )}
        </div>
        <Button size="lg" onClick={handleAddNew} className="gap-2">
          <PlusIcon className="size-4" />
          Add Watchlist
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          new Array(5).fill(0).map((_, i) => <RowSkeleton key={i} />) // NOSONAR
        ) : watchlists.length === 0 ? (
          <div className="glass rounded-xl px-6 py-16 text-center">
            <p className="text-muted-foreground text-sm mb-4">You haven&apos;t added any watchlist entries yet.</p>
            <Button onClick={handleAddNew} className="gap-2">
              <PlusIcon className="size-4" />
              Add your first watchlist
            </Button>
          </div>
        ) : (
          watchlists.map((entry) => (
            <WatchlistRow key={entry.id} entry={entry} onEditRequest={handleEditRequest} />
          ))
        )}
      </div>

      <WatchlistFormSheet open={sheetOpen} onOpenChange={setSheetOpen} entry={editingEntry} />
    </section>
  );
}
