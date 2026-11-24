"use client";

interface ReplyTextBoxProps {
  mailId: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}

/**
 * The reply text area. While you type it tells the server "I am replying", so teammates see
 * "X is replying" (at most once every 5 seconds). Plain event handler, no state.
 */
export default function ReplyTextBox({ mailId, name, defaultValue, placeholder }: ReplyTextBoxProps) {
  return (
    <textarea
      id="reply-text"
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="min-h-[180px] w-full resize-y border border-[#d0d0d0] p-3.5 text-sm leading-[1.65] text-[#2a2a2a] outline-none focus:border-brand"
      onInput={(event) => {
        const box = event.currentTarget;
        const lastPing = Number(box.dataset.lastPing ?? 0);
        if (Date.now() - lastPing < 5000) return;
        box.dataset.lastPing = String(Date.now());
        fetch("/api/presence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mailId, replying: true }),
        });
      }}
    />
  );
}
