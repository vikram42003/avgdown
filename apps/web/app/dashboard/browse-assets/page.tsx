import { PageTitle } from "@/components/common/PageTitle";
import { serverFetch } from "@/lib/serverFetch";
import { AssetGrid } from "@/components/dashboard/AssetGrid";
import type { AssetResponse } from "@avgdown/types";

export default async function BrowseAssetsPage() {
  const initialAssets = await serverFetch<AssetResponse[]>("/assets");
  const exchangeCount = new Set(initialAssets.map((a) => a.exchange)).size;
  const subtitle = `${initialAssets.length} assets across ${exchangeCount} exchange${exchangeCount === 1 ? "" : "s"}`;

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Browse Assets" subtitle={subtitle} />
      </div>
      <AssetGrid initialAssets={initialAssets} />
    </section>
  );
}
