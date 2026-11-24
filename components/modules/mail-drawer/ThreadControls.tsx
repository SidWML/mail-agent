"use client";

/** "Expand all / Collapse all" for the messages of a conversation. Plain click handlers, no state. */
export default function ThreadControls() {
  const setAll = (open: boolean) =>
    document.querySelectorAll<HTMLDetailsElement>("details[data-thread-message]").forEach((message) => {
      message.open = open;
    });
  const buttonClassName = "cursor-pointer text-xs font-semibold text-brand transition-opacity duration-150 hover:opacity-75";

  return (
    <span className="flex items-center gap-3">
      <button type="button" className={buttonClassName} onClick={() => setAll(true)}>
        Expand all
      </button>
      <button type="button" className={buttonClassName} onClick={() => setAll(false)}>
        Collapse all
      </button>
    </span>
  );
}
