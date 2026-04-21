import NavItem from "../common/NavItem";
import AccountProfile from "./AccountProfile";

const Sidebar = () => {
  return (
    <aside className="relative shrink min-w-64 border-r border-border bg-surface">
      <h1 className="font-bold text-2xl text-center py-8 tracking-tight">AvgDown</h1>

      <ul className="w-full px-4 mx-auto space-y-2 mt-8 *:py-2 *:px-4 font-medium *:hover:bg-surface-hover *:rounded-md">
        <NavItem label="Overview" />
        <NavItem label="Watchlists" />
        <NavItem label="Alerts" />
      </ul>

      <div className="absolute bottom-4 w-full px-4">
        <AccountProfile />
        <div className="text-center mt-2 text-muted text-sm">© 2026 AvgDown. All rights reserved.</div>
      </div>
    </aside>
  );
};

export default Sidebar;
