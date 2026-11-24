import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface FilterMenuProps {
  /** Text on the button. */
  label: string;
  /** Small count chip on the button, for example the Needs review number. */
  badge?: number;
  /** Icon before the label (the filter icon on "More filters"). */
  leadingIcon?: boolean;
  /** Hide the chevron and bold the label (the Sort button). */
  emphasized?: boolean;
  /** Hide the chevron only (the Custom button on the Dashboard). */
  hideChevron?: boolean;
  /** Paint the button red, for a choice that is currently on (Custom range on the Dashboard). */
  highlighted?: boolean;
  title: string;
  subtitle: string;
  /** Page the form sends to, for example "/inbox". */
  action: string | ((formData: FormData) => void | Promise<void>);
  /** Other current query values, kept when this menu is applied. */
  keptFields: Array<[string, string]>;
  clearHref: string;
  widthClass?: string;
  /** Open to the right edge of the button instead of the left. */
  alignRight?: boolean;
  children: ReactNode;
}

/**
 * A button that opens a menu with options and Clear / Apply.
 * Built from <details> and a GET form, so it works without client JavaScript.
 */
export default function FilterMenu({
  label,
  badge,
  leadingIcon,
  emphasized,
  hideChevron,
  highlighted,
  title,
  subtitle,
  action,
  keptFields,
  clearHref,
  widthClass = "w-[240px]",
  alignRight,
  children,
}: FilterMenuProps) {
  return (
    <details name="filter-menu" className="dropdown relative">
      <summary
        className={cn(
          "inline-flex h-10 items-center gap-2 border px-3 text-[13px]",
          highlighted ? "border-brand bg-brand text-white" : "border-line-input bg-card",
          emphasized || highlighted ? "font-semibold" : "font-medium",
        )}
      >
        {leadingIcon && <Icon name="filter" size={14} />}
        {label}
        {badge !== undefined && (
          <span className="bg-status-progress-bg px-1.5 py-px text-xs font-semibold text-status-progress-fg">{badge}</span>
        )}
        {!leadingIcon && !hideChevron && badge === undefined && <Icon name="chevronDown" size={12} strokeWidth={2.5} />}
      </summary>

      <form
        action={action}
        className={cn(
          "absolute top-[calc(100%+4px)] border border-line-control border-t-2 border-t-brand bg-card shadow-[0_6px_18px_rgba(0,0,0,0.1)]",
          alignRight ? "right-0" : "left-0",
          widthClass,
        )}
      >
        {keptFields.map(([name, value]) => (
          <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
        ))}

        <div className="px-3.5 pt-3 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{title}</p>
          <p className="mt-[3px] text-xs text-ink-muted">{subtitle}</p>
        </div>

        {children}

        <div className="flex items-center justify-between border-t border-line-soft bg-stripe px-3.5 py-2.5">
          <Link href={clearHref} className="text-[12.5px] font-semibold text-ink-3">
            Clear
          </Link>
          <button type="submit" className="h-[30px] cursor-pointer bg-brand px-4 text-[12.5px] font-semibold text-white">
            Apply
          </button>
        </div>
      </form>
    </details>
  );
}
