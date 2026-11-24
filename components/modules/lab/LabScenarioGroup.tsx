import type { ReactNode } from "react";

interface LabScenarioGroupProps {
  title: string;
  children: ReactNode;
}

export default function LabScenarioGroup({ title, children }: LabScenarioGroupProps) {
  return (
    <section className="shrink-0 border border-line-soft bg-card">
      <h2 className="border-b border-line-soft bg-stripe px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
        {title}
      </h2>
      <div className="divide-y divide-line-soft">{children}</div>
    </section>
  );
}
