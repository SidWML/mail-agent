import Modal from "@/components/common/Modal";
import { ButtonLink } from "@/components/ui/Button";

const SHORTCUTS: Array<{ keys: string[]; text: string }> = [
  { keys: ["J", "→"], text: "Next mail in the list" },
  { keys: ["K", "←"], text: "Previous mail in the list" },
  { keys: ["C"], text: "Claim the mail (Take it)" },
  { keys: ["R"], text: "Reply: jump to the reply box" },
  { keys: ["A"], text: "Mark as acted" },
  { keys: ["F"], text: "Forward" },
  { keys: ["G"], text: "Change category" },
  { keys: ["D"], text: "Delete (Platform Owner)" },
  { keys: ["?"], text: "Show this list" },
  { keys: ["Esc"], text: "Close the dialog or the mail and go back to the list" },
];

/** Keys that work while a mail is open. Only the ones you are allowed to use do anything. */
export default function ShortcutsDialog({ closeHref }: { closeHref: string }) {
  return (
    <Modal
      title="Keyboard shortcuts"
      subtitle="Work through the queue without the mouse. Shortcuts are paused while you type in a field."
      closeHref={closeHref}
      footer={
        <ButtonLink href={closeHref} variant="primary" large>
          Close
        </ButtonLink>
      }
    >
      <ul className="border border-line-soft">
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.text} className="flex items-center gap-3 border-t border-line-soft px-3.5 py-2.5 text-[13.5px] first:border-t-0">
            <span className="flex gap-1.5">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="min-w-7 border border-line-control bg-stripe px-2 py-0.5 text-center text-xs font-semibold shadow-[0_1px_0_#c9cbd0]">
                  {key}
                </kbd>
              ))}
            </span>
            <span className="text-ink-2">{shortcut.text}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
