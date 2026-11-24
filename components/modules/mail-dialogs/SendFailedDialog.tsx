import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { ReplyDraft } from "@/services/reply-draft";
import type { Status } from "@/types/mailbox";

interface SendFailedDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  senderName: string;
  status: Status;
  draft: ReplyDraft;
}

/** The send failed. The typed text and attachments are kept; "Try again" sends them once more. */
export default function SendFailedDialog({ action, hiddenFields, closeHref, senderName, status, draft }: SendFailedDialogProps) {
  const attachmentCount = draft.attachments.length;
  return (
    <Modal
      title="Reply not sent"
      subtitle="Nothing left the mailbox."
      closeHref={closeHref}
      action={action}
      hiddenFields={
        <>
          {hiddenFields}
          <input type="hidden" name="body" value={draft.body} />
          <input type="hidden" name="mode" value={draft.mode} />
        </>
      }
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Keep editing
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Try again
          </Button>
        </>
      }
    >
      <div className="flex gap-3 bg-[#fde7e9] px-4 py-3.5 text-sm text-brand-dark">
        <Icon name="warning" size={16} className="mt-0.5" />
        <p>
          Your reply to {senderName} was not sent. Microsoft 365 did not accept it. Your text
          {attachmentCount > 0 ? ` and ${attachmentCount} ${attachmentCount === 1 ? "attachment" : "attachments"}` : ""} are still in the reply
          box.
        </p>
      </div>
      <p className="mt-4 text-[13px] text-ink-3">Status did not change. The mail is still {status} and yours.</p>
    </Modal>
  );
}
