import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  label: string;
  href: string;
  count: number;
  active: boolean;
  /** Small icon before the label (the lock on the Deleted tab). */
  icon?: ReactNode;
  /** Push this tab to the right edge. */
  alignRight?: boolean;
}

/** Tabs with a count badge. The active tab has a red underline and a red count. */
export default function TabBar({ tabs }: { tabs: TabItem[] }) {
  return (
    <nav aria-label="Mail views" className="flex shrink-0 gap-x-1 overflow-x-auto border-b border-line-soft px-5">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "flex min-h-[52px] items-center gap-2 border-b-[3px] px-3.5 text-sm transition-[color,border-color] duration-200 ease-out hover:text-ink",
            tab.active ? "border-brand font-semibold text-ink" : "border-transparent font-medium text-ink-3",
            tab.alignRight && "ml-auto",
          )}
        >
          {tab.icon}
          {tab.label}
          <span
            className={cn(
              "px-[7px] py-0.5 text-xs font-semibold",
              tab.active ? "bg-brand text-white" : "bg-[#eee] text-[#333]",
            )}
          >
            {tab.count}
          </span>
        </Link>
      ))}
    </nav>
  );
}
