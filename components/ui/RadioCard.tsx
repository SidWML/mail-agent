interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  required?: boolean;
}

/** A big bordered radio choice (title + one line), as in the "Mark as acted" dialog. Highlight is pure CSS. */
export default function RadioCard({ name, value, label, description, defaultChecked, required }: RadioCardProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line-control bg-card px-3.5 py-3 has-checked:border-brand has-checked:bg-brand-tint-soft">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} required={required} className="peer sr-only" />
      <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-ink-faint peer-checked:border-brand [&>span]:opacity-0 peer-checked:[&>span]:opacity-100">
        <span className="size-2 rounded-full bg-brand" />
      </span>
      <span>
        <span className="block text-[13.5px] font-semibold">{label}</span>
        {description && <span className="block text-[12.5px] text-ink-3">{description}</span>}
      </span>
    </label>
  );
}
