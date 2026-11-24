import type { ReactNode } from "react";

interface MailSummaryBoxProps {
  /** Avatar or icon on the left. */
  leading: ReactNode;
  title: string;
  text: string;
}

/** Grey box that says which mail (and which person) a dialog is about. */
export default function MailSummaryBox({ leading, title, text }: MailSummaryBoxProps) {
  return (
    <div className="flex items-center gap-3 border border-line-soft bg-page px-3.5 py-3">
      {leading}
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-semibold">{title}</p>
        <p className="truncate text-[12.5px] text-ink-3">{text}</p>
      </div>
    </div>
  );
}
