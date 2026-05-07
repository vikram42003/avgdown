"use client";

import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "../ui/sidebar";
import { fetcher } from "@/lib/api";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SWRConfig value={{ fetcher }}>
      <TooltipProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </TooltipProvider>
    </SWRConfig>
  );
}
