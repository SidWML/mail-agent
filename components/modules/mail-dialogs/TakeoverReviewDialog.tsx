import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/FormField";
import { getInitials } from "@/lib/format";
import type { TakeoverRequest } from "@/types/mailbox";
import MailSummaryBox from "./MailSummaryBox";

interface TakeoverReviewDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  request: TakeoverRequest;
  subject: string;
  /** True when the person reading this is the current owner of the mail. */
  isOwnerOfMail: boolean;
}

/** The owner (or the Platform Owner) approves or declines a takeover request. */
export default function TakeoverReviewDialog({ action, hiddenFields, closeHref, request, subject, isOwnerOfMail }: TakeoverReviewDialogProps) {
  return (
    <Modal
      title="Takeover request"
      subtitle={isOwnerOfMail ? "Someone asked for a mail you own." : "Someone asked for a mail owned by a teammate."}
      closeHref={closeHref}
      action={action}
      hiddenFields={
        <>
          {hiddenFields}
          <input type="hidden" name="requestId" value={request.id} />
        </>
      }
      footer={
        <>
          <Button type="submit" name="decision" value="decline" variant="neutral" large>
            Decline
          </Button>
          <Button type="submit" name="decision" value="approve" variant="primary" large>
            Approve and hand over
          </Button>
        </>
      }
    >
      <MailSummaryBox
        leading={<Avatar initials={getInitials(request.byName)} size="large" />}
        title={`${request.byName} asks to take over this mail`}
        text={`${subject}${isOwnerOfMail ? " · you are the owner" : ""}`}
      />
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[13px] font-semibold">Their reason</span>
        <TextArea value={request.reason} readOnly className="min-h-[60px]" />
      </label>
      <p className="mt-4 text-[12.5px] text-ink-3">
        If you approve, {request.byName} becomes the owner{isOwnerOfMail ? " and you are locked out of replying" : ""}. The Platform Owner can also
        reassign this mail at any time.
      </p>
    </Modal>
  );
}
