"use client";

interface SelectAllCheckboxProps {
  /** The name of the row checkboxes this one controls. */
  targetName: string;
}

/** Ticks or clears every row checkbox on the page. Plain event handler, no state. */
export default function SelectAllCheckbox({ targetName }: SelectAllCheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label="Select all mails"
      className="m-0 size-[15px] accent-brand"
      onChange={(event) => {
        const checked = event.currentTarget.checked;
        document.querySelectorAll<HTMLInputElement>(`input[name="${targetName}"]`).forEach((box) => {
          box.checked = checked;
        });
      }}
    />
  );
}
