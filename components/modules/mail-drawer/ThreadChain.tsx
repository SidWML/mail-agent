import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatMessageTime } from "@/lib/format";
import type { Msg } from "@/types/mailbox";
import ThreadControls from "./ThreadControls";
import ThreadMessage, { type MessageTranslation } from "./ThreadMessage";

interface ThreadChainProps {
  messages: Msg[];
  mailId: string;
  /** Email address of the person who started the conversation. */
  senderEmail: string;
  getPreviewHref: (attachmentId: string) => string;
  getTranslateHref: (messageId: string, languageCode: string) => string;
  showOriginalHref: string;
  /** The message that is currently shown translated, and its translation. */
  translated?: { messageId: string } & MessageTranslation;
}

/** Everyone who took part: the people who wrote, and the addresses in To and Cc, without repeats. */
function getParticipants(messages: Msg[], senderEmail: string) {
  const seen = new Set<string>();
  const people: string[] = [];
  const add = (label: string) => {
    const key = label.toLowerCase();
    if (!seen.has(key) && key !== "ai@schindler.com") {
      seen.add(key);
      people.push(label);
    }
  };
  messages.forEach((message) => {
    if (message.kind !== "note") add(message.author);
    [...(message.to ?? []), ...(message.cc ?? [])].forEach((address) => {
      // The sender's address is already shown as their name.
      if (address !== senderEmail) add(address);
    });
  });
  return people;
}

const SHOWN_PARTICIPANTS = 6;
const OPEN_LATEST = 2;

/** First words of a message, for the collapsed line. */
const preview = (body: string) => body.replace(/\s+/g, " ").replace(/^(Hello|Hi)[^,]*,\s*/i, "").slice(0, 110);

/**
 * The whole conversation of one ticket, oldest first. Long chains stay readable:
 * the latest messages are open, older ones fold to one line you can open with a click.
 */
export default function ThreadChain({ messages, mailId, senderEmail, getPreviewHref, getTranslateHref, showOriginalHref, translated }: ThreadChainProps) {
  const conversationCount = messages.filter((message) => message.kind !== "note").length;
  const participants = getParticipants(messages, senderEmail);
  const firstOpenIndex = messages.length <= 3 ? 0 : messages.length - OPEN_LATEST;

  return (
    <div className="flex flex-col gap-2.5">
      {messages.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-0.5">
          <span className="text-[13px] font-semibold">
            Conversation · {conversationCount} {conversationCount === 1 ? "message" : "messages"}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-ink-3">
            <Icon name="person" size={12} />
            {participants.slice(0, SHOWN_PARTICIPANTS).map((person) => (
              <span key={person} className="max-w-[190px] truncate border border-line-soft bg-stripe px-1.5 py-px" title={person}>
                {person}
              </span>
            ))}
            {participants.length > SHOWN_PARTICIPANTS && <span>+{participants.length - SHOWN_PARTICIPANTS} more</span>}
          </span>
          <span className="ml-auto">
            <ThreadControls />
          </span>
        </div>
      )}

      {messages.map((message, index) => (
        <details
          key={message.id}
          data-thread-message
          open={message.kind === "note" || index >= firstOpenIndex || translated?.messageId === message.id}
          className="group/message"
        >
          <summary
            className={cn(
              "flex cursor-pointer items-center gap-3 border border-line-soft bg-stripe px-4 py-2 text-[12.5px] transition-colors duration-150 ease-out hover:bg-table-head",
              "group-open/message:border-b-0",
            )}
          >
            <span className="w-6 shrink-0 font-semibold text-ink-muted">#{index + 1}</span>
            <span className="shrink-0 font-semibold">{message.author}</span>
            <span className="shrink-0 text-ink-muted">{formatMessageTime(message.at)}</span>
            <span className="min-w-0 flex-1 truncate text-ink-3 group-open/message:hidden">{preview(message.body)}</span>
            {message.attachments.length > 0 && (
              <span className="flex shrink-0 items-center gap-1 text-ink-muted group-open/message:hidden">
                <Icon name="paperclip" size={12} />
                {message.attachments.length}
              </span>
            )}
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-ink-muted">
              <span className="hidden group-open/message:inline">Collapse</span>
              <Icon name="chevronDown" size={14} className="transition-transform duration-200 ease-out group-open/message:rotate-180" />
            </span>
          </summary>
          <ThreadMessage
            message={message}
            mailId={mailId}
            senderEmail={senderEmail}
            getPreviewHref={getPreviewHref}
            getTranslateHref={getTranslateHref}
            showOriginalHref={showOriginalHref}
            translation={translated?.messageId === message.id ? translated : undefined}
          />
        </details>
      ))}
    </div>
  );
}
