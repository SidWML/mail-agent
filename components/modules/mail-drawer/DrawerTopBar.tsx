import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface DrawerTopBarProps {
  closeHref: string;
  previousHref?: string;
  nextHref?: string;
  /** "Mail 2 of 47 · Active" */
  positionLabel: string;
  /** Opens the list of keyboard shortcuts. */
  shortcutsHref: string;
}

const squareClassName = "flex size-9 items-center justify-center border border-line-control bg-card";

export default function DrawerTopBar({ closeHref, previousHref, nextHref, positionLabel, shortcutsHref }: DrawerTopBarProps) {
  return (
    <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-line-soft bg-card px-5">
      <Link href={closeHref} aria-label="Close" title="Close (Esc)" className={squareClassName}>
        <Icon name="close" size={18} strokeWidth={2.2} />
      </Link>

      <span className="flex gap-1">
        {previousHref ? (
          <Link href={previousHref} aria-label="Previous mail" className={squareClassName}>
            <Icon name="chevronLeft" size={16} />
          </Link>
        ) : (
          <span className={`${squareClassName} text-ink-faint`}>
            <Icon name="chevronLeft" size={16} />
          </span>
        )}
        {nextHref ? (
          <Link href={nextHref} aria-label="Next mail" className={squareClassName}>
            <Icon name="chevronRight" size={16} />
          </Link>
        ) : (
          <span className={`${squareClassName} text-ink-faint`}>
            <Icon name="chevronRight" size={16} />
          </span>
        )}
      </span>

      <span className="text-[13px] text-ink-3">{positionLabel}</span>
      <Link href={shortcutsHref} className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-ink-3" title="Keyboard shortcuts (?)">
        <Icon name="keyboard" size={14} />
        Shortcuts
        <kbd className="border border-line-control bg-stripe px-1.5 text-[11px]">?</kbd>
      </Link>
      <span className="text-xs text-ink-muted">Closing returns you to the list exactly where you were</span>
    </div>
  );
}
