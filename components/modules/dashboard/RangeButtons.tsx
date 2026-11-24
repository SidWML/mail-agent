import Link from "next/link";
import { cn } from "@/lib/cn";
import { withParams, type SearchParams } from "@/lib/url";
import { DASHBOARD_PATH, RANGE_OPTIONS, type DashboardFilters } from "./dashboard-filters";

interface RangeButtonsProps {
  filters: DashboardFilters;
  params: SearchParams;
}

/** Today / This week / This month. The chosen one is red. */
export default function RangeButtons({ filters, params }: RangeButtonsProps) {
  return (
    <>
      {RANGE_OPTIONS.map((option) => {
        const active = filters.range === option.value;
        return (
          <Link
            key={option.value}
            href={withParams(DASHBOARD_PATH, params, { days: option.value, from: undefined, to: undefined, notice: undefined, noticeTone: undefined })}
            className={cn(
              "-ml-px inline-flex h-10 items-center border px-3.5 text-[13px] first:ml-0",
              active ? "border-brand bg-brand font-semibold text-white" : "border-line-input bg-card font-medium text-ink-3",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </>
  );
}
