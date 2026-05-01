"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { GaugeIcon, ListIcon, BellIcon, GearIcon, ChartLineUpIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import AccountProfile from "./AccountProfile";

const navItems = [
  { label: "Overview", icon: GaugeIcon, href: "/" },
  { label: "Watchlists", icon: ListIcon, href: "/watchlists" },
  { label: "Alerts", icon: BellIcon, href: "/alerts" },
  { label: "Browse Assets", icon: MagnifyingGlassIcon, href: "/browse-assets" },
];

const bottomNavItems = [{ label: "Settings", icon: GearIcon, href: "/settings" }];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Logo / Brand — collapses to just the icon */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/20 text-chart-1 shrink-0">
                  <ChartLineUpIcon weight="bold" />
                </div>
                <span className="font-semibold tracking-tight text-xl">
                  Avg<span className="text-chart-1">Down</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Settings + Account */}
      <SidebarFooter>
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <AccountProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
