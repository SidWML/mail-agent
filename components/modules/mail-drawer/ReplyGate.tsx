import type { ReactNode } from "react";
import { assignMailToMe, claimMail } from "@/actions/mail-actions";
import ActionFields from "@/components/common/ActionFields";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { MailDetail } from "@/types/api";
import type { Perms, User } from "@/types/mailbox";
import type { DrawerLinks } from "./drawer-links";

interface ReplyGateProps {
  mail: MailDetail;
  perms: Perms;
  currentUser: User;
  links: DrawerLinks;
}

function GateBox({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border border-dashed border-[#b5b8bf] bg-card px-6 py-[22px]">
      <span className="flex size-10 shrink-0 items-center justify-center bg-page text-ink-3">
        <Icon name="lock" size={18} />
      </span>
      <div className="mr-auto">
        <p className="text-[14.5px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[13px] text-ink-3">{text}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * Shown instead of the reply box when you cannot reply yet:
 * take the mail, ask for a takeover, or (Platform Owner) assign it to yourself.
 */
export default function ReplyGate({ mail, perms, currentUser, links }: ReplyGateProps) {
  const fields = { mailId: mail.id, version: mail.version, returnTo: links.returnTo };
  const isOpen = ["New", "In progress", "Waiting on sender"].includes(mail.status);
  if (perms.reply || !isOpen || currentUser.role === "viewer") return null;

  if (perms.claim) {
    return (
      <GateBox title="Take this mail to reply" text="Replying is only open to the owner, so two people never answer the same mail.">
        <form action={claimMail}>
          <ActionFields {...fields} />
          <Button type="submit" variant="primary" large>
            Take it
          </Button>
        </form>
      </GateBox>
    );
  }

  if (perms.assignToMe) {
    return (
      <GateBox title="Replying stays with the owner" text="Assign the mail to yourself to reply. The change is written to the audit log.">
        <form action={assignMailToMe}>
          <ActionFields {...fields} />
          <Button type="submit" variant="primary" large>
            Assign to me
          </Button>
        </form>
      </GateBox>
    );
  }

  return (
    <GateBox title="Replying is locked" text={`${mail.ownerName ?? "The owner"} owns this mail. Ask for a takeover if it needs to move to you.`}>
      {perms.takeoverRequest && (
        <ButtonLink href={links.dialog("takeover")} variant="neutral" large>
          Request takeover
        </ButtonLink>
      )}
    </GateBox>
  );
}
