import Modal from "@/components/common/Modal";
import Avatar from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { getInitials } from "@/lib/format";
import type { MailDetail } from "@/types/api";
import MailSummaryBox from "./MailSummaryBox";

interface ClaimConflictDialogProps {
  closeHref: string;
  openMailHref: string;
  /** The mail as it is now (already owned by someone else). */
  mail: MailDetail;
}

/** Two people pressed "Take it": the second one sees who got there first. */
export default function ClaimConflictDialog({ closeHref, openMailHref, mail }: ClaimConflictDialogProps) {
  const ownerName = mail.ownerName ?? "Someone";
  return (
    <Modal
      title="Someone took this mail first"
      subtitle="Your view has been updated, so nobody answers the same mail twice."
      closeHref={closeHref}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Back to list
          </ButtonLink>
          <ButtonLink href={openMailHref} variant="primary" large>
            Open mail
          </ButtonLink>
        </>
      }
    >
      <div className="flex gap-3 bg-status-progress-bg px-4 py-3.5 text-sm text-status-progress-fg">
        <Icon name="warning" size={16} className="mt-0.5" />
        <p>{ownerName} took this mail before you. Only one person can own a mail.</p>
      </div>
      <div className="mt-4">
        <MailSummaryBox
          leading={<Avatar initials={getInitials(ownerName)} size="large" />}
          title={mail.subject}
          text={`Now owned by ${ownerName} · ${mail.status}`}
        />
      </div>
    </Modal>
  );
}
