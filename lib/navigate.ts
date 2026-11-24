/** Client-side helpers for moving around without reloading the page. Plain functions, no hooks. */

interface AppRouter {
  push: (href: string) => void;
}

/** Go to an address like a link click would (no full page reload). Falls back to a normal page load. */
export function goTo(href: string) {
  const router = (window as unknown as { next?: { router?: AppRouter } }).next?.router;
  if (router) router.push(href);
  else window.location.assign(href);
}

/**
 * Hide a dialog or the drawer at once when the address we are going to no longer asks for it.
 * The server then finishes the job; the person does not wait for it to see the screen react.
 * Dialogs are marked data-overlay="dialog" (shown while the address has ?dialog=), the drawer data-overlay="drawer" (?mail=).
 */
export function fadeOutClosedOverlays(href: string) {
  const target = new URL(href, window.location.href);
  document.querySelectorAll<HTMLElement>("[data-overlay]").forEach((overlay) => {
    const key = overlay.dataset.overlay === "dialog" ? "dialog" : "mail";
    if (!target.searchParams.has(key)) overlay.setAttribute("data-closing", "");
  });
}
