import Link from "next/link";
import EscapeKey from "@/components/common/EscapeKey";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/format";
import type { MailDetail } from "@/types/api";
import type { Attachment } from "@/types/mailbox";
import DownloadAllButton from "./DownloadAllButton";

const KIND_STYLES: Record<Attachment["kind"], { label: string; tile: string }> = {
  xlsx: { label: "XLS", tile: "bg-ok-bg text-ok-dark" },
  pdf: { label: "PDF", tile: "bg-brand-tint text-brand-dark" },
  png: { label: "PNG", tile: "bg-status-new-bg text-status-new-fg" },
  docx: { label: "DOC", tile: "bg-status-new-bg text-status-new-fg" },
};

interface AttachmentPreviewProps {
  mail: MailDetail;
  attachmentId: string;
  closeHref: string;
  getPreviewHref: (attachmentId: string) => string;
}

/** Full-screen dark viewer with the mail's attachments on the left. The page itself is a stand-in (no real files here). */
export default function AttachmentPreview({ mail, attachmentId, closeHref, getPreviewHref }: AttachmentPreviewProps) {
  const attachments = mail.thread.flatMap((message) => message.attachments);
  const current = attachments.find((attachment) => attachment.id === attachmentId) ?? attachments[0];
  if (!current) return null;
  const position = attachments.indexOf(current) + 1;
  const sender = mail.thread.find((message) => message.attachments.some((attachment) => attachment.id === current.id))?.author;
  const buttonClassName =
    "inline-flex h-9 items-center gap-2 border border-[#4a4c52] bg-[#2b2d31] px-3.5 text-[13px] font-semibold text-white";

  return (
    <EscapeKey closeHref={closeHref} className="animate-fade fixed inset-0 z-[55] flex flex-col bg-[#2b2d31] text-white">
      <div className="flex min-h-[60px] shrink-0 items-center gap-4 border-b border-[#3a3c42] bg-[#1a1a1c] px-5">
        <Link href={closeHref} aria-label="Close preview" className="flex size-9 items-center justify-center border border-[#4a4c52]">
          <Icon name="close" size={18} />
        </Link>
        <div className="mr-auto min-w-0">
          <p className="truncate text-[15px] font-semibold">{current.name}</p>
          <p className="text-xs text-[#bdbdbd]">
            From {sender} · {position} of {attachments.length} attachments · {formatFileSize(current.size)}
          </p>
        </div>
        <span className="text-[13px] text-[#9a9da4]">Page 1 of 4</span>
        <a
          href={`/api/attachments/${mail.id}/${current.id}?download=1`}
          className="inline-flex h-9 items-center gap-2 border border-brand bg-brand px-3.5 text-[13px] font-semibold text-white"
        >
          <Icon name="download" size={14} />
          Download
        </a>
        <DownloadAllButton
          className={`${buttonClassName} cursor-pointer`}
          urls={attachments.map((attachment) => `/api/attachments/${mail.id}/${attachment.id}?download=1`)}
        />
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-[300px] shrink-0 overflow-y-auto border-r border-[#3a3c42] bg-[#1a1a1c] p-[18px]">
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#9a9da4] uppercase">Attachments in this mail</p>
          <div className="flex flex-col gap-2.5">
            {attachments.map((attachment) => {
              const style = KIND_STYLES[attachment.kind];
              return (
                <Link
                  key={attachment.id}
                  href={getPreviewHref(attachment.id)}
                  className={cn(
                    "flex items-center gap-3 border bg-[#232427] px-3 py-3",
                    attachment.id === current.id ? "border-brand bg-[#2b2d31]" : "border-[#3a3c42]",
                  )}
                >
                  <span className={`flex h-9 w-8 shrink-0 items-center justify-center text-[10px] font-bold ${style.tile}`}>
                    {style.label}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{attachment.name}</span>
                    <span className="block text-xs text-[#bdbdbd]">{formatFileSize(attachment.size)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-[1.5] text-[#bdbdbd]">
            <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[#3ac36e]" />
            Scanned by Defender for Office: no threats found. Every download is written to the audit log.
          </p>
        </div>

        <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
          <div className="min-h-[700px] w-[560px] bg-white p-12 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <div className="h-3.5 w-1/2 bg-[#c9cbd0]" />
            <div className="mt-8 flex flex-col gap-3">
              {[95, 88, 98, 70, 92, 80, 60, 96, 86, 72, 94, 55, 90, 97, 78].map((width, index) => (
                <div key={index} className="h-2.5 bg-[#e6e7ea]" style={{ width: `${width}%` }} />
              ))}
            </div>
            <div className="mt-8 h-[110px] bg-[#eff0f2]" />
          </div>
        </div>
      </div>
    </EscapeKey>
  );
}
