import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface FilterChipProps {
  label: string;
  /** Link that removes this filter. */
  removeHref: string;
}

/** "Urgency: High ×" - click to remove. */
export default function FilterChip({ label, removeHref }: FilterChipProps) {
  return (
    <Link
      href={removeHref}
      title="Remove filter"
      className="inline-flex h-[30px] items-center gap-1.5 border border-line-control bg-card px-2.5 text-[12.5px] font-semibold"
    >
      {label}
      <Icon name="close" size={12} strokeWidth={2.4} className="text-ink-3" />
    </Link>
  );
}
