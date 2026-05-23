import type { Metadata } from "next";
import { PageTitle } from "@/components/common/PageTitle";
import { ProfileDetails } from "@/components/settings/ProfileDetails";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
import { DangerZone } from "@/components/settings/DangerZone";

export const metadata: Metadata = {
  title: "Account Settings | AvgDown",
  description: "Manage your AvgDown profile, email preferences, custom webhook notifications, and account credentials.",
};

export default function SettingsPage() {
  return (
    <section className="flex flex-1 flex-col max-w-4xl w-full mx-auto">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Account Settings" />
      </div>

      <div className="flex flex-col gap-8">
        <ProfileDetails />
        <WebhookSettings />
        <DangerZone />
      </div>
    </section>
  );
}
