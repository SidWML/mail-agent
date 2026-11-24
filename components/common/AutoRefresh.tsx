"use client";

interface AutoRefreshProps {
  /** How often to refresh, in seconds. */
  everySeconds: number;
  /** Id of the refresh link (a link to the current address) that gets pressed. */
  linkId: string;
}

/**
 * Refreshes the page data on a timer by pressing the page's own refresh link, so typed text and open menus stay.
 * It waits while the tab is hidden, while a dialog or menu is open, and while you are typing in a field.
 * The timer is started and stopped by a ref callback (no hooks).
 */
export default function AutoRefresh({ everySeconds, linkId }: AutoRefreshProps) {
  return (
    <span
      hidden
      ref={(element) => {
        if (!element) return;
        const timer = window.setInterval(() => {
          if (document.hidden) return;
          if (document.querySelector("[role=dialog], details[open]")) return;
          const active = document.activeElement as HTMLInputElement | null;
          if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) && active.value) return;
          document.getElementById(linkId)?.click();
        }, everySeconds * 1000);
        return () => window.clearInterval(timer);
      }}
    />
  );
}
