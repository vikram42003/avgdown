import { PageTitle } from "@/components/common/PageTitle";
import { serverFetch } from "@/lib/serverFetch";
import { WatchlistList } from "@/components/dashboard/WatchlistList";
import type { WatchlistEntryResponse } from "@avgdown/types";

// Note: Button is a server-rendered trigger here - clicking it won't work without client JS.
// The WatchlistList island owns the sheet state, we wire the header button through a client island instead.
// For now the Add button lives inside WatchlistList (which is already a client island).

export default async function WatchlistsPage() {
  const initialWatchlists = await serverFetch<WatchlistEntryResponse[]>("/watchlists");
  const activeCount = initialWatchlists.filter((w) => w.isActive).length;
  const total = initialWatchlists.length;
  const subtitle = `${total} entr${total === 1 ? "y" : "ies"} · ${activeCount} active`;

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Watchlists" subtitle={subtitle} />
        {/* Add button rendered inside WatchlistList (client island) to keep sheet state co-located */}
      </div>
      <WatchlistList initialWatchlists={initialWatchlists} />
    </section>
  );
}
