"use client";

import type { ReactNode } from "react";

/** Opens the browser's print dialog ("Save as PDF" is one of its choices). A plain click handler, no state. */
export default function PrintButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {children}
    </button>
  );
}
