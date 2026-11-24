import FilterMenu from "@/components/common/FilterMenu";
import FilterOption from "@/components/common/FilterOption";
import { getKeptFields, withParams, type SearchParams } from "@/lib/url";
import { DASHBOARD_PATH, ONE_TIME_KEYS, RANGE_OPTIONS, RANGE_PARAM_KEYS, type DashboardFilters } from "./dashboard-filters";

interface TimeRangeMenuProps {
  filters: DashboardFilters;
  params: SearchParams;
}

const dateInputClassName = "h-[34px] w-full min-w-0 border border-line-input bg-card px-2.5 text-[13px] outline-none focus:border-brand";

/** The "Custom" button at the end of the range buttons. Its menu repeats the ranges and adds From / To. */
export default function TimeRangeMenu({ filters, params }: TimeRangeMenuProps) {
  return (
    <FilterMenu
      label="Custom"
      hideChevron
      highlighted={filters.range === "custom"}
      title="Time range"
      subtitle="Applies to every number and chart"
      widthClass="w-[260px]"
      action={DASHBOARD_PATH}
      keptFields={getKeptFields(params, [...RANGE_PARAM_KEYS, ...ONE_TIME_KEYS])}
      clearHref={withParams(DASHBOARD_PATH, params, { days: undefined, from: undefined, to: undefined, notice: undefined, noticeTone: undefined })}
    >
      {RANGE_OPTIONS.map((option) => (
        <FilterOption key={option.value} type="radio" name="days" value={option.value} checked={filters.range === option.value} label={option.label} />
      ))}
      <FilterOption type="radio" name="days" value="custom" checked={filters.range === "custom"} label="Custom range" />
      <div className="flex gap-2 border-t border-line-faint px-3.5 py-2.5">
        <input type="date" name="from" defaultValue={filters.from} aria-label="From" className={dateInputClassName} />
        <input type="date" name="to" defaultValue={filters.to} aria-label="To" className={dateInputClassName} />
      </div>
    </FilterMenu>
  );
}
