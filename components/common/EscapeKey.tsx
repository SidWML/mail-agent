"use client";

import type { ReactNode } from "react";
import { fadeOutClosedOverlays, goTo } from "@/lib/navigate";

interface EscapeKeyProps {
  /** Where to go when Escape is pressed. */
  closeHref: string;
  /**
   * Extra keys. Each value is an address to open, "click:<css selector>" to press a button,
   * or "focus:<css selector>" to move the cursor to a field. Keys are ignored while typing in a field.
   */
  shortcuts?: Record<string, string>;
  /** "dialog" or "drawer": lets it fade out the moment it is closed (see lib/navigate.ts). */
  dataOverlay?: "dialog" | "drawer";
  className?: string;
  children: ReactNode;
}

/** Wrapper that takes focus, closes on Escape, and runs keyboard shortcuts. Plain event handlers, no state. */
export default function EscapeKey({ closeHref, shortcuts, dataOverlay, className, children }: EscapeKeyProps) {
  return (
    <div
      data-overlay={dataOverlay}
      tabIndex={-1}
      className={`outline-none ${className ?? ""}`}
      ref={(element) => {
        // Focus the wrapper once, unless something inside already has focus (an autofocus field).
        if (element && !element.contains(document.activeElement)) element.focus({ preventScroll: true });
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          fadeOutClosedOverlays(closeHref);
          goTo(closeHref);
          return;
        }
        if (!shortcuts || event.ctrlKey || event.metaKey || event.altKey) return;
        const target = event.target as HTMLElement;
        if (target.closest("input, textarea, select, [contenteditable='true']")) return;

        const action = shortcuts[event.key] ?? shortcuts[event.key.toLowerCase()];
        if (!action) return;
        event.preventDefault();
        if (action.startsWith("click:")) document.querySelector<HTMLElement>(action.slice(6))?.click();
        else if (action.startsWith("focus:")) document.querySelector<HTMLElement>(action.slice(6))?.focus();
        else {
          fadeOutClosedOverlays(action);
          goTo(action);
        }
      }}
    >
      {children}
    </div>
  );
}
