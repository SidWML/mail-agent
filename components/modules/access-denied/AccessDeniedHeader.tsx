import Icon from "@/components/ui/Icon";

/** Same logo block as the app header, without the menu and user chip (they need the API). */
export default function AccessDeniedHeader() {
  return (
    <header className="shrink-0 border-b border-line-header bg-card">
      <div className="flex min-h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center bg-brand text-white">
            <Icon name="mail" size={20} strokeWidth={1.75} />
          </span>
          <span className="flex flex-col">
            <span className="text-base leading-[1.2] font-semibold">Mailbox Agent</span>
            <span className="text-xs text-ink-muted">ai@schindler.com</span>
          </span>
        </div>
      </div>
    </header>
  );
}
