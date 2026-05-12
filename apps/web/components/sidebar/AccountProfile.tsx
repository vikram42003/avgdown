"use client";

import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";
import { setPendingToast } from "@/components/common/PendingToast";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { API_URL } from "@/lib/api";

const AccountProfile = () => {
  const { user, isLoading, mutate } = useUser();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Revalidate the /users/me cache so all consumers update instantly
      await mutate(undefined, { revalidate: false });
      setPendingToast("success", "Signed out successfully");
      router.push("/login");
    }
  }

  // Derive initials from email (e.g. "vikram@example.com" → "VI")
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="group/account" asChild>
          <div>
            {isLoading ? (
              <Skeleton className="size-8 rounded-full shrink-0" />
            ) : (
              <div className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-sidebar-primary">{initials}</span>
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1 text-left">
              {isLoading ? (
                <>
                  <Skeleton className="h-3.5 w-20 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium truncate">{user?.email?.split("@")[0]}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                </>
              )}
            </div>

            {/* Logout — only visible on hover to keep it clean */}
            <button
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleLogout();
              }}
              title="Sign out"
              className="ml-auto hidden group-hover/account:flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <SignOutIcon size={16} />
            </button>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AccountProfile;
