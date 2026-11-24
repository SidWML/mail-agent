import SearchForm from "@/components/common/SearchForm";
import { getKeptFields, type SearchParams } from "@/lib/url";
import type { CategoryWithCount, MailFacets } from "@/types/api";
import type { SavedView, User } from "@/types/mailbox";
import SavedViewsMenu from "./SavedViewsMenu";
import {
  AssigneeMenu,
  CategoryMenu,
  DateMenu,
  MoreFiltersMenu,
  NeedsReviewMenu,
  SortMenu,
  StatusMenu,
  UrgencyMenu,
} from "./InboxFilterMenus";
import { INBOX_PATH, type InboxFilters } from "./inbox-filters";

interface InboxToolbarProps {
  filters: InboxFilters;
  params: SearchParams;
  facets: MailFacets;
  categories: CategoryWithCount[];
  currentUser: User;
  allUsers: User[];
  needsReviewCount: number;
  savedViews: SavedView[];
  /** Address the saved-views forms return to. */
  returnTo: string;
}

/** Search box, the filter menus and Sort. */
export default function InboxToolbar({
  filters,
  params,
  facets,
  categories,
  currentUser,
  allUsers,
  needsReviewCount,
  savedViews,
  returnTo,
}: InboxToolbarProps) {
  const menuProps = { filters, params, facets };
  const teammates = allUsers.filter((user) => user.role === "agent" && user.id !== currentUser.id);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2.5 px-5 py-3.5">
      <SearchForm
        value={filters.search}
        placeholder="Search mails"
        action={INBOX_PATH}
        keptFields={getKeptFields(params, ["q"])}
      />
      <CategoryMenu {...menuProps} categories={categories} />
      <UrgencyMenu {...menuProps} />
      <StatusMenu {...menuProps} isOwner={currentUser.role === "owner"} />
      <AssigneeMenu {...menuProps} currentUser={currentUser} teammates={teammates} />
      <DateMenu filters={filters} params={params} />
      <NeedsReviewMenu {...menuProps} needsReviewCount={needsReviewCount} />
      <MoreFiltersMenu {...menuProps} />

      <div className="ml-auto flex items-center gap-2.5">
        <SavedViewsMenu views={savedViews} returnTo={returnTo} />
        <span className="text-[13px] text-ink-3">Sort</span>
        <SortMenu filters={filters} params={params} />
      </div>
    </div>
  );
}
