"use client";

interface AutoRefreshProps {
  /** How often to refresh, in seconds. */
  everySeconds: number;
  /** Id of the hidden refresh button that gets pressed. */
  buttonId: string;
}

/**
 * Refreshes the page data on a timer by pressing a hidden refresh button, so typed text and open menus stay.
 * It waits while the tab is hidden, while a dialog or dropdown menu is open, and while you are typing in a field.
 * The timer is started and stopped by a ref callback (no hooks).
 */
export default function AutoRefresh({ everySeconds, buttonId }: AutoRefreshProps) {
  return (
    <span
      hidden
      ref={(element) => {
        if (!element) return;
        const timer = window.setInterval(() => {
          if (document.hidden) return;
          if (document.querySelector("[role=dialog], details.dropdown[open]")) return;
          const active = document.activeElement as HTMLInputElement | null;
          if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) && active.value) return;
          document.getElementById(buttonId)?.click();
        }, everySeconds * 1000);
        return () => window.clearInterval(timer);
      }}
    />
  );
}
