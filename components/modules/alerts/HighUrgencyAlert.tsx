import Icon from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import type { Alert } from "@/types/mailbox";
import AlertFrame from "./AlertFrame";

/** Team-channel message for a High-urgency mail (screen Alert_High). */
export default function HighUrgencyAlert({ alert }: { alert: Alert }) {
  // The server writes the body as "sender · summary · owner".
  const [sender, summary, assignment] = alert.body.split(" · ");
  const subject = alert.title.replace("High urgency: ", "");
  const mailHref = alert.mailIds?.[0] ? `/inbox?mail=${alert.mailIds[0]}` : "/inbox";

  return (
    <AlertFrame>
      <div className="flex items-center gap-2.5 border-b border-line-soft bg-stripe px-[18px] py-3">
        <span className="flex size-[26px] items-center justify-center bg-brand text-white">
          <Icon name="mail" size={14} />
        </span>
        <span className="text-[13px] font-semibold">Mailbox Agent · team channel</span>
        <span className="ml-auto text-xs text-ink-muted">{formatDateTime(alert.at)}</span>
      </div>

      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <span className="inline-flex items-center self-start rounded-full bg-urgency-high-bg px-3 py-[5px] text-[12.5px] font-semibold text-urgency-high-fg">
          Urgency: High
        </span>
        <p className="text-[17px] font-semibold">{subject}</p>
        <p className="flex items-start gap-1.5 text-[13.5px] leading-[1.5] text-ink-2">
          <Icon name="sparkles" size={13} filled className="mt-[3px] text-brand" />
          <span>{summary}</span>
        </p>
        <p className="text-[12.5px] text-ink-3">
          From {sender} · <strong>{assignment}</strong>
        </p>
        <div className="mt-1 flex gap-2">
          <ButtonLink href={mailHref} variant="primary" large className="px-[18px]">
            Open mail
          </ButtonLink>
        </div>
      </div>
    </AlertFrame>
  );
}
