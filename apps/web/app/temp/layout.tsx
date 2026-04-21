import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LayoutDashboard, List, Settings, Bell, ChevronDown } from "lucide-react";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AvgDown | Dashboard",
  description: "DCA Investment Alerter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="flex h-full bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between hidden md:flex">
          <div>
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-glow">
                <span className="font-bold text-white tracking-tighter">AD</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">AvgDown</span>
            </div>
            <nav className="px-4 py-2 space-y-1">
              <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
              <NavItem icon={<List size={18} />} label="Watchlist" />
              <NavItem icon={<Bell size={18} />} label="Alerts" />
            </nav>
          </div>
          <div className="p-4 border-t border-border">
            <NavItem icon={<Settings size={18} />} label="Settings" />
            <div className="mt-4 flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-sm font-medium text-muted">
                VI
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Vikram</p>
                <p className="text-xs text-muted truncate">Pro Plan</p>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Header (optional, skipping for simple skeleton) */}
          <div className="flex-1 p-6 lg:p-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-brand-muted text-brand relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-brand before:rounded-r-full" 
          : "text-muted hover:text-foreground hover:bg-surface-hover"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}
