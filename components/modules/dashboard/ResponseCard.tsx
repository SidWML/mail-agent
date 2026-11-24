import type { Category } from "@/types/mailbox";
import type { DashboardResponse } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import GroupedColumnsChart from "./charts/GroupedColumnsChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface ResponseCardProps {
  response: DashboardResponse["response"];
  categories: Category[];
  filters: DashboardFilters;
  chartHeight: number;
}

const SHOWN_CATEGORIES = 5;

/** "Technical issue" becomes "Technical", "Data & privacy" becomes "Data". */
const shortName = (name: string) => name.split(/[\s/&]+/)[0];

const formatHours = (hours: number) => (hours < 1 ? `${Math.round(hours * 60)} min` : `${Math.round(hours * 10) / 10} h`);

/** How fast we answer, per category: the median and the slowest 10%. */
export default function ResponseCard({ response, categories, filters, chartHeight }: ResponseCardProps) {
  const rows = [...response.byCategory]
    .sort((a, b) => b.p90 - a.p90)
    .slice(0, SHOWN_CATEGORIES)
    .map((item) => ({
      short: shortName(item.name),
      name: item.name,
      median: Math.round(item.median * 10) / 10,
      p90: Math.round(item.p90 * 10) / 10,
      href: getMailsHref(filters, {
        tab: "all",
        withDate: true,
        category: categories.find((category) => category.name === item.name)?.id,
      }),
    }));

  return (
    <ChartCard
      title="Reply speed by category"
      subtitle={`First reply: median ${formatHours(response.firstMedian)} · time to act: median ${formatHours(response.ttaMedian)}`}
      spanClass="col-span-3"
    >
      <GroupedColumnsChart rows={rows} height={chartHeight} />
    </ChartCard>
  );
}
