import {
  BellRingingIcon,
  ChartLineUpIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  {
    icon: BellRingingIcon,
    title: "Real-time Price Alerts",
    description:
      "Get notified the moment an asset you track drops below its Simple Moving Average — the classic DCA entry signal.",
  },
  {
    icon: ChartLineUpIcon,
    title: "Visual Price History",
    description:
      "View price charts with your SMA overlay for every watchlist entry. See the trend, understand the context.",
  },
  {
    icon: ClockIcon,
    title: "Daily SMA Snapshots",
    description:
      "Powered by end-of-day OHLCV data. No intraday noise. Calculated fresh every day for clean, actionable signals.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Your Watchlist, Your Rules",
    description:
      "Customise the SMA window for each asset. Pause monitoring without losing your configuration. Full control.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BellRingingIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-primary rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
        <Icon weight="duotone" className="size-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-base mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything you need to DCA smarter
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No noise. No clutter. Just the signals that matter for long-term investors.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
