import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatFileSize } from "@/lib/format";
import type { Attachment } from "@/types/mailbox";

const KIND_STYLES: Record<Attachment["kind"], { label: string; tile: string }> = {
  xlsx: { label: "XLS", tile: "bg-ok-bg text-ok-dark" },
  pdf: { label: "PDF", tile: "bg-brand-tint text-brand-dark" },
  png: { label: "PNG", tile: "bg-status-new-bg text-status-new-fg" },
  docx: { label: "DOC", tile: "bg-status-new-bg text-status-new-fg" },
};

interface AttachmentListProps {
  mailId: string;
  attachments: Attachment[];
  /** Builds the link that opens the preview. */
  getPreviewHref: (attachmentId: string) => string;
}

/** Attachments of one message: file tile, Preview, and a Download button (downloads are written to the audit log). */
export default function AttachmentList({ mailId, attachments, getPreviewHref }: AttachmentListProps) {
  if (attachments.length === 0) return null;
  const downloadHref = (attachmentId: string) => `/api/attachments/${mailId}/${attachmentId}?download=1`;

  return (
    <div className="mt-3.5">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-[12.5px] font-semibold">
          {attachments.length} {attachments.length === 1 ? "attachment" : "attachments"}
        </span>
        <Link href={getPreviewHref(attachments[0].id)} className="text-[12.5px] font-semibold text-brand">
          Download all
        </Link>
        <span className="text-xs text-ink-muted">Scanned by Defender · downloads are logged</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {attachments.map((attachment) => {
          const style = KIND_STYLES[attachment.kind];
          return (
            <div
              key={attachment.id}
              className="flex max-w-[340px] min-w-0 flex-[1_1_260px] items-center gap-2.5 border border-[#e0e0e0] bg-[#fafafa] px-3 py-2.5"
            >
              <span className={`flex h-10 w-9 shrink-0 items-center justify-center text-[11px] font-bold ${style.tile}`}>
                {style.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{attachment.name}</span>
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  {formatFileSize(attachment.size)} ·
                  <Icon name="check" size={12} strokeWidth={2.5} className="text-ok-dark" />
                  Scanned
                </span>
              </span>
              <Link href={getPreviewHref(attachment.id)} className="text-[12.5px] font-semibold text-brand">
                Preview
              </Link>
              <a
                href={downloadHref(attachment.id)}
                aria-label={`Download ${attachment.name}`}
                title="Download"
                className="flex size-[30px] shrink-0 items-center justify-center border border-line-control bg-card"
              >
                <Icon name="download" size={14} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
