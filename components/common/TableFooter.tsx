import type { ReactNode } from "react";

interface TableFooterProps {
  /** "Showing 8 of 47 active mails" */
  summary: string;
  children?: ReactNode;
}

/** Grey bar under a table: count on the left, pagination on the right. */
export default function TableFooter({ summary, children }: TableFooterProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line-strong bg-stripe px-5 py-2.5">
      <span className="text-[13px] text-ink-3">{summary}</span>
      {children}
    </div>
  );
}
