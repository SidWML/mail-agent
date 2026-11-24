import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: IconName;
  /** Success (green tick) or neutral (grey). */
  tone?: "neutral" | "success";
  title: string;
  message: string;
  /** Chips, buttons or links under the message. */
  children?: ReactNode;
}

export default function EmptyState({ icon, tone = "neutral", title, message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 border-t border-line-strong px-6 py-16 text-center">
      <span
        className={cn(
          "flex size-[72px] items-center justify-center",
          tone === "success" ? "bg-ok-bg text-ok-dark" : "bg-page text-ink-muted",
        )}
      >
        <Icon name={icon} size={34} />
      </span>
      <p className="text-[22px] font-light">{title}</p>
      <p className="max-w-[420px] text-sm leading-[1.55] text-ink-3">{message}</p>
      {children}
    </div>
  );
}
