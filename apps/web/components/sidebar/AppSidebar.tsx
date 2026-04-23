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
import { GaugeIcon, ListIcon, BellIcon, GearIcon, ChartLineUpIcon } from "@phosphor-icons/react";
import Link from "next/link";
import AccountProfile from "./AccountProfile";
const navItems = [
  { label: "Overview", icon: GaugeIcon, href: "/" },
  { label: "Watchlists", icon: ListIcon, href: "/watchlists" },
  { label: "Alerts", icon: BellIcon, href: "/alerts" },
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
                <ChartLineUpIcon weight="bold" className="text-primary" />
                <span className="font-semibold tracking-tight">AvgDown</span>
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
