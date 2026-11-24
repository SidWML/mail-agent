import { ButtonLink } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import type { Alert } from "@/types/mailbox";
import AlertFrame from "./AlertFrame";
import DigestNumber from "./DigestNumber";

/** Read "Open 47 · Unassigned 12 · SLA breaches 3" into numbers. */
function readCount(body: string, label: string) {
  return body.match(new RegExp(`${label} (\\d+)`))?.[1] ?? "0";
}

/** Daily summary email to the Owner (screen Alert_Digest). */
export default function DigestAlert({ alert }: { alert: Alert }) {
  return (
    <AlertFrame>
      <div className="border-b border-line-soft bg-stripe px-5 py-3.5">
        <p className="text-xs text-ink-muted">To: Platform Owner · every morning · {formatDateTime(alert.at)}</p>
        <p className="mt-0.5 text-base font-semibold">{alert.title} · ai@schindler.com</p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-[18px]">
        <div className="flex gap-2.5">
          <DigestNumber label="Open backlog" value={readCount(alert.body, "Open")} />
          <DigestNumber label="Unassigned" value={readCount(alert.body, "Unassigned")} isAlarm />
          <DigestNumber label="SLA breaches" value={readCount(alert.body, "SLA breaches")} isAlarm />
        </div>
        <div>
          <ButtonLink href="/dashboard" variant="primary" large className="px-[18px]">
            Open dashboard
          </ButtonLink>
        </div>
      </div>
    </AlertFrame>
  );
}
