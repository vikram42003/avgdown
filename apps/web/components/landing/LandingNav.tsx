import Link from "next/link";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
            <ChartLineUpIcon weight="bold" size={18} className="text-primary" />
          </div>
          AvgDown
        </div>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="rounded-full px-5">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
