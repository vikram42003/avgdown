"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useWatchlists } from "@/hooks/useWatchlists";
import { WatchlistFormSheet } from "@/components/dashboard/WatchlistFormSheet";
import { WatchlistRow, WatchlistRowSkeleton } from "@/components/dashboard/WatchlistRow";
import type { WatchlistEntryResponse } from "@avgdown/types";

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
          new Array(5).fill(0).map((_, i) => <WatchlistRowSkeleton key={i} />) // NOSONAR
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
