import { switchUser } from "@/actions/switch-user";
import Avatar from "@/components/ui/Avatar";
import { ROLE_LABELS } from "@/lib/navigation";
import { USERS } from "@/server/store"; // Dummy backend only: the demo user list lives in the fake server.

/** Demo helper: pick another persona. In production there is no switcher, access comes from the security group. */
export default function DemoUserSwitch() {
  const usersWithAccess = USERS.filter((user) => user.role !== "none");

  return (
    <form action={switchUser} className="w-[680px] max-w-full border border-dashed border-ink-faint bg-card p-2.5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
        Demo only · switch to a user with access
      </p>
      <div className="flex flex-wrap gap-2">
        {usersWithAccess.map((user) => (
          <button
            key={user.id}
            name="userId"
            value={user.id}
            className="flex cursor-pointer items-center gap-2 border border-line-control bg-card px-2.5 py-1.5 text-left hover:bg-stripe"
          >
            <Avatar initials={user.initials} />
            <span className="text-[12.5px] font-medium">
              {user.name}
              <span className="block text-[11px] font-normal text-ink-muted">{ROLE_LABELS[user.role]}</span>
            </span>
          </button>
        ))}
      </div>
    </form>
  );
}
