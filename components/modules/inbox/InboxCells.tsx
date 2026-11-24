import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import {
  formatActedLabel,
  formatDaysAgo,
  formatDuration,
  formatReceivedLabel,
  getAgeBucket,
  getInitials,
} from "@/lib/format";
import type { MailRow } from "@/types/mailbox";

export function SenderCell({ mail }: { mail: MailRow }) {
  return (
    <div className="flex min-w-0 max-w-full flex-col items-start justify-center">
      <p className="max-w-full truncate text-[13px] font-semibold">{mail.sender}</p>
      <p className="mt-px max-w-full truncate text-[11.5px] text-ink-muted">{mail.email}</p>
    </div>
  );
}

export function SubjectCell({ mail, href }: { mail: MailRow; href: string }) {
  return (
    <div className="flex min-w-0 max-w-full flex-col items-start justify-center">
      <Link href={href} className="flex max-w-full min-w-0 items-center gap-1.5">
        <span className="truncate text-[13.5px] font-semibold">{mail.subject}</span>
        {mail.messageCount > 1 && (
          <span title={`${mail.messageCount} messages in this conversation`} className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-ink-muted">
            <Icon name="chat" size={13} />
            {mail.messageCount}
          </span>
        )}
        {mail.attachmentCount > 0 && (
          <>
            <Icon name="paperclip" size={13} className="text-ink-muted" />
            <span className="text-[11.5px] font-semibold text-ink-muted">{mail.attachmentCount}</span>
          </>
        )}
      </Link>
      <div className="mt-0.5 flex max-w-full min-w-0 items-center gap-[5px]">
        <Icon name="sparkles" size={11} filled className="text-brand" />
        <span className="truncate text-[12.5px] text-ink-2">{mail.summary}</span>
      </div>
    </div>
  );
}

export function OwnerCell({ mail }: { mail: MailRow }) {
  if (!mail.ownerName) return <span className="text-[12.5px] text-[#7a7a7a]">Unassigned</span>;
  return (
    <div className="flex min-w-0 items-center gap-[7px]">
      <Avatar initials={getInitials(mail.ownerName)} />
      <span className="text-[12.5px] font-medium whitespace-nowrap">{mail.ownerName}</span>
    </div>
  );
}

const AGE_FILL_COLORS = ["bg-age-1", "bg-age-2", "bg-age-3", "bg-age-4"];

/** Age + 4-segment strip + received time (or "SLA overdue"). Every filled segment has the colour of the age bucket. */
export function AgeCell({ mail }: { mail: MailRow }) {
  const bucket = getAgeBucket(mail.ageHours);
  const fillColor = AGE_FILL_COLORS[bucket - 1];
  return (
    <div className="flex flex-col items-start justify-center">
      <span className={cn("text-[12.5px] font-semibold whitespace-nowrap", mail.slaBreached ? "text-brand-dark" : "text-ink")}>
        {formatDuration(mail.ageHours)}
      </span>
      <span className="mt-1 flex gap-0.5" role="img" aria-label={`Age bucket ${bucket} of 4`}>
        {[1, 2, 3, 4].map((segment) => (
          <span key={segment} className={cn("h-[5px] w-3.5", segment <= bucket ? fillColor : "bg-age-empty")} />
        ))}
      </span>
      <span
        className={cn(
          "mt-[3px] text-[11.5px] whitespace-nowrap",
          mail.slaBreached ? "font-semibold text-brand-dark" : "text-ink-muted",
        )}
      >
        {mail.slaBreached ? "SLA overdue" : formatReceivedLabel(mail.receivedAt)}
      </span>
    </div>
  );
}

/** Acted tab: how long it took, and when. */
export function TimeToActCell({ mail }: { mail: MailRow }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <span className="text-[12.5px] font-semibold whitespace-nowrap">{formatDuration(mail.timeToActHours ?? 0, true)}</span>
      <span className="mt-0.5 text-[11.5px] whitespace-nowrap text-ink-muted">
        {mail.actedAt ? formatActedLabel(mail.actedAt) : ""}
      </span>
    </div>
  );
}

/** Deleted tab: how long ago and by whom. */
export function DeletedCell({ mail }: { mail: MailRow }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <span className="text-[12.5px] font-semibold whitespace-nowrap">{mail.deletedAt ? formatDaysAgo(mail.deletedAt) : ""}</span>
      <span className="mt-0.5 text-[11.5px] whitespace-nowrap text-ink-muted">by {mail.deletedBy}</span>
    </div>
  );
}

/** Status pill. Acted rows add the outcome, Deleted rows add the days left to restore. */
export function StatusCell({ mail }: { mail: MailRow }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <StatusBadge status={mail.status} />
      {mail.status === "Acted" && mail.outcome && (
        <span className="mt-1 text-[11.5px] font-medium text-ink-2">Outcome: {mail.outcome}</span>
      )}
      {mail.status === "Deleted" && mail.daysLeftToRestore !== undefined && (
        <span className="mt-1 text-[11.5px] text-ink-muted">
          {mail.daysLeftToRestore} {mail.daysLeftToRestore === 1 ? "day" : "days"} left to restore
        </span>
      )}
    </div>
  );
}
