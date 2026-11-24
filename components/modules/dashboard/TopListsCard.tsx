import Link from "next/link";
import type { NamedCount } from "@/types/dashboard";
import ChartCard from "./ChartCard";
import { getMailsHref, type DashboardFilters } from "./dashboard-filters";

interface TopListsCardProps {
  senders: NamedCount[];
  businessUnits: NamedCount[];
  countries: NamedCount[];
  filters: DashboardFilters;
}

const SHOWN_ROWS = 4;

function TopList({ title, items, getHref }: { title: string; items: NamedCount[]; getHref?: (name: string) => string }) {
  const top = items.slice(0, SHOWN_ROWS);
  const max = Math.max(1, ...top.map((item) => item.value));

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {top.map((item) => {
          const row = (
            <>
              <span className="flex items-center gap-2 text-xs">
                <span className="truncate">{item.name}</span>
                <span className="ml-auto font-semibold">{item.value}</span>
              </span>
              <span className="mt-0.5 block h-1 bg-chart-track">
                <span className="block h-1 bg-brand" style={{ width: `${(item.value / max) * 100}%` }} />
              </span>
            </>
          );
          return (
            <li key={item.name} title={`${item.name}: ${item.value} mails`}>
              {getHref ? (
                <Link href={getHref(item.name)} className="block hover:opacity-80">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
        {top.length === 0 && <li className="text-xs text-ink-muted">No data</li>}
      </ul>
    </div>
  );
}

/** Who writes most, from which business unit and country. Click a sender to search for them. */
export default function TopListsCard({ senders, businessUnits, countries, filters }: TopListsCardProps) {
  return (
    <ChartCard title="Who writes to us" subtitle="Top senders, business units and countries" spanClass="col-span-4">
      <div className="grid grid-cols-3 gap-6">
        <TopList title="Senders" items={senders} getHref={(name) => getMailsHref(filters, { tab: "all", withDate: true, search: name })} />
        <TopList title="Business units" items={businessUnits} />
        <TopList title="Countries" items={countries} />
      </div>
    </ChartCard>
  );
}
