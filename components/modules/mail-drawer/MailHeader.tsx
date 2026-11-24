import CategoryTag from "@/components/ui/CategoryTag";
import StatusBadge from "@/components/ui/StatusBadge";
import Icon from "@/components/ui/Icon";
import { formatDuration, hoursUntil } from "@/lib/format";
import type { MailDetail } from "@/types/api";

const URGENCY_STYLES = {
  High: "bg-urgency-high-bg text-urgency-high-fg",
  Medium: "bg-urgency-medium-bg text-urgency-medium-fg",
  Low: "bg-urgency-low-bg text-urgency-low-fg",
} as const;

const SENTIMENT_STYLES = {
  Positive: "bg-status-new-bg text-status-new-fg",
  Neutral: "bg-urgency-low-bg text-urgency-low-fg",
  Negative: "bg-[#fdebd3] text-[#8a4300]",
} as const;

const pillClassName = "inline-flex items-center whitespace-nowrap rounded-full px-3 py-[5px] text-[12.5px] font-semibold";

/**
 * The first reply is due `slaHours` after the mail arrived (set per category). Only mails that are still
 * waiting for a first reply have a due time.
 */
function getSlaChip(mail: MailDetail) {
  const waitingForFirstReply = (mail.status === "New" || mail.status === "In progress") && !mail.firstReplyAt;
  if (!waitingForFirstReply || !mail.slaHours) return undefined;
  const dueInHours = hoursUntil(new Date(new Date(mail.receivedAt).getTime() + mail.slaHours * 3600_000).toISOString());
  if (dueInHours < 0) return { text: `SLA overdue by ${formatDuration(-dueInHours)}`, tone: "bg-urgency-high-bg text-urgency-high-fg" };
  if (dueInHours < Math.max(1, mail.slaHours * 0.25)) return { text: `Reply due in ${formatDuration(dueInHours)}`, tone: "bg-status-progress-bg text-status-progress-fg" };
  return { text: `Reply due in ${formatDuration(dueInHours)}`, tone: "bg-urgency-low-bg text-urgency-low-fg" };
}

/** Subject and the tags under it: category, urgency, sentiment, status and when the first reply is due. */
export default function MailHeader({ mail }: { mail: MailDetail }) {
  const sla = getSlaChip(mail);
  return (
    <div className="px-6 py-5">
      <h1 className="text-2xl font-normal tracking-[-0.01em]">{mail.subject}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {mail.category && <CategoryTag name={mail.category} large />}
        <span className={`${pillClassName} ${URGENCY_STYLES[mail.urgency]}`}>Urgency: {mail.urgency}</span>
        <span className={`${pillClassName} ${SENTIMENT_STYLES[mail.sentiment]}`}>Sentiment: {mail.sentiment}</span>
        <StatusBadge status={mail.status} large />
        {sla && (
          <span className={`${pillClassName} gap-1.5 ${sla.tone}`} title={`First reply is due ${mail.slaHours} h after arrival (set per category)`}>
            <Icon name="clock" size={13} />
            {sla.text}
          </span>
        )}
      </div>
    </div>
  );
}
