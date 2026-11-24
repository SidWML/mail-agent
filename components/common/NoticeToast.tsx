import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Notice } from "@/lib/notice";

/** Short result message shown after an action ("Mail marked as acted"). Click the X to dismiss. */
export default function NoticeToast({ notice }: { notice: Notice }) {
  const isError = notice.tone === "error";
  return (
    <div
      role="status"
      className={cn(
        "animate-toast fixed bottom-6 left-1/2 z-[60] flex max-w-[560px] -translate-x-1/2 items-center gap-3 px-4 py-3 text-[13.5px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
        isError ? "bg-brand-dark" : "bg-bar-dark",
      )}
    >
      <Icon name={isError ? "warning" : "check"} size={16} />
      <span>{notice.message}</span>
      <Link href={notice.dismissHref} aria-label="Dismiss" className="ml-2 text-white/70">
        <Icon name="close" size={14} />
      </Link>
    </div>
  );
}
