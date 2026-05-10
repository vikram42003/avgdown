import type { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClientAuthGuard } from "@/components/common/ClientAuthGuard";

export const metadata: Metadata = {
  title: "AvgDown | Dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col px-6 py-4 lg:px-10 lg:py-6">
        <SidebarTrigger className="scale-125 mb-4 -ml-1"/>
        <ClientAuthGuard>
          {children}
        </ClientAuthGuard>
      </main>
    </>
  );
}
