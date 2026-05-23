import Link from "next/link";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ChartLineUpIcon weight="bold" className="size-4 text-primary" />
          AvgDown
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AvgDown. Built for long-term investors.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
