import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import type { Alert } from "@/types/mailbox";
import AlertFrame from "./AlertFrame";

/** Email to the Owner when mail sync keeps failing. Built like the breach alert (there is no own screen). */
export default function SyncAlert({ alert }: { alert: Alert }) {
  return (
    <AlertFrame>
      <div className="flex items-center gap-2.5 border-b border-[#f4c3c8] bg-brand-tint px-5 py-3.5">
        <Icon name="warning" size={18} className="text-brand-dark" />
        <span className="text-sm font-bold text-brand-deeper">{alert.title} · sent to the Platform Owner</span>
        <span className="ml-auto text-xs text-brand-dark">{formatDateTime(alert.at)}</span>
      </div>
      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <p className="text-[13.5px] leading-[1.5] text-ink-2">{alert.body}</p>
        <div>
          <ButtonLink href="/inbox" variant="primary" large className="px-[18px]">
            Open inbox
          </ButtonLink>
        </div>
      </div>
    </AlertFrame>
  );
}
