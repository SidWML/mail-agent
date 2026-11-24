import type { DashboardResponse } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { STATUS_COLORS } from "./charts/chart-colors";
import StatusDonutChart from "./charts/StatusDonutChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface StatusCardProps {
  open: DashboardResponse["tiles"]["open"];
  filters: DashboardFilters;
  chartHeight: number;
}

/** Where the open mails stand right now. */
export default function StatusCard({ open, filters, chartHeight }: StatusCardProps) {
  const slices = [
    { name: "New", value: open.new },
    { name: "In progress", value: open.inProgress },
    { name: "Waiting on sender", value: open.waiting },
  ].map((slice) => ({
    ...slice,
    color: STATUS_COLORS[slice.name],
    href: getMailsHref(filters, { tab: "active", status: slice.name }),
  }));

  return (
    <ChartCard title="Open mails" subtitle={`By status · ${open.total} right now`} spanClass="col-span-3" seeMailsHref={getMailsHref(filters, { tab: "active" })}>
      <StatusDonutChart slices={slices} height={chartHeight - 44} centerValue={open.total} centerLabel="open" />
    </ChartCard>
  );
}
