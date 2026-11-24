import Icon from "@/components/ui/Icon";

interface NoticeBannerProps {
  message: string;
  /** Right-hand note, for example "Last updated 09:02". */
  note?: string;
}

/** Amber warning strip under the header (for example when mail sync is delayed). */
export default function NoticeBanner({ message, note }: NoticeBannerProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#f2d98a] bg-status-progress-bg px-6 py-3 text-[13.5px] font-semibold text-status-progress-fg">
      <Icon name="warning" size={18} />
      {message}
      {note && <span className="ml-auto text-[12.5px] font-medium">{note}</span>}
    </div>
  );
}
