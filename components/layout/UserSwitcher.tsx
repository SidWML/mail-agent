import { switchUser } from "@/actions/switch-user";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { ROLE_LABELS } from "@/lib/navigation";
import type { User } from "@/types/mailbox";

interface UserSwitcherProps {
  currentUser: User;
  allUsers: User[];
}

/** The user chip in the header. Click it to switch demo user (in production the role comes from the Entra ID group). */
export default function UserSwitcher({ currentUser, allUsers }: UserSwitcherProps) {
  return (
    <details name="filter-menu" className="dropdown group relative">
      <summary className="flex items-center gap-3 border border-line-control bg-card py-1.5 pr-2 pl-1.5 sm:pr-3 max-sm:gap-1 transition-colors duration-150 ease-out hover:border-ink-faint hover:bg-stripe group-open:border-brand" title="Switch demo user">
        <Avatar initials={currentUser.initials} size="large" />
        <span className="flex flex-col gap-[3px] max-sm:hidden">
          <span className="text-[13px] leading-none font-semibold">{currentUser.name}</span>
          <span className="self-start whitespace-nowrap bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-dark">
            {ROLE_LABELS[currentUser.role]}
          </span>
        </span>
        <Icon name="chevronDown" size={16} strokeWidth={2.2} className="text-ink-3 transition-transform duration-200 ease-out group-open:rotate-180" />
      </summary>

      <form
        action={switchUser}
        className="absolute top-[calc(100%+8px)] right-0 w-64 border border-line-control border-t-2 border-t-brand bg-card shadow-[0_6px_18px_rgba(0,0,0,0.1)]"
      >
        <p className="px-3.5 pt-3 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Switch demo user</p>
        {allUsers.map((user) => (
          <button
            key={user.id}
            name="userId"
            value={user.id}
            className="flex w-full cursor-pointer items-center gap-2.5 border-t border-[#f0f0f0] px-3.5 py-2 text-left hover:bg-stripe"
          >
            <Avatar initials={user.initials} />
            <span className="text-[13px] font-medium">
              {user.name}
              <span className="block text-[11.5px] font-normal text-ink-muted">{ROLE_LABELS[user.role]}</span>
            </span>
          </button>
        ))}
      </form>
    </details>
  );
}
