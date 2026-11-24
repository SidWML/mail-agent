import { addInternalNote } from "@/actions/mail-actions";
import ActionFields from "@/components/common/ActionFields";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/FormField";

interface NoteBoxProps {
  mailId: string;
  version: number;
  returnTo: string;
}

/** "Add an internal note" box for people who cannot reply (the mail is owned by someone else). */
export default function NoteBox({ mailId, version, returnTo }: NoteBoxProps) {
  return (
    <form action={addInternalNote} className="border border-[#e6e6e6] bg-card px-6 py-5">
      <ActionFields mailId={mailId} version={version} returnTo={returnTo} />
      <label htmlFor="internal-note" className="block text-sm font-semibold">
        Add an internal note
      </label>
      <TextArea
        id="internal-note"
        name="text"
        placeholder="Visible only to the team. Never sent to the sender."
        className="mt-3 min-h-24 text-sm"
      />
      <Button type="submit" variant="neutral" large className="mt-3">
        Add note
      </Button>
    </form>
  );
}
