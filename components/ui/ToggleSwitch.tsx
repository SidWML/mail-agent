interface ToggleSwitchProps {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

/** On/off switch with a title and one line of help. The checked look is pure CSS. */
export default function ToggleSwitch({ name, label, description, defaultChecked }: ToggleSwitchProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="flex h-5 w-9 shrink-0 items-center bg-line-control p-0.5 peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand [&>span]:translate-x-0 peer-checked:[&>span]:translate-x-4">
        <span className="size-4 bg-card transition-transform" />
      </span>
      <span>
        <span className="block text-[13.5px] font-semibold">{label}</span>
        <span className="mt-0.5 block text-[12.5px] text-ink-3">{description}</span>
      </span>
    </label>
  );
}
