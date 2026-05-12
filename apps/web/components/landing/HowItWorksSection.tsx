const STEPS = [
  {
    step: "01",
    title: "Add assets to your watchlist",
    description:
      "Search from our catalogue of stocks, ETFs, and crypto. Pick any asset and set your preferred SMA window — 20, 50, or 200 days.",
  },
  {
    step: "02",
    title: "We monitor prices daily",
    description:
      "Every day we snapshot closing prices and compute your SMA. You don't need to do anything — the system handles it automatically.",
  },
  {
    step: "03",
    title: "Get alerted when it matters",
    description:
      "When a price crosses below its SMA, we log an alert immediately. Check your alerts dashboard anytime to review and act.",
  },
];

function Step({
  step,
  title,
  description,
  isLast,
}: {
  step: string;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-6">
      {/* Step number + connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className="flex size-12 items-center justify-center rounded-full glass-primary text-primary font-bold text-sm">
          {step}
        </div>
        {!isLast && <div className="w-px flex-1 mt-3 bg-border" />}
      </div>

      {/* Content */}
      <div className={`${isLast ? "" : "pb-12"}`}>
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — heading */}
        <div>
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Set it once.
            <br />
            Never miss a signal.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            AvgDown is designed to be completely hands-off after setup. Add your assets, set your
            SMA preference, and let the system do the heavy lifting.
          </p>
        </div>

        {/* Right — steps */}
        <div>
          {STEPS.map((s, i) => (
            <Step key={s.step} {...s} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
