import type { SearchParams } from "@/lib/url";
import type { Category, User } from "@/types/mailbox";
import DashboardAssigneeMenu from "./DashboardAssigneeMenu";
import DashboardCategoryMenu from "./DashboardCategoryMenu";
import type { DashboardFilters } from "./dashboard-filters";
import ExportMenu from "./ExportMenu";
import RangeButtons from "./RangeButtons";
import TimeRangeMenu from "./TimeRangeMenu";

interface DashboardToolbarProps {
  filters: DashboardFilters;
  params: SearchParams;
  categories: Category[];
  assignees: User[];
}

/** Range buttons, Category, Assignee and Export. Everything lives in the address, so every chart follows. */
export default function DashboardToolbar({ filters, params, categories, assignees }: DashboardToolbarProps) {
  return (
    <div data-no-print className="flex flex-wrap items-center gap-2.5">
      <div className="flex">
        <RangeButtons filters={filters} params={params} />
        <div className="-ml-px">
          <TimeRangeMenu filters={filters} params={params} />
        </div>
      </div>
      <DashboardCategoryMenu filters={filters} params={params} categories={categories} />
      <DashboardAssigneeMenu filters={filters} params={params} assignees={assignees} />
      <ExportMenu filters={filters} />
    </div>
  );
}
