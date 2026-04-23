"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "../ui/sidebar";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </TooltipProvider>
  );
}
