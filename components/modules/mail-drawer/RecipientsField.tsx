import Icon from "@/components/ui/Icon";

interface RecipientChip {
  address: string;
  /** Short text in the tooltip, for example "kept from the original mail". */
  note?: string;
}

interface RecipientsFieldProps {
  label: "To" | "Cc";
  /** People who are always included and cannot be removed here. */
  fixed: RecipientChip[];
  /** People the person added. Each has a remove button. */
  removable: string[];
  /** Start of the remove button value, for example "remove-to" (the full value adds ":<index>"). */
  removeIntent: string;
  /** Name of the text box where the next address is typed. */
  inputName: string;
  placeholder: string;
}

const chipClassName = "inline-flex max-w-full items-center gap-1.5 border px-2 py-[3px] text-[12.5px]";

/**
 * One recipients line: chips for everyone included, and a box to add more.
 * Several addresses can be typed at once (comma, space or semicolon between them); press Enter to add.
 */
export default function RecipientsField({ label, fixed, removable, removeIntent, inputName, placeholder }: RecipientsFieldProps) {
  return (
    <div className="flex items-start gap-2.5 text-[13px] text-ink-3">
      <span className="w-6 shrink-0 pt-[5px]">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {fixed.map((chip) => (
          <span key={chip.address} title={chip.note} className={`${chipClassName} border-line-soft bg-stripe text-ink-2`}>
            {chip.address}
            {chip.note && <Icon name="lock" size={11} className="text-ink-faint" />}
          </span>
        ))}
        {removable.map((address, index) =>
          // Someone already included from the original mail is not shown a second time.
          fixed.some((chip) => chip.address.toLowerCase() === address.toLowerCase()) ? null : (
          <span key={address} className={`${chipClassName} border-[#d0d0d0] bg-[#fafafa] text-ink`}>
            <span className="truncate">{address}</span>
            <button
              type="submit"
              name="intent"
              value={`${removeIntent}:${index}`}
              aria-label={`Remove ${address}`}
              className="cursor-pointer text-ink-muted transition-colors duration-150 hover:text-brand-dark"
            >
              <Icon name="close" size={11} strokeWidth={2.6} />
            </button>
          </span>
          ),
        )}
        <input
          name={inputName}
          placeholder={placeholder}
          aria-label={`Add to ${label}`}
          autoComplete="off"
          className="min-w-[210px] flex-1 bg-transparent py-1 text-[13px] text-ink outline-none placeholder:text-[#8a8a8a]"
        />
      </div>
    </div>
  );
}
