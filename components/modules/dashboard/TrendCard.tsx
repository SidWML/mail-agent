import type { Category } from "@/types/mailbox";
import type { CategoryTrend } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { getTrendChange } from "./category-trend";
import { TREND_COLORS } from "./charts/chart-colors";
import TrendLinesChart from "./charts/TrendLinesChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface TrendCardProps {
  trends: CategoryTrend[];
  categories: Category[];
  filters: DashboardFilters;
  chartHeight: number;
}

const SHOWN_CATEGORIES = 5;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Weekly mails for the busiest categories, and which one is rising fastest. */
export default function TrendCard({ trends, categories, filters, chartHeight }: TrendCardProps) {
  const busiest = [...trends].sort((a, b) => sum(b.weeks) - sum(a.weeks)).slice(0, SHOWN_CATEGORIES);
  const weekCount = busiest[0]?.weeks.length ?? 0;
  const weeks = Array.from({ length: weekCount }, (_, index) => ({
    week: index === weekCount - 1 ? "This week" : `${weekCount - 1 - index}w ago`,
    ...Object.fromEntries(busiest.map((trend) => [trend.name, trend.weeks[index] ?? 0])),
  }));
  const series = busiest.map((trend, index) => ({
    name: trend.name,
    color: TREND_COLORS[index % TREND_COLORS.length],
    href: getMailsHref(filters, { tab: "all", withDate: true, category: categories.find((category) => category.name === trend.name)?.id }),
  }));
  const riser = [...trends].sort((a, b) => getTrendChange(b.weeks).percent - getTrendChange(a.weeks).percent)[0];
  const riserChange = riser ? getTrendChange(riser.weeks) : undefined;

  return (
    <ChartCard
      title="Category trend"
      subtitle={riser && riserChange && riserChange.percent > 0 ? `Mails per week · ${riser.name} is rising fastest (${riserChange.label})` : "Mails per week · no category is rising"}
      spanClass="col-span-4"
    >
      <TrendLinesChart weeks={weeks} series={series} height={chartHeight - 18} />
    </ChartCard>
  );
}
