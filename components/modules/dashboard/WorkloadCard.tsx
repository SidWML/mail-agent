import type { User } from "@/types/mailbox";
import type { AgentWorkload } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import StackedBarsChart from "./charts/StackedBarsChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface WorkloadCardProps {
  workload: AgentWorkload[];
  assignees: User[];
  filters: DashboardFilters;
  chartHeight: number;
}

/** What each person claimed, replied to and acted on. Click a bar to open that person's mails. */
export default function WorkloadCard({ workload, assignees, filters, chartHeight }: WorkloadCardProps) {
  // Nine people do not fit a small chart: show the six who handled the most.
  const total = (person: AgentWorkload) => person.claimed + person.replied + person.acted;
  const rows = [...workload].sort((a, b) => total(b) - total(a)).slice(0, 6).map((person) => ({
    ...person,
    href: getMailsHref(filters, {
      tab: "all",
      withDate: true,
      assignee: assignees.find((user) => user.name === person.name)?.id,
    }),
  }));
  const busiest = rows[0];

  return (
    <ChartCard
      title="Team workload"
      subtitle={busiest ? `${busiest.name} handled the most` : "No activity in this range"}
      spanClass="col-span-3"
    >
      <StackedBarsChart rows={rows} height={chartHeight} />
    </ChartCard>
  );
}
