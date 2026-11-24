import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatFileSize } from "@/lib/format";
import type { DraftAttachment } from "@/services/reply-draft";

const KIND_LABELS: Record<DraftAttachment["kind"], { label: string; tile: string }> = {
  pdf: { label: "PDF", tile: "bg-brand-tint text-brand-dark" },
  xlsx: { label: "XLS", tile: "bg-ok-bg text-ok-dark" },
  png: { label: "PNG", tile: "bg-status-new-bg text-status-new-fg" },
  docx: { label: "DOC", tile: "bg-status-new-bg text-status-new-fg" },
};

interface AttachFilesDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  /** Files already attached to the reply. */
  attached: DraftAttachment[];
  /** Files the last try refused, as "name|reason". */
  rejected: string[];
}

/** Choose files for the reply. Too big or blocked types are listed with the reason. */
export default function AttachFilesDialog({ action, hiddenFields, closeHref, attached, rejected }: AttachFilesDialogProps) {
  const totalBytes = attached.reduce((sum, file) => sum + file.size, 0);
  return (
    <Modal
      title="Attach files to your reply"
      subtitle="They are sent from ai@schindler.com with your reply."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            {attached.length > 0 ? "Done" : "Cancel"}
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Attach files
          </Button>
        </>
      }
    >
      <label className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-[#b5b8bf] bg-[#fafafa] px-6 py-7 text-center">
        <Icon name="upload" size={22} className="text-brand" />
        <span className="text-sm font-semibold">
          Drop files here or <span className="text-brand">choose from your computer</span>
        </span>
        <span className="text-[12.5px] text-ink-3">You can add several files. Each file is scanned before it is sent.</span>
        <input type="file" name="files" multiple required className="mt-1 text-[13px]" />
      </label>

      <div className="mt-4 flex flex-col gap-2.5">
        {attached.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center gap-3 border border-line-soft bg-[#fafafa] px-3 py-2.5">
            <span className={`flex size-[30px] items-center justify-center text-[10px] font-bold ${KIND_LABELS[file.kind].tile}`}>
              {KIND_LABELS[file.kind].label}
            </span>
            <span className="mr-auto min-w-0">
              <span className="block truncate text-[13px] font-semibold">{file.name}</span>
              <span className="block text-xs text-ink-3">{formatFileSize(file.size)}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-ok-dark">
              <Icon name="check" size={13} strokeWidth={2.5} /> Ready
            </span>
          </div>
        ))}
        {rejected.map((entry) => {
          const [name, reason] = entry.split("|");
          return (
            <div key={entry} className="flex items-center gap-3 border border-[#f7c9cd] bg-brand-tint-soft px-3 py-2.5">
              <span className="flex size-[30px] items-center justify-center bg-[#ececec] text-[10px] font-bold text-ink-3">
                {name.split(".").pop()?.slice(0, 3).toUpperCase()}
              </span>
              <span className="mr-auto min-w-0 truncate text-[13px] font-semibold">{name}</span>
              <span className="text-xs font-semibold text-brand-dark">{reason}</span>
            </div>
          );
        })}
      </div>

      {attached.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-3">
          {attached.length} {attached.length === 1 ? "file" : "files"} ready · {formatFileSize(totalBytes)}
        </p>
      )}
    </Modal>
  );
}
