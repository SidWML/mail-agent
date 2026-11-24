import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/FormField";
import RadioCard from "@/components/ui/RadioCard";
import { OUTCOMES } from "@/types/mailbox";

const OUTCOME_HINTS: Record<(typeof OUTCOMES)[number], string> = {
  Answered: "You replied to the sender.",
  Forwarded: "Passed to another team or person.",
  "No action needed": "Information only; nothing to do.",
  Duplicate: "Same request as another mail.",
  Spam: "Unwanted or unsolicited mail.",
};

interface ActedDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  /** Number of mails when used from the bulk bar. */
  bulkCount?: number;
  /** Outcome that is ticked when the dialog opens (for example "Duplicate" from the duplicate suggestion). */
  defaultOutcome?: string;
}

/** "Mark as acted": pick how the mail was handled, add an optional note. */
export default function ActedDialog({ action, hiddenFields, closeHref, bulkCount, defaultOutcome = "Answered" }: ActedDialogProps) {
  const subtitle = bulkCount
    ? `Choose how these ${bulkCount} mails were handled. They move to Acted / Closed and leave the Active view.`
    : "Choose how this mail was handled. It moves to Acted / Closed and leaves the Active view.";
  return (
    <Modal
      title={bulkCount ? `Mark ${bulkCount} mails as acted` : "Mark as acted"}
      subtitle={subtitle}
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="successSolid" large>
            Mark as acted
          </Button>
        </>
      }
    >
      <p className="mb-2 text-[13px] font-semibold">
        Outcome <span className="text-brand">*</span>
      </p>
      <div className="flex flex-col gap-2">
        {OUTCOMES.map((outcome) => (
          <RadioCard
            key={outcome}
            name="outcome"
            value={outcome}
            label={outcome}
            description={OUTCOME_HINTS[outcome]}
            defaultChecked={outcome === defaultOutcome}
          />
        ))}
      </div>
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[13px] font-semibold">Note (optional)</span>
        <TextArea name="note" placeholder="Add a short note for the team" />
      </label>
    </Modal>
  );
}
