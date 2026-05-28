import { CtaButton } from "./AuthAwareButtons";

export function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-primary rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-transparent pointer-events-none rounded-3xl" />

          <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to DCA with confidence?
          </h2>
          <p className="relative text-muted-foreground max-w-lg mx-auto mb-8">
            Join AvgDown and stop guessing when to buy the dip. Set up your watchlist in minutes.
          </p>
          <CtaButton />
        </div>
      </div>
    </section>
  );
}
