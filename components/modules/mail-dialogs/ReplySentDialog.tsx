import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import RadioCard from "@/components/ui/RadioCard";
import type { Status } from "@/types/mailbox";

interface ReplySentDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  /** "Sent as ai@schindler.com to Markus Weber" */
  confirmation: string;
  /** Status the mail has right now (preselected). */
  currentStatus: Status;
}

/** After sending: choose what happens to the mail next, so the queue stays accurate. */
export default function ReplySentDialog({ action, hiddenFields, closeHref, confirmation, currentStatus }: ReplySentDialogProps) {
  const preselected = currentStatus === "Waiting on sender" ? "Waiting on sender" : "In progress";
  return (
    <Modal
      title="Reply sent"
      subtitle="Pick the next status so the queue stays accurate."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <Button type="submit" name="quick" value="In progress" variant="neutral" large formNoValidate>
            Keep In progress
          </Button>
          <Button type="submit" variant="primary" large>
            Apply
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-2.5 bg-ok-bg px-3.5 py-2.5 text-[13.5px] font-semibold text-ok-dark">
        <Icon name="check" size={15} strokeWidth={2.5} />
        {confirmation}
      </div>
      <p className="mt-4 mb-2 text-[13px] font-semibold">What happens to this mail next?</p>
      <div className="flex flex-col gap-2">
        <RadioCard
          name="nextStatus"
          value="Waiting on sender"
          label="Waiting on sender"
          description="We expect an answer. If the sender replies, the mail returns to In progress automatically."
          defaultChecked={preselected === "Waiting on sender"}
        />
        <RadioCard name="nextStatus" value="acted" label="Mark as acted" description="Nothing more to do. Choose an outcome and close it." />
        <RadioCard
          name="nextStatus"
          value="In progress"
          label="Keep In progress"
          description="You will do more work on this mail."
          defaultChecked={preselected === "In progress"}
        />
      </div>
    </Modal>
  );
}
