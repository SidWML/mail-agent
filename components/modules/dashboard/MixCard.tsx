import type { NamedCount, SentimentDay } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { SENTIMENT_COLORS, URGENCY_COLORS } from "./charts/chart-colors";
import MixBarChart from "./charts/MixBarChart";
import SentimentTrendChart from "./charts/SentimentTrendChart";
import { getMailsHref, toDayLabel, toIsoDay, type DashboardFilters } from "./dashboard-filters";

interface MixCardProps {
  urgency: NamedCount[];
  sentiment: NamedCount[];
  filters: DashboardFilters;
  sentimentTrend: SentimentDay[];
  /** Today as "2026-11-24". */
  todayIso: string;
}

function MixRow({ label, segments }: { label: string; segments: Array<NamedCount & { color: string; href: string }> }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">{label}</p>
      <MixBarChart segments={segments} height={26} />
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
        {segments.map((segment) => (
          <li key={segment.name} className="flex items-center gap-1.5 text-[11.5px]">
            <span className="size-2" style={{ background: segment.color }} />
            {segment.name}
            <span className="font-semibold">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** How urgent and how happy the mails are. */
export default function MixCard({ urgency, sentiment, filters, sentimentTrend, todayIso }: MixCardProps) {
  const trendPoints = sentimentTrend.map((entry) => ({
    label: toDayLabel(entry.day),
    positive: entry.positive,
    neutral: entry.neutral,
    negative: entry.negative,
    href: getMailsHref(filters, { tab: "all", day: toIsoDay(entry.day, todayIso) }),
  }));
  const urgencySegments = urgency.map((item) => ({
    ...item,
    color: URGENCY_COLORS[item.name] ?? "#c9c9c9",
    href: getMailsHref(filters, { tab: "all", withDate: true, urgency: item.name }),
  }));
  const sentimentSegments = sentiment.map((item) => ({
    ...item,
    color: SENTIMENT_COLORS[item.name] ?? "#c9c9c9",
    href: getMailsHref(filters, { tab: "all", withDate: true, sentiment: item.name }),
  }));

  return (
    <ChartCard title="Urgency and tone" subtitle="Share of mails" spanClass="col-span-2">
      <div className="flex flex-col gap-5">
        <MixRow label="Urgency" segments={urgencySegments} />
        <MixRow label="Sentiment" segments={sentimentSegments} />
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">Tone per day</p>
          <SentimentTrendChart points={trendPoints} height={96} />
        </div>
      </div>
    </ChartCard>
  );
}
