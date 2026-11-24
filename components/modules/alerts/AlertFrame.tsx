import type { ReactNode } from "react";

/** The white card all alerts share (660px wide on the screens). */
export default function AlertFrame({ children }: { children: ReactNode }) {
  return (
    <article className="w-[660px] max-w-full border border-line-strong bg-card shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
      {children}
    </article>
  );
}
