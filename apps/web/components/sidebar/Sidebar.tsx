import NavItem from "../common/NavItem";
import AccountProfile from "./AccountProfile";

const Sidebar = () => {
  return (
    <aside className="relative shrink min-w-64 border-r border-border bg-sidebar text-sidebar-foreground">
      <h1 className="font-bold text-2xl text-center py-8 tracking-tight">Avg<span className="text-chart-1">Down</span></h1>

      <ul className="w-full px-4 mx-auto space-y-2 mt-8 *:py-2 *:px-4 font-medium *:hover:bg-sidebar-accent *:rounded-md">
        <NavItem label="Overview" icon={null} active={false} />
        <NavItem label="Watchlists" icon={null} active={false} />
        <NavItem label="Alerts" icon={null} active={false} />
      </ul>

      <div className="absolute bottom-4 w-full px-4">
        <AccountProfile />
        <div className="text-center mt-2 text-muted-foreground text-sm">© 2026 AvgDown. All rights reserved.</div>
      </div>
    </aside>
  );
};

export default Sidebar;
