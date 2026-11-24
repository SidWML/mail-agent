import Modal from "@/components/common/Modal";
import { ButtonLink } from "@/components/ui/Button";
import { daysSince } from "@/lib/format";
import type { MailDetail } from "@/types/api";

interface RestoreExpiredDialogProps {
  closeHref: string;
  mail: MailDetail;
}

/** The 30-day restore window has ended. */
export default function RestoreExpiredDialog({ closeHref, mail }: RestoreExpiredDialogProps) {
  const daysAgo = mail.deletedAt ? daysSince(mail.deletedAt) : 30;
  return (
    <Modal
      title="Cannot restore this mail"
      subtitle={`${mail.sender} · ${mail.subject}`}
      closeHref={closeHref}
      footer={
        <ButtonLink href={closeHref} variant="primary" large>
          Close
        </ButtonLink>
      }
    >
      <p className="text-sm leading-[1.5]">
        This mail was deleted {daysAgo} days ago. The 30-day restore window has ended. From now on it follows the Exchange retention policy.
      </p>
      <p className="mt-3 text-[12.5px] text-ink-3">If this mail is still needed, ask the mailbox team to recover it in Exchange.</p>
    </Modal>
  );
}
