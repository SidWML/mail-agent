import { CATEGORY_ICONS } from "@/lib/icons";
import Icon from "./Icon";

interface CategoryTagProps {
  name: string;
  /** Bigger version used in the mail drawer. */
  large?: boolean;
}

/** Category name with its red icon. "Needs review" is amber. */
export default function CategoryTag({ name, large = false }: CategoryTagProps) {
  const needsReview = name === "Needs review";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] font-medium ${
        large ? "py-[5px] pr-[11px] pl-[9px] text-[13px]" : "py-1 pr-[9px] pl-[7px] text-[12.5px]"
      } ${needsReview ? "bg-status-progress-bg text-status-progress-fg" : "bg-page"}`}
    >
      <Icon name={CATEGORY_ICONS[name] ?? "tag"} size={14} strokeWidth={1.9} className={needsReview ? "" : "text-brand"} />
      {name}
    </span>
  );
}
