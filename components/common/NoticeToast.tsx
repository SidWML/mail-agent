"use client";

import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Notice, NoticeTone } from "@/lib/notice";

const TONE_STYLES: Record<NoticeTone, { accent: string; soft: string; seconds: number }> = {
  success: { accent: "bg-ok", soft: "bg-[#e3f5ea] text-ok-dark", seconds: 4.8 },
  info: { accent: "bg-status-new-fg", soft: "bg-status-new-bg text-status-new-fg", seconds: 4.8 },
  // Problems stay a little longer so they can be read.
  error: { accent: "bg-brand", soft: "bg-brand-tint text-brand-dark", seconds: 8 },
};

/** The little round icon. The tick draws itself; the exclamation mark and "i" pop in. */
function ToastIcon({ tone }: { tone: NoticeTone }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {tone === "success" && <path className="toast-draw" d="M5 12.5l4.5 4.5L19 7.5" />}
      {tone === "error" && <path d="M12 6v7M12 17.5v.5" />}
      {tone === "info" && <path d="M12 11v6M12 7v.5" />}
    </svg>
  );
}

/**
 * The message shown after an action: slides in, ticks, counts down and slides out by itself.
 * Hover to pause it. When it has gone, the message is also removed from the address,
 * so a refresh does not show it again.
 */
export default function NoticeToast({ notice }: { notice: Notice }) {
  const style = TONE_STYLES[notice.tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[78px] z-60 flex justify-center px-4">
      <div
        role={notice.tone === "error" ? "alert" : "status"}
        className={cn(
          "toast pointer-events-auto relative w-[min(440px,100%)] overflow-hidden border border-line-control bg-card shadow-[0_14px_34px_rgba(0,0,0,0.2)]",
          notice.tone === "error" && "toast-error",
        )}
        style={{ "--toast-ms": `${style.seconds}s` } as CSSProperties}
        onAnimationEnd={(event) => {
          if (event.animationName === "toast-out") window.history.replaceState(null, "", notice.dismissHref);
        }}
      >
        <span className={cn("absolute inset-y-0 left-0 w-1", style.accent)} />
        <div className="flex items-start gap-3 py-3.5 pr-3 pl-5">
          <span className={cn("toast-icon mt-px flex size-8 shrink-0 items-center justify-center rounded-full", style.soft)}>
            <ToastIcon tone={notice.tone} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[14px] leading-tight font-semibold">{notice.title}</p>
            {notice.detail && <p className="mt-1 text-[13px] leading-snug text-ink-3">{notice.detail}</p>}
          </div>
          <button
            type="button"
            aria-label="Dismiss message"
            // Close it right here: the toast slides out, then its message is removed from the address.
            onClick={(event) => event.currentTarget.closest(".toast")?.setAttribute("data-closed", "")}
            className="-mr-0.5 cursor-pointer p-1 text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
        <span className={cn("toast-progress absolute bottom-0 left-0 h-[3px] w-full", style.accent)} />
      </div>
    </div>
  );
}
