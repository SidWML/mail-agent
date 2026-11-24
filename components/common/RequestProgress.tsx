"use client";

import { fadeOutClosedOverlays } from "@/lib/navigate";

/**
 * Shows that a request is on its way: a thin red bar slides across the top of the screen,
 * and the button that was pressed shows a small spinner and cannot be pressed twice.
 * It starts on every form submit and every link to another address of this app, and stops
 * by itself when the new page arrives (the server gives this element a new key every time).
 */
function watchRequests(element: HTMLDivElement | null) {
  if (!element) return;
  const root = document.documentElement;
  let safetyTimer: number | undefined;

  const stop = () => {
    window.clearTimeout(safetyTimer);
    root.removeAttribute("data-busy");
    document.querySelectorAll("form[data-pending]").forEach((form) => form.removeAttribute("data-pending"));
    document.querySelectorAll("button[aria-busy]").forEach((button) => button.removeAttribute("aria-busy"));
    document.querySelectorAll("[data-closing]").forEach((overlay) => overlay.removeAttribute("data-closing"));
  };

  const start = () => {
    root.setAttribute("data-busy", "");
    window.clearTimeout(safetyTimer);
    // If nothing arrives (offline, for example) do not leave the screen locked.
    safetyTimer = window.setTimeout(stop, 20000);
  };

  const onSubmit = (event: SubmitEvent) => {
    // React has already called preventDefault for forms that run a server action, so that is not a reason to skip.
    // The refresh timer sends a silent form: no bar, no spinner.
    if (!(event.target instanceof HTMLFormElement) || event.target.hasAttribute("data-silent")) return;
    event.target.setAttribute("data-pending", "");
    event.submitter?.setAttribute("aria-busy", "true");
    start();
  };

  const onClick = (event: MouseEvent) => {
    // Next's Link has already called preventDefault here (it navigates by itself), so that is not a reason to skip.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    const isSameAddress = url.pathname === window.location.pathname && url.search === window.location.search;
    if (url.origin === window.location.origin && !isSameAddress) {
      fadeOutClosedOverlays(link.href);
      start();
    }
  };

  document.addEventListener("submit", onSubmit);
  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("submit", onSubmit);
    document.removeEventListener("click", onClick);
    stop();
  };
}

export default function RequestProgress() {
  return <div ref={watchRequests} className="request-progress" aria-hidden="true" />;
}
