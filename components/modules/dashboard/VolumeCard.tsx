import type { VolumeDay } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import VolumeAreaChart from "./charts/VolumeAreaChart";
import { getMailsHref, toDayLabel, toIsoDay, type DashboardFilters } from "./dashboard-filters";

interface VolumeCardProps {
  volume: VolumeDay[];
  filters: DashboardFilters;
  /** Today as "2026-11-24", used to find the year of each "MM-DD" day. */
  todayIso: string;
  chartHeight: number;
}

/** Mails received and acted each day. */
export default function VolumeCard({ volume, filters, todayIso, chartHeight }: VolumeCardProps) {
  const points = volume.map((entry) => {
    const iso = toIsoDay(entry.day, todayIso);
    return {
      label: toDayLabel(entry.day),
      received: entry.received,
      acted: entry.acted,
      href: getMailsHref(filters, { tab: "all", day: iso }),
    };
  });
  const lastDay = points[points.length - 1];

  return (
    <ChartCard
      title="Mail volume"
      subtitle={`Received vs acted per day${lastDay ? ` · latest: ${lastDay.received} in, ${lastDay.acted} acted` : ""}`}
      spanClass="col-span-4"
      seeMailsHref={getMailsHref(filters, { tab: "all", withDate: true })}
    >
      <ul className="mb-1 flex gap-4 text-xs text-ink-3">
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 bg-brand" />
          Received
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-bar-dark" />
          Acted (finished)
        </li>
      </ul>
      <VolumeAreaChart points={points} height={chartHeight - 20} />
    </ChartCard>
  );
}
