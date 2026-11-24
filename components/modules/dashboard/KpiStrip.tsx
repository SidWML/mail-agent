import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DashboardResponse } from "@/types/dashboard";
import Sparkline from "./charts/Sparkline";
import { getMailsHref, getPreviousPeriodLabel, type DashboardFilters } from "./dashboard-filters";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  note: ReactNode;
  href?: string;
  /** Red top edge: this tile asks for attention. */
  alert?: boolean;
  sparkline?: ReactNode;
}

function KpiTile({ label, value, note, href, alert, sparkline }: KpiTileProps) {
  const content = (
    <>
      <p className="text-[10.5px] font-bold tracking-[0.08em] text-ink-muted uppercase">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <span className={cn("text-2xl leading-none font-light", alert ? "text-brand-dark" : "text-bar-dark")}>{value}</span>
        {sparkline}
      </div>
      <p className="mt-2 text-xs leading-snug text-ink-3">{note}</p>
    </>
  );
  const className = cn(
    "block min-w-0 border border-card-line bg-card px-4 py-3.5",
    alert && "border-t-[3px] border-t-brand",
    href && "hover:border-line-strong",
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** "↑ 12% vs last month", or nothing when the period before had no mails to compare with. */
function ReceivedChange({ current, previous, range }: { current: number; previous: number; range: string }) {
  if (previous === 0) return null;
  const percent = Math.round(((current - previous) / previous) * 100);
  const isUp = percent >= 0;
  return (
    <span className={isUp ? "font-semibold text-ok-dark" : "font-semibold text-brand-dark"}>
      {isUp ? "↑" : "↓"} {Math.abs(percent)}% vs {getPreviousPeriodLabel(range)}
    </span>
  );
}

function formatHours(hours: number) {
  return hours < 1 ? `${Math.round(hours * 60)} min` : `${Math.round(hours * 10) / 10} h`;
}

interface KpiStripProps {
  dashboard: DashboardResponse;
  filters: DashboardFilters;
}

/** Six small numbers at the top. Click one to see its mails. */
export default function KpiStrip({ dashboard, filters }: KpiStripProps) {
  const { received, open, acted, unassigned } = dashboard.tiles;
  const actedShare = received.range > 0 ? Math.round((acted / received.range) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <KpiTile
        label="Received"
        value={received.range}
        href={getMailsHref(filters, { tab: "all", withDate: true })}
        note={
          <>
            <ReceivedChange current={received.range} previous={received.prev} range={filters.range} />
            <span className="block">
              today {received.today} · week {received.week} · month {received.month}
            </span>
          </>
        }
        sparkline={
          <Sparkline values={dashboard.volume.map((day) => day.received)} width={64} height={24} padding={{ top: 3, bottom: 3 }} strokeClass="stroke-brand" />
        }
      />
      <KpiTile
        label="Open"
        value={open.total}
        href={getMailsHref(filters, { tab: "active" })}
        note={`${open.new} new · ${open.inProgress} in progress · ${open.waiting} waiting`}
      />
      <KpiTile
        label="Acted"
        value={acted}
        href={getMailsHref(filters, { tab: "acted", withDate: true })}
        note={`${actedShare}% of received`}
        sparkline={
          <Sparkline values={dashboard.volume.map((day) => day.acted)} width={64} height={24} padding={{ top: 3, bottom: 3 }} strokeClass="stroke-ok" />
        }
      />
      <KpiTile label="Unassigned" value={unassigned} alert href={getMailsHref(filters, { tab: "unassigned" })} note="Nobody owns these yet" />
      <KpiTile
        label="Within SLA"
        value={`${dashboard.sla.compliancePct}%`}
        note={`${dashboard.sla.breachCount} past SLA right now`}
        href={getMailsHref(filters, { tab: "active", sort: "sla" })}
      />
      <KpiTile
        label="First reply"
        value={formatHours(dashboard.response.firstMedian)}
        note={`median · slowest 10%: ${formatHours(dashboard.response.firstP90)}`}
      />
    </div>
  );
}
