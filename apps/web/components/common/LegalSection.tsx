import { ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: Readonly<LegalSectionProps>) {
  return (
    <section className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}
