import FilterMenu from "@/components/common/FilterMenu";
import FilterOption from "@/components/common/FilterOption";
import SearchForm from "@/components/common/SearchForm";
import { getKeptFields, readParam, withParams, type SearchParams } from "@/lib/url";
import type { User } from "@/types/mailbox";
import { AUDIT_PATH } from "./audit-params";

interface AuditToolbarProps {
  params: SearchParams;
  users: User[];
  actions: string[];
}

/** Search box plus the User and Action type menus. All are plain GET forms that change the address. */
export default function AuditToolbar({ params, users, actions }: AuditToolbarProps) {
  const getMenuBase = (key: string) => ({
    action: AUDIT_PATH,
    keptFields: getKeptFields(params, [key]),
    clearHref: withParams(AUDIT_PATH, params, { [key]: undefined, page: undefined }),
  });

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
      <SearchForm
        value={readParam(params, "q")}
        placeholder="Search mail or details"
        action={AUDIT_PATH}
        keptFields={getKeptFields(params, ["q"])}
      />
      <FilterMenu label="User" title="User" subtitle="Pick one person" {...getMenuBase("user")}>
        {users.map((user) => (
          <FilterOption key={user.id} type="radio" name="user" value={user.id} checked={readParam(params, "user") === user.id} label={user.name} />
        ))}
      </FilterMenu>
      <FilterMenu label="Action type" title="Action type" subtitle="Pick one action" widthClass="w-[280px]" {...getMenuBase("action")}>
        {actions.map((action) => (
          <FilterOption key={action} type="radio" name="action" value={action} checked={readParam(params, "action") === action} label={action} />
        ))}
      </FilterMenu>
    </div>
  );
}
