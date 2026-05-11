import { PageTitle } from "@/components/common/PageTitle";
import { serverFetch } from "@/lib/serverFetch";
import { AlertList } from "@/components/dashboard/AlertList";
import type { RecentAlertResponse } from "@avgdown/types";

export default async function AlertsPage() {
  const initialAlerts = await serverFetch<RecentAlertResponse[]>("/watchlists/recent-alerts");
  const count = initialAlerts.length;
  const subtitle = `${count} recent alert${count === 1 ? "" : "s"} · click any row to expand details`;

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Alerts" subtitle={subtitle} />
      </div>
      <div className="flex flex-col gap-3">
        <AlertList initialAlerts={initialAlerts} />
      </div>
    </section>
  );
}
