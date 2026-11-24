import FilterMenu from "@/components/common/FilterMenu";
import FilterOption from "@/components/common/FilterOption";
import Icon from "@/components/ui/Icon";
import { CATEGORY_ICONS } from "@/lib/icons";
import { getKeptFields, withParams, type SearchParams } from "@/lib/url";
import type { Category } from "@/types/mailbox";
import { DASHBOARD_PATH, ONE_TIME_KEYS, type DashboardFilters } from "./dashboard-filters";

interface DashboardCategoryMenuProps {
  filters: DashboardFilters;
  params: SearchParams;
  categories: Category[];
}

export default function DashboardCategoryMenu({ filters, params, categories }: DashboardCategoryMenuProps) {
  const activeCategories = categories.filter((category) => category.active);
  const selected = activeCategories.find((category) => category.id === filters.category);

  return (
    <FilterMenu
      label={selected?.name ?? "All categories"}
      title="Category"
      subtitle="Pick one"
      widthClass="w-[300px]"
      action={DASHBOARD_PATH}
      keptFields={getKeptFields(params, ["category", ...ONE_TIME_KEYS])}
      clearHref={withParams(DASHBOARD_PATH, params, { category: undefined, notice: undefined, noticeTone: undefined })}
    >
      <FilterOption type="radio" name="category" value="" checked={!selected} label="All categories" />
      {activeCategories.map((category) => (
        <FilterOption
          key={category.id}
          type="radio"
          name="category"
          value={category.id}
          checked={category.id === filters.category}
          label={category.name}
          leading={<Icon name={CATEGORY_ICONS[category.name] ?? "tag"} size={15} strokeWidth={1.9} className="text-brand" />}
        />
      ))}
    </FilterMenu>
  );
}
