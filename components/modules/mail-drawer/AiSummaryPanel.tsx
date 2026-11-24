import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { CATEGORY_ICONS } from "@/lib/icons";
import type { MailDetail } from "@/types/api";
import type { Perms } from "@/types/mailbox";

interface AiSummaryPanelProps {
  mail: MailDetail;
  perms: Perms;
  changeCategoryHref: string;
  blockSenderHref: string;
}

const sectionTitleClassName = "text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase";

/** Right-hand column: AI summary, category with confidence, detected details, block sender. */
export default function AiSummaryPanel({ mail, perms, changeCategoryHref, blockSenderHref }: AiSummaryPanelProps) {
  const confidence = Math.round(mail.confidence * 100);
  const details = [
    ["Business unit", mail.entities.businessUnit],
    ["Country", mail.entities.country],
    ["Application", mail.entities.application],
    ["Language", mail.entities.language],
  ];

  return (
    <aside className="max-w-[380px] min-w-[340px] flex-[1_1_340px] self-start border border-[#e6e6e6] bg-card">
      <div className="border-b border-[#eee] px-6 py-[22px]">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" size={14} filled className="text-brand" />
          <span className={sectionTitleClassName}>AI summary</span>
        </div>
        <p className="mt-3 text-[17px] leading-[1.4] font-semibold">{mail.summary}</p>
        <ul className="mt-3.5 flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-[1.5] text-[#3a3a3a]">
          {mail.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <div className="border-b border-[#eee] px-6 py-5">
        <p className={sectionTitleClassName}>Category</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Icon name={CATEGORY_ICONS[mail.category ?? ""] ?? "tag"} size={16} strokeWidth={1.9} className="text-brand" />
            {mail.category}
          </span>
          <span className="text-2xl font-light">{confidence}%</span>
        </div>
        <div className="mt-2 h-1.5 bg-[#eee]">
          <div className="h-1.5 bg-brand" style={{ width: `${confidence}%` }} />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs text-ink-muted">AI confidence</span>
          {perms.recategorize ? (
            <Link href={changeCategoryHref} className="py-1.5 text-[13px] font-semibold text-brand">
              Change category
            </Link>
          ) : (
            <span className="text-xs text-ink-muted">Read only</span>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        <p className={sectionTitleClassName}>Detected details</p>
        <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-4">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-ink-muted">{label}</p>
              <p className="mt-[3px] text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {perms.block && (
        <div className="flex items-center justify-between border-t border-[#eee] px-6 py-4">
          <span className="text-xs text-ink-muted">Unwanted sender?</span>
          <Link href={blockSenderHref} className="text-[13px] font-semibold text-brand-dark">
            Mark as spam / block sender
          </Link>
        </div>
      )}
    </aside>
  );
}
