import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import EscapeKey from "./EscapeKey";

interface ModalProps {
  title: string;
  subtitle?: string;
  /** Where the X, the dark backdrop, Cancel and Escape go. */
  closeHref: string;
  /** Panel width in pixels. */
  width?: number;
  /** Buttons for the grey bar at the bottom. Leave out for a dialog without one. */
  footer?: ReactNode;
  /** Server action to run when the dialog is submitted. The body and the footer are then one form. */
  action?: (formData: FormData) => void | Promise<void>;
  /** Hidden inputs for the form (only used together with `action`). */
  hiddenFields?: ReactNode;
  children?: ReactNode;
}

/**
 * Centered dialog on a dark backdrop. It is opened by the address (for example ?dialog=delete),
 * so it is rendered by the server and closed with a link.
 */
export default function Modal({
  title,
  subtitle,
  closeHref,
  width = 600,
  footer,
  action,
  hiddenFields,
  children,
}: ModalProps) {
  const content = (
    <>
      {hiddenFields}
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-7 pt-5", footer ? "pb-6" : "pb-7")}>{children}</div>
      {footer && (
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line-soft bg-stripe px-7 py-4">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <EscapeKey closeHref={closeHref} dataOverlay="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Link href={closeHref} aria-label="Close" className="animate-fade absolute inset-0 bg-[rgba(26,26,28,0.52)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className="animate-modal relative flex max-h-[92vh] max-w-full flex-col bg-card shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-7">
          <div>
            <h2 className="text-[20px] leading-[1.25] font-semibold">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-ink-3">{subtitle}</p>}
          </div>
          <Link href={closeHref} aria-label="Close" className="p-1 text-ink-3">
            <Icon name="close" size={18} />
          </Link>
        </div>

        {action ? (
          <form action={action} className="flex min-h-0 flex-1 flex-col">
            {content}
          </form>
        ) : (
          content
        )}
      </div>
    </EscapeKey>
  );
}
