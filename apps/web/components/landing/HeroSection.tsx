import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr";
import { HeroCtas } from "./AuthAwareButtons";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-16">
      {/* Background glow blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 size-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8">
        <ChartLineUpIcon weight="fill" className="size-4 text-primary" />
        Smart DCA Alerting - Free while in beta
      </div>

      {/* Headline */}
      <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
        Know exactly when to{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-400">average down</span>
      </h1>

      <p className="relative mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        AvgDown tracks your watchlist and alerts you the moment an asset drops below its moving average - the signal
        that dollar-cost averaging investors wait for.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <HeroCtas />
      </div>

      {/* Subtle scroll hint */}
      <p className="relative mt-16 text-xs text-muted-foreground/50 tracking-widest uppercase">Scroll to learn more</p>
    </section>
  );
}
