import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const AccountProfile = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          {/* Avatar placeholder */}
          <div className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-sidebar-primary">VI</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <span className="text-sm font-medium truncate">Vikram</span>
            <span className="text-xs text-muted-foreground truncate">vikram@example.com</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AccountProfile;