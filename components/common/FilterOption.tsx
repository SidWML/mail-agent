import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";

interface FilterOptionProps {
  /** "checkbox" lets you pick several, "radio" lets you pick one. */
  type: "checkbox" | "radio";
  name: string;
  value: string;
  checked: boolean;
  label: string;
  /** Icon or other content before the label. */
  leading?: ReactNode;
  /** Number of mails with this option. */
  count?: number;
}

/** One row in a filter menu. The tick, the round dot and the pink highlight are all CSS. */
export default function FilterOption({ type, name, value, checked, label, leading, count }: FilterOptionProps) {
  const isCheckbox = type === "checkbox";
  return (
    <label className="flex h-[34px] cursor-pointer items-center gap-2.5 border-t border-[#f0f0f0] bg-card px-3.5 text-[13.5px] font-medium transition-colors duration-150 ease-out hover:bg-stripe has-checked:bg-brand-tint-soft has-checked:font-semibold">
      <input type={type} name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span
        className={`flex size-4 shrink-0 items-center justify-center border-[1.5px] border-ink-faint bg-card peer-checked:border-brand ${
          isCheckbox
            ? "peer-checked:bg-brand [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
            : "rounded-full [&>span]:opacity-0 peer-checked:[&>span]:opacity-100"
        }`}
      >
        {isCheckbox ? (
          <Icon name="check" size={11} strokeWidth={3} className="text-white" />
        ) : (
          <span className="size-2 rounded-full bg-brand" />
        )}
      </span>
      {leading}
      <span>{label}</span>
      {count !== undefined && <span className="ml-auto text-xs font-normal text-ink-muted">{count}</span>}
    </label>
  );
}
