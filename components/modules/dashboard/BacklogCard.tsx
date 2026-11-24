import type { NamedCount } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { AGE_COLORS } from "./charts/chart-colors";
import ColumnsChart from "./charts/ColumnsChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface BacklogCardProps {
  backlog: NamedCount[];
  filters: DashboardFilters;
  chartHeight: number;
}

/** How old the open mails are. Click a column to open the oldest first. */
export default function BacklogCard({ backlog, filters, chartHeight }: BacklogCardProps) {
  const href = getMailsHref(filters, { tab: "active", sort: "oldest" });
  const rows = backlog.map((item, index) => ({ ...item, color: AGE_COLORS[index] ?? AGE_COLORS[0], href }));
  const old = backlog[backlog.length - 1]?.value ?? 0;

  return (
    <ChartCard
      title="Backlog by age"
      subtitle={old > 0 ? `${old} open mails are older than a week` : "Nothing older than a week"}
      spanClass="col-span-3"
    >
      <ColumnsChart rows={rows} height={chartHeight} valueName="Open mails" />
    </ChartCard>
  );
}
