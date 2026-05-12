import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-primary rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none rounded-3xl" />

          <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to DCA with confidence?
          </h2>
          <p className="relative text-muted-foreground max-w-lg mx-auto mb-8">
            Join AvgDown and stop guessing when to buy the dip. Set up your watchlist in minutes.
          </p>
          <Button size="lg" asChild className="relative rounded-full px-10 text-base gap-2">
            <Link href="/signup">
              Create a free account
              <ArrowRightIcon weight="bold" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
