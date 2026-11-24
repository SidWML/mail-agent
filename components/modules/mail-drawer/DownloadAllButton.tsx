"use client";

interface DownloadAllButtonProps {
  /** One download address per file. */
  urls: string[];
  className?: string;
}

/** Starts every download one after the other (each one is written to the audit log by the server). */
export default function DownloadAllButton({ urls, className }: DownloadAllButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        urls.forEach((url, index) => {
          window.setTimeout(() => {
            const link = document.createElement("a");
            link.href = url;
            link.download = "";
            document.body.appendChild(link);
            link.click();
            link.remove();
          }, index * 400);
        });
      }}
    >
      Download all ({urls.length})
    </button>
  );
}
