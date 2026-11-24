import type { Category } from "@/types/mailbox";
import type { NamedCount } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import HorizontalBarsChart from "./charts/HorizontalBarsChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface CategoryCardProps {
  byCategory: NamedCount[];
  categories: Category[];
  filters: DashboardFilters;
  chartHeight: number;
}

const SHOWN_CATEGORIES = 6;

/** Which categories the mails fall into. Click a bar to open that category. */
export default function CategoryCard({ byCategory, categories, filters, chartHeight }: CategoryCardProps) {
  const sorted = [...byCategory].sort((a, b) => b.value - a.value);
  const total = byCategory.reduce((sum, item) => sum + item.value, 0);
  const rows = sorted.slice(0, SHOWN_CATEGORIES).map((item) => ({
    name: item.name,
    value: item.value,
    href: getMailsHref(filters, {
      tab: "all",
      withDate: true,
      category: categories.find((category) => category.name === item.name)?.id,
    }),
  }));
  const top = sorted[0];

  return (
    <ChartCard
      title="Mails by category"
      subtitle={top ? `${top.name} leads with ${top.value} of ${total}` : "No mails in this range"}
      spanClass="col-span-3"
    >
      <HorizontalBarsChart rows={rows} height={chartHeight} valueName="Mails" />
    </ChartCard>
  );
}
