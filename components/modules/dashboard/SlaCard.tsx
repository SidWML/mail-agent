import Link from "next/link";
import type { DashboardResponse } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import GaugeChart from "./charts/GaugeChart";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface SlaCardProps {
  sla: DashboardResponse["sla"];
  filters: DashboardFilters;
  chartHeight: number;
}

/** The goal for mails answered within their category's SLA hours (from the design). */
const SLA_TARGET_PERCENT = 90;
const SHOWN_BREACHES = 3;

/** Share of mails answered in time, with the latest ones listed. Click one to open the mail. */
export default function SlaCard({ sla, filters, chartHeight }: SlaCardProps) {
  const isOnTarget = sla.compliancePct >= SLA_TARGET_PERCENT;

  return (
    <ChartCard
      title="Reply deadline (SLA)"
      subtitle={`${sla.breachCount} ${sla.breachCount === 1 ? "mail is" : "mails are"} past their reply time`}
      spanClass="col-span-3"
      dark
      seeMailsHref={getMailsHref(filters, { tab: "active", late: true, sort: "sla" })}
    >
      <div className="flex items-center gap-3">
        <div className="w-[150px] shrink-0">
          <GaugeChart
            percent={sla.compliancePct}
            height={chartHeight - 14}
            target={SLA_TARGET_PERCENT}
            fill={isOnTarget ? "#3ac36e" : "#e3000f"}
            track="#3a3c42"
          />
        </div>
        <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.06em] text-on-dark-muted uppercase">Waiting longest</p>
        <ul>
          {[...sla.breaches].sort((a, b) => b.overByH - a.overByH).slice(0, SHOWN_BREACHES).map((breach) => (
            <li key={breach.id} className="border-b border-[#3a3c42] py-1.5 last:border-b-0">
              <Link href={getMailsHref(filters, { tab: "active", mailId: breach.id })} className="flex items-center gap-2 text-xs hover:underline">
                <span className="truncate">{breach.subject}</span>
                <span className="ml-auto shrink-0 font-semibold text-on-dark-hot">{breach.overByH < 1 ? "< 1 h late" : `${Math.round(breach.overByH)} h late`}</span>
              </Link>
            </li>
          ))}
          {sla.breaches.length === 0 && <li className="text-xs text-on-dark-muted">Nothing is late right now.</li>}
        </ul>
        </div>
      </div>
    </ChartCard>
  );
}
