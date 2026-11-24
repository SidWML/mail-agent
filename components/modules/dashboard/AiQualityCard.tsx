import type { DashboardResponse } from "@/types/dashboard";
import ChartCard from "./ChartCard";

interface AiQualityCardProps {
  ai: DashboardResponse["ai"];
}

/** The goal for mails the AI sorts correctly on its own (from the design). */
const AI_TARGET_PERCENT = 85;

function Meter({ label, percent, goodWhenHigh, hint }: { label: string; percent: number; goodWhenHigh: boolean; hint: string }) {
  const isGood = goodWhenHigh ? percent >= AI_TARGET_PERCENT : percent <= 15;
  return (
    <div title={hint}>
      <div className="flex items-center text-xs">
        {label}
        <span className="ml-auto font-semibold">{percent}%</span>
      </div>
      <div className="mt-0.5 h-1.5 bg-chart-track">
        <div className={isGood ? "h-1.5 bg-ok" : "h-1.5 bg-brand"} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  );
}

/** How well the AI sorts: sorted on its own, corrected by people, and unsure. */
export default function AiQualityCard({ ai }: AiQualityCardProps) {
  const weakest = [...ai.accuracyByCategory].sort((a, b) => a.value - b.value)[0];

  return (
    <ChartCard
      title="AI quality"
      subtitle={weakest ? `Weakest: ${weakest.name} (${weakest.value}%)` : "How well the AI sorts"}
      spanClass="col-span-2"
    >
      <div className="flex flex-col gap-4">
        <Meter label="Sorted by the AI" percent={ai.autoSortedPct} goodWhenHigh hint={`Goal ${AI_TARGET_PERCENT}% or more`} />
        <Meter label="Corrected by people" percent={ai.overriddenPct} goodWhenHigh={false} hint="Fewer is better" />
        <Meter label="Needs review" percent={ai.needsReviewPct} goodWhenHigh={false} hint="Mails the AI was unsure about" />
      </div>
    </ChartCard>
  );
}
