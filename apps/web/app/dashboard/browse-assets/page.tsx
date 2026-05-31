import { PageTitle } from "@/components/common/PageTitle";
import { serverFetch } from "@/lib/serverFetch";
import { AssetGrid } from "@/components/dashboard/AssetGrid";
import type { AssetResponse } from "@avgdown/types";

export default async function BrowseAssetsPage() {
  const popularAssets = await serverFetch<AssetResponse[]>("/assets/popular");

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Browse Assets" />
      </div>
      <AssetGrid initialAssets={popularAssets} />
    </section>
  );
}

