import { applySort } from "@/actions/inbox-views";
import FilterMenu from "@/components/common/FilterMenu";
import FilterOption from "@/components/common/FilterOption";
import Icon from "@/components/ui/Icon";
import { CATEGORY_ICONS } from "@/lib/icons";
import { groupUsersByTeam, teamFilterValue } from "@/lib/teams";
import { getKeptFields, withParams, type SearchParams } from "@/lib/url";
import type { CategoryWithCount, MailFacets } from "@/types/api";
import type { User } from "@/types/mailbox";
import {
  DATE_OPTIONS,
  FILTER_PARAM_KEYS,
  INBOX_PATH,
  SENTIMENT_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
  type InboxFilters,
} from "./inbox-filters";

interface MenuProps {
  filters: InboxFilters;
  /** The page's current ?query. Other filters are kept when a menu is applied. */
  params: SearchParams;
  facets: MailFacets;
}

/** Props every menu needs: where to send the form, what to keep, and how to clear its own filter. */
function getMenuBase(params: SearchParams, ownKeys: readonly string[]) {
  return {
    action: INBOX_PATH,
    keptFields: getKeptFields(params, [...ownKeys]),
    clearHref: withParams(INBOX_PATH, params, { ...Object.fromEntries(ownKeys.map((key) => [key, undefined])), page: undefined }),
  };
}

export function CategoryMenu({ filters, params, facets, categories }: MenuProps & { categories: CategoryWithCount[] }) {
  return (
    <FilterMenu
      label="Category"
      title="Category"
      subtitle="Pick one or more"
      widthClass="w-[300px]"
      {...getMenuBase(params, FILTER_PARAM_KEYS.category)}
    >
      {categories
        .filter((category) => category.active)
        .map((category) => (
          <FilterOption
            key={category.id}
            type="checkbox"
            name="category"
            value={category.id}
            checked={filters.categoryIds.includes(category.id)}
            label={category.name}
            count={facets.category[category.id] ?? 0}
            leading={<Icon name={CATEGORY_ICONS[category.name] ?? "tag"} size={15} strokeWidth={1.9} className="text-brand" />}
          />
        ))}
    </FilterMenu>
  );
}

export function UrgencyMenu({ filters, params, facets }: MenuProps) {
  return (
    <FilterMenu label="Urgency" title="Urgency" subtitle="Pick one or more" {...getMenuBase(params, FILTER_PARAM_KEYS.urgency)}>
      {URGENCY_OPTIONS.map((urgency) => (
        <FilterOption
          key={urgency}
          type="checkbox"
          name="urgency"
          value={urgency}
          checked={filters.urgencies.includes(urgency)}
          label={urgency}
          count={facets.urgency[urgency] ?? 0}
        />
      ))}
    </FilterMenu>
  );
}

export function StatusMenu({ filters, params, facets, isOwner }: MenuProps & { isOwner: boolean }) {
  const statuses = STATUS_OPTIONS.filter((status) => status !== "Deleted" || isOwner);
  return (
    <FilterMenu
      label="Status"
      title="Status"
      subtitle="Pick one or more"
      widthClass="w-[270px]"
      {...getMenuBase(params, FILTER_PARAM_KEYS.status)}
    >
      {statuses.map((status) => (
        <FilterOption
          key={status}
          type="checkbox"
          name="status"
          value={status}
          checked={filters.statuses.includes(status)}
          label={status === "Deleted" ? "Deleted (Owner only)" : status}
          count={facets.status[status] ?? 0}
        />
      ))}
    </FilterMenu>
  );
}

export function AssigneeMenu({
  filters,
  params,
  facets,
  currentUser,
  teammates,
}: MenuProps & { currentUser: User; teammates: User[] }) {
  const teamGroups = groupUsersByTeam(teammates);
  const countFor = (members: User[]) => members.reduce((sum, member) => sum + (facets.assignee[member.id] ?? 0), 0);

  return (
    <FilterMenu
      label="Assignee"
      title="Assignee"
      subtitle="Pick a person or a whole team"
      widthClass="w-[300px]"
      {...getMenuBase(params, FILTER_PARAM_KEYS.assignee)}
    >
      <div className="max-h-[340px] overflow-y-auto">
        <FilterOption type="radio" name="assignee" value="" checked={filters.assignee === ""} label="Anyone" />
        <FilterOption
          type="radio"
          name="assignee"
          value="me"
          checked={filters.assignee === "me"}
          label={`Me (${currentUser.name})`}
          count={facets.assignee[currentUser.id] ?? 0}
        />
        <FilterOption
          type="radio"
          name="assignee"
          value="unassigned"
          checked={filters.assignee === "unassigned"}
          label="Unassigned"
          count={facets.assignee.unassigned ?? 0}
        />
        {teamGroups.map((group) => (
          <div key={group.team}>
            <p className="border-t border-[#f0f0f0] bg-stripe px-3.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-ink-muted uppercase">
              {group.team}
              {group.regions.length > 0 && <span className="ml-1.5 font-medium normal-case tracking-normal"> · {group.regions.join(", ")}</span>}
            </p>
            <FilterOption
              type="radio"
              name="assignee"
              value={teamFilterValue(group.team)}
              checked={filters.assignee === teamFilterValue(group.team)}
              label={`Whole team`}
              count={countFor(group.members)}
            />
            {group.members.map((user) => (
              <FilterOption
                key={user.id}
                type="radio"
                name="assignee"
                value={user.id}
                checked={filters.assignee === user.id}
                label={user.name}
                count={facets.assignee[user.id] ?? 0}
              />
            ))}
          </div>
        ))}
      </div>
    </FilterMenu>
  );
}

const dateInputClassName = "h-[34px] w-full min-w-0 border border-line-input bg-card px-2.5 text-[13px] outline-none focus:border-brand";

export function DateMenu({ filters, params }: Pick<MenuProps, "filters" | "params">) {
  return (
    <FilterMenu label="Date" title="Date received" subtitle="Pick a range" {...getMenuBase(params, FILTER_PARAM_KEYS.date)}>
      {DATE_OPTIONS.map((option) => (
        <FilterOption
          key={option.value}
          type="radio"
          name="date"
          value={option.value}
          checked={filters.date === option.value}
          label={option.label}
        />
      ))}
      <div className="flex gap-2 border-t border-[#f0f0f0] px-3.5 py-2.5">
        <input type="date" name="from" defaultValue={filters.dateFrom} aria-label="From" className={dateInputClassName} />
        <input type="date" name="to" defaultValue={filters.dateTo} aria-label="To" className={dateInputClassName} />
      </div>
    </FilterMenu>
  );
}

export function NeedsReviewMenu({
  filters,
  params,
  facets,
  needsReviewCount,
}: MenuProps & { needsReviewCount: number }) {
  return (
    <FilterMenu
      label="Needs review"
      badge={needsReviewCount}
      title="Needs review"
      subtitle="Mails the AI was not sure about (confidence below 0.6)"
      widthClass="w-[300px]"
      {...getMenuBase(params, FILTER_PARAM_KEYS.review)}
    >
      <FilterOption
        type="checkbox"
        name="review"
        value="1"
        checked={filters.needsReviewOnly}
        label="Show only Needs review"
        count={facets.needsReview}
      />
    </FilterMenu>
  );
}

export function MoreFiltersMenu({ filters, params, facets }: MenuProps) {
  return (
    <FilterMenu
      label="More filters"
      leadingIcon
      title="More filters"
      subtitle="Combine with the others"
      widthClass="w-[300px]"
      keptFields={getKeptFields(params, [...FILTER_PARAM_KEYS.attachment, ...FILTER_PARAM_KEYS.sentiment, ...FILTER_PARAM_KEYS.domain])}
      action={INBOX_PATH}
      clearHref={withParams(INBOX_PATH, params, { attachment: undefined, sentiment: undefined, domain: undefined, page: undefined })}
    >
      <FilterOption
        type="checkbox"
        name="attachment"
        value="1"
        checked={filters.hasAttachment}
        label="Has attachment"
        count={facets.hasAttachment}
      />
      {SENTIMENT_OPTIONS.map((sentiment) => (
        <FilterOption
          key={sentiment}
          type="checkbox"
          name="sentiment"
          value={sentiment}
          checked={filters.sentiments.includes(sentiment)}
          label={`Sentiment: ${sentiment}`}
          count={facets.sentiment[sentiment] ?? 0}
        />
      ))}
      <div className="border-t border-[#f0f0f0] px-3.5 py-2.5">
        <label htmlFor="sender-domain" className="text-[13px] text-ink-3">
          Sender domain
        </label>
        <input
          id="sender-domain"
          name="domain"
          defaultValue={filters.domain}
          placeholder="e.g. schindler.com"
          className={`${dateInputClassName} mt-1.5`}
        />
      </div>
    </FilterMenu>
  );
}

export function SortMenu({ filters, params }: Pick<MenuProps, "filters" | "params">) {
  const current = SORT_OPTIONS.find((option) => option.value === filters.sort) ?? SORT_OPTIONS[0];
  return (
    <FilterMenu
      label={current.short}
      emphasized
      alignRight
      title="Sort"
      subtitle="Your choice is remembered"
      widthClass="w-[320px]"
      {...getMenuBase(params, ["sort"])}
      action={applySort}
    >
      {SORT_OPTIONS.map((option) => (
        <FilterOption
          key={option.value}
          type="radio"
          name="sort"
          value={option.value}
          checked={current.value === option.value}
          label={option.label}
        />
      ))}
    </FilterMenu>
  );
}
