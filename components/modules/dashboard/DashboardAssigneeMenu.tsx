import FilterMenu from "@/components/common/FilterMenu";
import FilterOption from "@/components/common/FilterOption";
import { groupUsersByTeam, teamFilterValue } from "@/lib/teams";
import { getKeptFields, withParams, type SearchParams } from "@/lib/url";
import type { User } from "@/types/mailbox";
import { DASHBOARD_PATH, ONE_TIME_KEYS, type DashboardFilters } from "./dashboard-filters";

interface DashboardAssigneeMenuProps {
  filters: DashboardFilters;
  params: SearchParams;
  /** People who can own mails (Platform Owner and support team members). */
  assignees: User[];
}

/** Pick one person, or a whole team (every chart then shows only that team's mails). */
export default function DashboardAssigneeMenu({ filters, params, assignees }: DashboardAssigneeMenuProps) {
  const groups = groupUsersByTeam(assignees);
  const selectedPerson = assignees.find((user) => user.id === filters.assignee);
  const selectedTeam = filters.assignee.startsWith("team:") ? filters.assignee.slice(5) : undefined;
  const label = selectedPerson?.name ?? (selectedTeam ? `Team ${selectedTeam}` : "All assignees");

  return (
    <FilterMenu
      label={label}
      title="Assignee"
      subtitle="Pick a person or a whole team"
      widthClass="w-[290px]"
      action={DASHBOARD_PATH}
      keptFields={getKeptFields(params, ["assignee", ...ONE_TIME_KEYS])}
      clearHref={withParams(DASHBOARD_PATH, params, { assignee: undefined, notice: undefined, noticeTone: undefined })}
    >
      <div className="max-h-[340px] overflow-y-auto">
        <FilterOption type="radio" name="assignee" value="" checked={!selectedPerson && !selectedTeam} label="All assignees" />
        {groups.map((group) => (
          <div key={group.team}>
            <p className="border-t border-[#f0f0f0] bg-stripe px-3.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-ink-muted uppercase">
              {group.team}
              {group.regions.length > 0 && <span className="ml-1.5 font-medium normal-case tracking-normal"> · {group.regions.join(", ")}</span>}
            </p>
            <FilterOption
              type="radio"
              name="assignee"
              value={teamFilterValue(group.team)}
              checked={selectedTeam === group.team}
              label="Whole team"
            />
            {group.members.map((user) => (
              <FilterOption key={user.id} type="radio" name="assignee" value={user.id} checked={user.id === filters.assignee} label={user.name} />
            ))}
          </div>
        ))}
      </div>
    </FilterMenu>
  );
}
