import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import type { Alert } from "@/types/mailbox";
import AlertFrame from "./AlertFrame";

/** Email to the Owner about mails that passed their SLA (screen Alert_Breach). */
export default function BreachAlert({ alert }: { alert: Alert }) {
  // The server writes one line per mail: "Subject (Category)".
  const lines = alert.body.split("\n").filter(Boolean);

  return (
    <AlertFrame>
      <div className="flex items-center gap-2.5 border-b border-[#f4c3c8] bg-brand-tint px-5 py-3.5">
        <Icon name="warning" size={18} className="text-brand-dark" />
        <span className="text-sm font-bold text-brand-deeper">SLA breach · sent to the Platform Owner</span>
        <span className="ml-auto text-xs text-brand-dark">{formatDateTime(alert.at)}</span>
      </div>

      <div className="flex flex-col gap-1 px-5 py-[18px]">
        <p className="mb-1.5 text-[12.5px] text-ink-3">{alert.title}. These mails passed the time allowed for their category:</p>
        {lines.map((line, index) => {
          const mailId = alert.mailIds?.[index];
          return (
            <div key={line} className="flex items-center gap-3 border-t border-[#eee] py-3">
              <p className="min-w-0 flex-1 text-[13.5px] font-semibold">
                {mailId ? <Link href={`/inbox?mail=${mailId}`}>{line}</Link> : line}
              </p>
              <span className="bg-brand-tint px-2 py-[3px] text-xs font-bold text-brand-dark">Over SLA</span>
            </div>
          );
        })}
        <div className="mt-3 flex gap-2">
          <ButtonLink href="/inbox" variant="primary" large className="px-[18px]">
            Open breach list
          </ButtonLink>
        </div>
      </div>
    </AlertFrame>
  );
}
