import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChartCardProps {
  title: string;
  /** One short line under the title. */
  subtitle: string;
  /** Grid columns the card spans (out of 12), as a Tailwind class such as "col-span-5". */
  spanClass: string;
  /** Dark card (SLA compliance). */
  dark?: boolean;
  /** "See mails" link in the corner. */
  seeMailsHref?: string;
  children: ReactNode;
}

/** Written out in full so Tailwind can find every class (it cannot see names built with replace). */
const LARGE_SPAN: Record<string, string> = {
  "col-span-2": "lg:col-span-2",
  "col-span-3": "lg:col-span-3",
  "col-span-4": "lg:col-span-4",
  "col-span-5": "lg:col-span-5",
  "col-span-6": "lg:col-span-6",
  "col-span-7": "lg:col-span-7",
  "col-span-8": "lg:col-span-8",
};

/** The compact card every chart sits in: title, one line, the chart, and a link to the mails. */
export default function ChartCard({ title, subtitle, spanClass, dark, seeMailsHref, children }: ChartCardProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col border border-card-line p-5",
        dark ? "bg-bar-dark text-white" : "bg-card text-bar-dark",
        // The designed width applies from large screens up; tablets get two cards per row, small screens one.
        "col-span-12 md:col-span-6",
        LARGE_SPAN[spanClass],
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-[13.5px] leading-tight font-semibold">{title}</h2>
          <p className={cn("mt-0.5 truncate text-xs", dark ? "text-on-dark-muted" : "text-ink-3")}>{subtitle}</p>
        </div>
        {seeMailsHref && (
          <Link href={seeMailsHref} className={cn("shrink-0 text-xs font-semibold", dark ? "text-on-dark-link" : "text-brand")}>
            See mails →
          </Link>
        )}
      </div>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}
