import Link from "next/link";
import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Avatar from "@/components/ui/Avatar";
import Button, { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { groupUsersByTeam } from "@/lib/teams";
import type { User } from "@/types/mailbox";

export interface AssignableUser {
  user: User;
  openMails: number;
}

interface AssignDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  people: AssignableUser[];
  /** Id of the current owner (marked "Current owner"). */
  currentOwnerId?: string;
  bulkCount?: number;
  /** Team the list is narrowed to. Empty means every team. */
  selectedTeam: string;
  /** Link that narrows the list to one team (pass an empty team for "All teams"). */
  getTeamHref: (team: string) => string;
}

/** Platform Owner: pick who owns the mail, from any team or region. The new owner can reply; the previous owner is locked out. */
export default function AssignDialog({
  action,
  hiddenFields,
  closeHref,
  people,
  currentOwnerId,
  bulkCount,
  selectedTeam,
  getTeamHref,
}: AssignDialogProps) {
  const hasOwner = Boolean(currentOwnerId) && !bulkCount;
  const openMailsByUser = new Map(people.map((person) => [person.user.id, person.openMails]));
  const allGroups = groupUsersByTeam(people.map((person) => person.user));
  const visibleGroups = allGroups.filter((group) => !selectedTeam || group.team === selectedTeam);

  return (
    <Modal
      title={bulkCount ? `Assign ${bulkCount} mails` : "Assign or reassign mail"}
      subtitle="Platform Owner only. You can assign to anyone, in any team or region. The new owner can reply; the previous owner is locked out."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            {hasOwner ? "Reassign" : "Assign"}
          </Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[{ team: "", label: "All teams" }, ...allGroups.map((group) => ({ team: group.team, label: group.team }))].map((option) => (
          <Link
            key={option.label}
            href={getTeamHref(option.team)}
            className={cn(
              "border px-2.5 py-1 text-xs font-semibold",
              selectedTeam === option.team ? "border-brand bg-brand text-white" : "border-line-control bg-card text-ink-3",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <p className="mb-2 text-[13px] font-semibold">
        Assign to <span className="text-brand">*</span>
      </p>
      <div className="flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1">
        {visibleGroups.map((group) => (
          <div key={group.team}>
            <p className="mb-1.5 text-[11px] font-bold tracking-[0.06em] text-ink-muted uppercase">
              {group.team}
              {group.regions.length > 0 && <span className="font-medium normal-case tracking-normal"> · {group.regions.join(", ")}</span>}
            </p>
            <div className="flex flex-col gap-2">
              {group.members.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3 border border-line-control bg-card px-3 py-2.5 has-checked:border-brand has-checked:bg-brand-tint-soft"
                >
                  <input type="radio" name="userId" value={user.id} required className="peer sr-only" />
                  <Avatar initials={user.initials} size="large" />
                  <span className="mr-auto">
                    <span className="block text-[13.5px] font-semibold">{user.name}</span>
                    <span className="block text-[12.5px] text-ink-3">
                      {user.id === currentOwnerId ? "Current owner" : "Support team member"}
                      {user.region ? ` · ${user.region}` : ""} · {openMailsByUser.get(user.id) ?? 0} open
                    </span>
                  </span>
                  <span className="flex size-[18px] items-center justify-center rounded-full border-2 border-ink-faint peer-checked:border-brand [&>span]:opacity-0 peer-checked:[&>span]:opacity-100">
                    <span className="size-2 rounded-full bg-brand" />
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
