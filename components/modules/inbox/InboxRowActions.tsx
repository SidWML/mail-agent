import { claimMail, restoreMail } from "@/actions/mail-actions";
import ActionFields from "@/components/common/ActionFields";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { MailRow, Role } from "@/types/mailbox";

interface InboxRowActionsProps {
  mail: MailRow;
  role: Role;
  /** Link that opens this mail in the drawer. */
  mailHref: string;
  /** Link that opens one of the dialogs (acted, assign, delete...) about this mail, without opening the drawer. */
  getDialogHref: (dialog: string) => string;
  /** Where a button in this row returns to (the list, with this mail as the dialog target). */
  returnTo: string;
}

/**
 * The buttons in the last column. What shows depends on what the server says this person may do (mail.perms).
 * Take it and Restore run straight away; the others open a dialog or the drawer.
 */
function PrimaryActions({ mail, role, mailHref, getDialogHref, returnTo }: InboxRowActionsProps) {
  const { perms } = mail;
  const fields = { mailId: mail.id, version: mail.version, returnTo };

  if (role === "viewer") {
    return (
      <ButtonLink href={mailHref} variant="neutral">
        <Icon name="eye" size={14} />
        Open
      </ButtonLink>
    );
  }

  if (mail.status === "Deleted") {
    // The Platform Owner can always try; after 30 days the server answers with the "cannot restore" dialog.
    return role === "owner" ? (
      <form action={restoreMail}>
        <ActionFields {...fields} />
        <Button type="submit" variant="neutral">
          <Icon name="undo" size={13} strokeWidth={2.2} />
          Restore
        </Button>
      </form>
    ) : null;
  }

  if (mail.status === "Acted") {
    return perms.reopen ? (
      <ButtonLink href={getDialogHref("reopen")} variant="neutral">
        <Icon name="undo" size={13} strokeWidth={2.2} />
        Reopen
      </ButtonLink>
    ) : null;
  }

  // Platform Owner: assign or reassign, mark acted, delete.
  if (perms.assign) {
    return (
      <>
        <ButtonLink href={getDialogHref("assign")} variant="neutral">
          {mail.ownerName ? "Reassign" : "Assign"}
          <Icon name="chevronDown" size={12} strokeWidth={2.5} />
        </ButtonLink>
        {perms.acted && (
          <ButtonLink href={getDialogHref("acted")} variant="success" iconOnly title="Mark as acted">
            <Icon name="check" size={15} strokeWidth={2.2} />
          </ButtonLink>
        )}
        {perms.del && (
          <ButtonLink href={getDialogHref("delete")} variant="danger" iconOnly title="Delete">
            <Icon name="trash" size={15} strokeWidth={2.2} />
          </ButtonLink>
        )}
      </>
    );
  }

  // Support team member.
  if (perms.claim) {
    return (
      <form action={claimMail}>
        <ActionFields {...fields} />
        <Button type="submit" variant="outline" className="min-w-20">
          Take it
        </Button>
      </form>
    );
  }

  if (perms.reply) {
    return (
      <>
        <ButtonLink href={mailHref} variant="primary">
          <Icon name="reply" size={13} strokeWidth={2.3} />
          Reply
        </ButtonLink>
        {perms.forward && (
          <ButtonLink href={getDialogHref("forward")} variant="neutral" iconOnly title="Forward">
            <Icon name="forward" size={15} strokeWidth={2.2} />
          </ButtonLink>
        )}
        {perms.acted && (
          <ButtonLink href={getDialogHref("acted")} variant="success" iconOnly title="Mark as acted">
            <Icon name="check" size={15} strokeWidth={2.2} />
          </ButtonLink>
        )}
      </>
    );
  }

  if (perms.takeoverRequest) {
    return (
      <ButtonLink href={getDialogHref("takeover")} variant="neutral">
        Request takeover
      </ButtonLink>
    );
  }

  return null;
}

/** Every row starts with a "View details" button (opens the mail in the drawer), then the buttons this person may use. */
export default function InboxRowActions(props: InboxRowActionsProps) {
  // Viewers already get an "Open" button as their only action.
  const showViewButton = props.role !== "viewer";
  return (
    <>
      {showViewButton && (
        <ButtonLink href={props.mailHref} variant="neutral" iconOnly title="View details">
          <Icon name="eye" size={15} />
        </ButtonLink>
      )}
      <PrimaryActions {...props} />
    </>
  );
}
