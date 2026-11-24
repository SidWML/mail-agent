import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatMessageTime, getInitials } from "@/lib/format";
import { LANGUAGES } from "@/lib/languages";
import type { Msg } from "@/types/mailbox";
import AttachmentList from "./AttachmentList";

/** A translation of one message, asked for with ?translate=<messageId>:<language code>. */
export interface MessageTranslation {
  text: string;
  language: string;
  /** How many sentences the demo translator knew. 0 means the text came back unchanged. */
  translatedParts: number;
}

interface ThreadMessageProps {
  message: Msg;
  mailId: string;
  /** Email address of the sender of the original mail (shown next to the sender's name). */
  senderEmail: string;
  getPreviewHref: (attachmentId: string) => string;
  /** Link that translates this message into a language. */
  getTranslateHref: (messageId: string, languageCode: string) => string;
  /** Link that goes back to the original text. */
  showOriginalHref: string;
  /** Set when this message is currently shown translated. */
  translation?: MessageTranslation;
}

const KIND_LABELS = { in: "", out: "", fwd: "forwarded", note: "internal note" } as const;

/** One message in the thread: from the sender, our reply, a forward, or an internal note. */
export default function ThreadMessage({
  message,
  mailId,
  senderEmail,
  getPreviewHref,
  getTranslateHref,
  showOriginalHref,
  translation,
}: ThreadMessageProps) {
  const isNote = message.kind === "note";
  const isFromSender = message.kind === "in";
  const paragraphs = (translation?.text ?? message.body).split(/\n{2,}/);

  return (
    <div
      className={cn(
        "flex gap-3.5 border px-5 py-[18px]",
        isNote ? "border-[#f2d98a] bg-[#fff8e1]" : "border-line-soft bg-card",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center text-[15px] font-semibold",
          isFromSender || isNote ? "bg-[#ececec] text-[#333]" : "bg-ink text-white",
        )}
      >
        {getInitials(message.author)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{message.author}</span>
            {isFromSender && <span className="text-[13px] text-ink-muted">&lt;{senderEmail}&gt;</span>}
            {message.kind === "out" && <span className="text-[13px] text-ink-muted">&lt;ai@schindler.com&gt;</span>}
            {KIND_LABELS[message.kind] && <span className="text-[13px] text-ink-muted">{KIND_LABELS[message.kind]}</span>}
            {message.kind === "out" && (
              <span className="bg-status-new-bg px-2 py-0.5 text-[11px] font-bold text-status-new-fg uppercase">
                Sent from ai@schindler.com
              </span>
            )}
            {isNote && (
              <span className="bg-[#ffe8a3] px-2 py-0.5 text-[11px] font-bold text-status-progress-fg uppercase">
                Internal note · only visible to the team
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isNote && (
              <details name="filter-menu" className="dropdown relative">
                <summary className="flex items-center gap-1.5 text-xs font-semibold text-brand transition-opacity duration-150 hover:opacity-75" title="Translate this message">
                  <Icon name="translate" size={14} />
                  Translate
                </summary>
                <ul className="absolute top-[calc(100%+6px)] right-0 z-[22] w-44 border border-line-control border-t-2 border-t-brand bg-card py-1 shadow-[0_6px_18px_rgba(0,0,0,0.1)]">
                  {LANGUAGES.map((language) => (
                    <li key={language.code}>
                      <Link
                        href={getTranslateHref(message.id, language.code)}
                        className="block px-3.5 py-1.5 text-[13px] transition-colors duration-150 hover:bg-stripe"
                      >
                        {language.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <span className="text-xs text-ink-muted">{formatMessageTime(message.at)}</span>
          </div>
        </div>

        {!isNote && (
          <p className="mt-1 text-[12.5px] text-ink-muted">
            {`To ${message.to?.join(", ") ?? (message.kind === "in" ? "ai@schindler.com" : "the sender")}${message.cc?.length ? ` · Cc ${message.cc.join(", ")}` : ""}`}
          </p>
        )}

        {translation && (
          <div className="mt-3 flex flex-wrap items-center gap-2 bg-status-new-bg px-3 py-1.5 text-xs text-status-new-fg">
            <Icon name="translate" size={13} />
            <span>
              Translated to <strong className="font-semibold">{translation.language}</strong> by AI (demo)
              {translation.translatedParts === 0 && " · the demo translator did not know these sentences"}
            </span>
            <Link href={showOriginalHref} className="ml-auto font-semibold text-brand">
              Show original
            </Link>
          </div>
        )}

        <div className="mt-3 flex max-w-[720px] flex-col gap-2.5 text-sm leading-[1.65] text-[#2a2a2a]">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        <AttachmentList mailId={mailId} attachments={message.attachments} getPreviewHref={getPreviewHref} />
      </div>
    </div>
  );
}
