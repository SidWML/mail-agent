import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Avatar from "@/components/ui/Avatar";
import Button, { ButtonLink } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/FormField";
import { getInitials } from "@/lib/format";
import MailSummaryBox from "./MailSummaryBox";

interface TakeoverRequestDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  ownerName: string;
  subject: string;
}

/** A team member asks the owner to hand a locked mail over. */
export default function TakeoverRequestDialog({ action, hiddenFields, closeHref, ownerName, subject }: TakeoverRequestDialogProps) {
  return (
    <Modal
      title="Request takeover"
      subtitle="Ask the owner (or the Platform Owner) to hand this mail to you."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Send request
          </Button>
        </>
      }
    >
      <MailSummaryBox leading={<Avatar initials={getInitials(ownerName)} size="large" />} title={`${ownerName} owns this mail`} text={subject} />
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[13px] font-semibold">Why do you want to take it over?</span>
        <TextArea
          name="reason"
          required
          placeholder={`For example: ${ownerName.split(" ")[0]} is out of office this week.`}
          className="min-h-[90px]"
        />
      </label>
    </Modal>
  );
}
