import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import type { Alert } from "@/types/mailbox";
import AlertFrame from "./AlertFrame";
import DigestNumber from "./DigestNumber";

/** Read "Open 47 · Unassigned 12 · SLA breaches 3" into numbers (older alerts carry only this line). */
function readCount(body: string, label: string) {
  return body.match(new RegExp(`${label} (\d+)`))?.[1] ?? "0";
}

function DigestList({ title, rows }: { title: string; rows: Array<{ name: string; value: number }> }) {
  const largest = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.name} className="text-xs">
            <div className="flex justify-between gap-2">
              <span className="truncate">{row.name}</span>
              <span className="font-semibold">{row.value}</span>
            </div>
            <div className="mt-0.5 h-1 bg-chart-track">
              <div className="h-1 bg-brand" style={{ width: `${(row.value / largest) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Daily summary email to the Owner: counts by category, open backlog by age and the mails past their reply time (FR-28). */
export default function DigestAlert({ alert }: { alert: Alert }) {
  const digest = alert.digest;

  return (
    <AlertFrame>
      <div className="border-b border-line-soft bg-stripe px-5 py-3.5">
        <p className="text-xs text-ink-muted">To: Platform Owner · every morning · {formatDateTime(alert.at)}</p>
        <p className="mt-0.5 text-base font-semibold">{alert.title} · ai@schindler.com</p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-[18px]">
        <div className="flex gap-2.5">
          <DigestNumber label="Open backlog" value={String(digest?.open ?? readCount(alert.body, "Open"))} />
          <DigestNumber label="Unassigned" value={String(digest?.unassigned ?? readCount(alert.body, "Unassigned"))} isAlarm />
          <DigestNumber label="SLA breaches" value={String(digest?.breachCount ?? readCount(alert.body, "SLA breaches"))} isAlarm />
        </div>

        {digest && (
          <>
            <div className="flex gap-6">
              <DigestList title="Mails by category (30 days)" rows={digest.byCategory} />
              <DigestList title="Open backlog by age" rows={digest.backlog} />
            </div>
            {digest.breaches.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">Past their reply time</p>
                <ul className="flex flex-col">
                  {digest.breaches.map((breach) => (
                    <li key={breach.id} className="border-t border-line-soft py-1.5 first:border-t-0">
                      <Link href={`/inbox?tab=all&mail=${breach.id}`} className="flex gap-3 text-xs hover:underline">
                        <span className="truncate">{breach.subject}</span>
                        <span className="ml-auto shrink-0 font-semibold text-brand-dark">{breach.overByH < 1 ? "< 1 h late" : `${breach.overByH} h late`}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div>
          <ButtonLink href="/dashboard" variant="primary" large className="px-[18px]">
            Open dashboard
          </ButtonLink>
        </div>
      </div>
    </AlertFrame>
  );
}
