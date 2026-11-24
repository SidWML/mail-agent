import Link from "next/link";
import type { TopicCount } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface TopicsCardProps {
  topics: TopicCount[];
  filters: DashboardFilters;
}

const SHOWN_TOPICS = 5;

/** "↑ 12%", "↓ 8%" or "new" next to a topic. */
function TopicChange({ change }: { change: number | null }) {
  if (change === null) return <span className="font-semibold text-brand">new</span>;
  if (change === 0) return <span className="text-ink-muted">→ flat</span>;
  return (
    <span className={change > 0 ? "font-semibold text-brand-dark" : "font-semibold text-ok-dark"}>
      {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
    </span>
  );
}

/** Subjects that keep coming back. */
export default function TopicsCard({ topics, filters }: TopicsCardProps) {
  const top = [...topics].sort((a, b) => b.value - a.value).slice(0, SHOWN_TOPICS);

  return (
    <ChartCard title="Recurring topics" subtitle="What people keep asking about" spanClass="col-span-2">
      <ul>
        {top.map((topic) => (
          <li key={topic.name} title={`${topic.name}: ${topic.value} mails`} className="flex items-center gap-2 border-b border-chart-tile-line py-2 text-xs last:border-b-0">
            {topic.examples[0] ? (
              <Link
                href={getMailsHref(filters, { tab: "all", mailId: topic.examples[0].id })}
                className="truncate hover:underline"
                title={`Open an example: ${topic.examples.map((example) => example.subject).join(" / ")}`}
              >
                {topic.name}
              </Link>
            ) : (
              <span className="truncate">{topic.name}</span>
            )}
            <span className="ml-auto font-semibold">{topic.value}</span>
            <span className="w-16 text-right text-[11px] whitespace-nowrap">
              <TopicChange change={topic.change} />
            </span>
          </li>
        ))}
        {top.length === 0 && <li className="text-xs text-ink-muted">No topics yet</li>}
      </ul>
    </ChartCard>
  );
}
