import { ICON_PATHS, type IconName } from "@/lib/icons";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Fill the shape instead of drawing an outline (used by the AI sparkle). */
  filled?: boolean;
  className?: string;
}

/** Draws one icon in the current text colour. */
export default function Icon({ name, size = 16, strokeWidth = 2, filled = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className ?? ""}`}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
