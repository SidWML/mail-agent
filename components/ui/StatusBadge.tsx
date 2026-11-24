import type { Status } from "@/types/mailbox";

const STYLES: Record<Status, { pill: string; dot: string }> = {
  New: { pill: "bg-status-new-bg text-status-new-fg", dot: "bg-status-new-dot" },
  "In progress": { pill: "bg-status-progress-bg text-status-progress-fg", dot: "bg-status-progress-dot" },
  "Waiting on sender": { pill: "bg-status-waiting-bg text-status-waiting-fg", dot: "bg-status-waiting-dot" },
  Acted: { pill: "bg-status-acted-bg text-status-acted-fg", dot: "bg-status-acted-dot" },
  Deleted: { pill: "bg-status-deleted-bg text-status-deleted-fg", dot: "bg-status-deleted-dot" },
};

interface StatusBadgeProps {
  status: Status;
  /** Bigger version used in the mail drawer. */
  large?: boolean;
}

export default function StatusBadge({ status, large = false }: StatusBadgeProps) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-full font-semibold ${
        large ? "py-[5px] pr-[13px] pl-[11px] text-[12.5px]" : "py-[3px] pr-[11px] pl-[9px] text-xs"
      } ${style.pill}`}
    >
      <span className={`size-[7px] shrink-0 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
