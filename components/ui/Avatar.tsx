import { cn } from "@/lib/cn";

interface AvatarProps {
  initials: string;
  size?: "small" | "large";
}

/** Dark square with initials. small = 24px (table owner), large = 36px (header user). */
export default function Avatar({ initials, size = "small" }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-ink font-semibold text-white",
        size === "small" ? "size-6 text-[10px]" : "size-9 text-[15px]",
      )}
    >
      {initials}
    </span>
  );
}
