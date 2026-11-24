import type { ReactNode } from "react";
import { assignMailToMe, claimMail, restoreMail } from "@/actions/mail-actions";
import ActionFields from "@/components/common/ActionFields";
import Avatar from "@/components/ui/Avatar";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { formatDaysAgo, formatWhenSentence, getInitials } from "@/lib/format";
import type { MailDetail } from "@/types/api";
import type { Perms, User } from "@/types/mailbox";
import type { DrawerLinks } from "./drawer-links";

interface OwnershipBarProps {
  mail: MailDetail;
  perms: Perms;
  currentUser: User;
  links: DrawerLinks;
}

/** Grey square with an icon, used instead of an avatar when nobody owns the mail. */
function StateIcon({ name, className }: { name: IconName; className: string }) {
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center ${className}`}>
      <Icon name={name} size={18} />
    </span>
  );
}

/** Words for the bar: who owns the mail and what that means for you. */
function describeOwnership(mail: MailDetail, perms: Perms, currentUser: User): { icon: ReactNode; title: string; text: string } {
  const isMine = mail.ownerId === currentUser.id;
  const lastReply = [...mail.thread].reverse().find((message) => message.kind === "out");

  if (mail.status === "Deleted") {
    return {
      icon: <StateIcon name="trash" className="bg-[#ececec] text-ink-3" />,
      title: `Deleted by ${mail.deletedBy ?? "the Platform Owner"}${mail.deletedAt ? ` · ${formatDaysAgo(mail.deletedAt)}` : ""}`,
      text: `${mail.daysLeftToRestore ?? 0} days left to restore. After that the mail follows the Exchange retention policy.`,
    };
  }
  if (mail.status === "Acted") {
    return {
      icon: <StateIcon name="check" className="bg-ok-bg text-ok-dark" />,
      title: `Acted · ${mail.outcome ?? "Closed"}`,
      text: `By ${mail.ownerName ?? "a team member"}${mail.actedAt ? ` ${formatWhenSentence(mail.actedAt)}` : ""} · hidden from the Active view for everyone`,
    };
  }
  if (currentUser.role === "viewer") {
    return {
      icon: <StateIcon name="eye" className="bg-[#ececec] text-ink-3" />,
      title: "View only",
      text: "You can read this mail and its thread. Replying, status changes and deleting need Support team member or Platform Owner access.",
    };
  }
  if (!mail.ownerId) {
    return {
      icon: <StateIcon name="person" className="bg-status-new-bg text-status-new-fg" />,
      title: "Nobody owns this mail yet",
      text: currentUser.role === "owner" ? "As Platform Owner you can assign it to anyone, or take it yourself." : "Take it to reply. Everyone else will see that you are working on it.",
    };
  }
  if (isMine) {
    return {
      icon: <Avatar initials={getInitials(currentUser.name)} size="large" />,
      title: mail.status === "Waiting on sender" ? "Owned by you · Waiting on sender" : "Owned by you",
      text:
        mail.status === "Waiting on sender" && lastReply
          ? `You replied ${formatWhenSentence(lastReply.at)}. If the sender answers, this mail returns to In progress automatically.`
          : "Teammates are locked out of replying.",
    };
  }
  return {
    icon: <Avatar initials={getInitials(mail.ownerName ?? "?")} size="large" />,
    title: `Owned by ${mail.ownerName}`,
    text:
      currentUser.role === "owner"
        ? "Replies stay with the owner. Reassign it, or assign it to yourself to reply."
        : `Replies are locked while ${mail.ownerName} works on this mail. You can still read it and add internal notes.`,
  };
}

/** The bar under the subject. Its buttons come straight from what the server says you may do. */
export default function OwnershipBar({ mail, perms, currentUser, links }: OwnershipBarProps) {
  const { icon, title, text } = describeOwnership(mail, perms, currentUser);
  const fields = { mailId: mail.id, version: mail.version, returnTo: links.returnTo };
  const waiting = mail.status === "Waiting on sender";
  // The Platform Owner can always try Restore; after 30 days the server answers with the "cannot restore" dialog.
  const canTryRestore = mail.status === "Deleted" && currentUser.role === "owner";

  return (
    <div className="flex flex-wrap items-center gap-3 border-y border-[#eee] bg-[#fafafa] px-6 py-3.5">
      <div className="mr-auto flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-3">{text}</p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2">
        {perms.claim && (
          <form action={claimMail}>
            <ActionFields {...fields} />
            <Button type="submit" variant="primary" large data-shortcut="claim">
              <Icon name="check" size={14} strokeWidth={2.2} />
              Take it
            </Button>
          </form>
        )}
        {perms.assign && (
          <ButtonLink href={links.dialog("assign")} variant="neutral" large>
            <Icon name="person" size={14} />
            {mail.ownerName ? "Reassign" : "Assign"}
            <Icon name="chevronDown" size={12} strokeWidth={2.5} />
          </ButtonLink>
        )}
        {/* "Take it" already does this for an unassigned mail, so it is not offered twice. */}
        {perms.assignToMe && !perms.claim && (
          <form action={assignMailToMe}>
            <ActionFields {...fields} />
            <Button type="submit" variant="primary" large>
              Assign to me
            </Button>
          </form>
        )}
        {perms.reply && (
          <ButtonLink href="#reply" variant="primary" large>
            <Icon name="reply" size={14} strokeWidth={2.3} />
            {waiting ? "Follow up" : "Reply"}
          </ButtonLink>
        )}
        {perms.forward && (
          <ButtonLink href={links.dialog("forward")} variant="neutral" large>
            <Icon name="forward" size={14} strokeWidth={2.2} />
            Forward
          </ButtonLink>
        )}
        {perms.acted && (
          <ButtonLink href={links.dialog("acted")} variant="success" large>
            <Icon name="check" size={14} strokeWidth={2.2} />
            Mark as acted
          </ButtonLink>
        )}
        {perms.takeoverRequest && (
          <ButtonLink href={links.dialog("takeover")} variant="neutral" large>
            <Icon name="person" size={14} />
            Request takeover
          </ButtonLink>
        )}
        {perms.reopen && (
          <ButtonLink href={links.dialog("reopen")} variant="neutral" large>
            <Icon name="undo" size={14} strokeWidth={2.2} />
            Reopen
          </ButtonLink>
        )}
        {(perms.restore || canTryRestore) && (
          <form action={restoreMail}>
            <ActionFields {...fields} />
            <Button type="submit" variant="primary" large>
              <Icon name="undo" size={14} strokeWidth={2.2} />
              Restore
            </Button>
          </form>
        )}
        {/* Delete is kept apart on the right, as a quiet button, so it is not hit by mistake. */}
        {perms.del && (
          <ButtonLink href={links.dialog("delete")} variant="danger" large className="ml-auto">
            <Icon name="trash" size={14} strokeWidth={2.2} />
            Delete
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
