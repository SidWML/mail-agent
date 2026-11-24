import type { Urgency } from "@/types/mailbox";

const STYLES: Record<Urgency, string> = {
  High: "bg-urgency-high-bg text-urgency-high-fg",
  Medium: "bg-urgency-medium-bg text-urgency-medium-fg",
  Low: "bg-urgency-low-bg text-urgency-low-fg",
};

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${STYLES[urgency]}`}>
      {urgency}
    </span>
  );
}
