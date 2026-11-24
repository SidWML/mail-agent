import { addInternalNote } from "@/actions/mail-actions";
import { sendReply, updateReplyDraft } from "@/actions/reply-actions";
import ActionFields from "@/components/common/ActionFields";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/format";
import type { MailDetail } from "@/types/api";
import type { ReplyDraft } from "@/services/reply-draft";
import RecipientsField from "./RecipientsField";
import ReplyTextBox from "./ReplyTextBox";

interface ReplyComposerProps {
  mail: MailDetail;
  draft: ReplyDraft;
  returnTo: string;
}

const TABS = [
  { mode: "reply", label: "Reply" },
  { mode: "replyAll", label: "Reply all" },
  { mode: "note", label: "Internal note" },
] as const;

const toolButtonClassName =
  "inline-flex h-[34px] cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-card px-3.5 text-[13px] font-medium";

/**
 * The reply box for the owner of the mail: Reply / Reply all / Internal note, AI draft, templates, attachments.
 * Every small button saves what you typed first (see updateReplyDraft), so nothing is lost.
 */
export default function ReplyComposer({ mail, draft, returnTo }: ReplyComposerProps) {
  const isNote = draft.mode === "note";
  const originalMessage = mail.thread.find((message) => message.kind === "in");
  // Reply all keeps everyone who was on the latest mail from the sender.
  const latestFromSender = [...mail.thread].reverse().find((message) => message.kind === "in");
  const isReplyAll = draft.mode === "replyAll";
  const originalTo = isReplyAll ? (latestFromSender?.to ?? []).filter((address) => address !== "ai@schindler.com") : [];
  const originalCc = isReplyAll ? (latestFromSender?.cc ?? []) : [];
  const subject = mail.subject.startsWith("Re:") ? mail.subject : `Re: ${mail.subject}`;

  return (
    <form action={updateReplyDraft} id="reply" className="border border-[#e6e6e6] bg-card">
      <ActionFields mailId={mail.id} version={mail.version} returnTo={returnTo} />
      <input type="hidden" name="mode" value={draft.mode} />
      {/* Pressing Enter in a recipients box adds the address (this button comes first, so Enter uses it). */}
      <button type="submit" name="intent" value="recipients" tabIndex={-1} aria-hidden className="sr-only">
        Add recipients
      </button>

      <div className="flex flex-wrap border-b border-[#eee] px-6">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            type="submit"
            name="intent"
            value={`mode:${tab.mode}`}
            className={cn(
              "flex min-h-[46px] cursor-pointer items-center border-b-[3px] px-3.5 text-sm",
              draft.mode === tab.mode ? "border-brand font-semibold text-ink" : "border-transparent font-medium text-ink-3",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        {isNote ? (
          <p className="text-[13px] text-ink-3">Visible only to the team. Never sent to the sender.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-ink-3">
                From <strong className="font-semibold text-ink">ai@schindler.com</strong>
              </p>
              <RecipientsField
                label="To"
                fixed={[{ address: mail.email }, ...originalTo.map((address) => ({ address, note: "Kept from the original mail (Reply all)" }))]}
                removable={draft.to}
                removeIntent="remove-to"
                inputName="toInput"
                placeholder="Add people to this reply, press Enter"
              />
              <RecipientsField
                label="Cc"
                fixed={originalCc.map((address) => ({ address, note: "Kept from the original mail (Reply all)" }))}
                removable={draft.cc}
                removeIntent="remove-cc"
                inputName="ccInput"
                placeholder={draft.mode === "replyAll" ? "Add more people in Cc" : "Add people in Cc, press Enter"}
              />
            </div>
            <p className="text-[13px] text-ink-3">
              Subject <strong className="font-semibold text-ink">{subject}</strong>
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button type="submit" name="intent" value="ai-draft" className={cn(toolButtonClassName, "border-brand font-semibold text-brand")}>
                <Icon name="sparkles" size={14} filled />
                Draft with AI
              </button>
              <button type="submit" name="intent" value="dialog:template" className={toolButtonClassName}>
                Insert template
                <Icon name="chevronDown" size={12} strokeWidth={2.5} />
              </button>
              <button type="submit" name="intent" value="dialog:attach" className={toolButtonClassName}>
                <Icon name="paperclip" size={14} />
                Attach files
              </button>
              {draft.fromAi && (
                <span className="ml-auto bg-status-progress-bg px-2 py-1 text-xs font-semibold text-status-progress-fg">
                  AI draft · written in the sender’s language · review before sending
                </span>
              )}
            </div>
          </>
        )}

        <ReplyTextBox
          mailId={mail.id}
          name="body"
          defaultValue={draft.body}
          placeholder={isNote ? "Write a note for your team" : "Write your reply"}
        />

        {!isNote && draft.attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-ink-3">Attached to your reply</span>
            {draft.attachments.map((attachment, index) => (
              <span
                key={`${attachment.name}-${index}`}
                className="inline-flex h-[30px] items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-2.5 text-[12.5px]"
              >
                <Icon name="paperclip" size={13} className="text-ink-3" />
                {attachment.name}
                <span className="text-ink-muted">{formatFileSize(attachment.size)}</span>
                <button
                  type="submit"
                  name="intent"
                  value={`remove-attachment:${index}`}
                  aria-label={`Remove ${attachment.name}`}
                  className="cursor-pointer text-ink-3"
                >
                  <Icon name="close" size={12} strokeWidth={2.4} />
                </button>
              </span>
            ))}
          </div>
        )}

        {!isNote && originalMessage && (
          <div className="text-[12.5px] text-ink-3">
            The original mail is quoted below your reply.{" "}
            <button type="submit" name="intent" value="toggle-quoted" className="cursor-pointer font-semibold text-brand">
              {draft.hideQuoted ? "Show quoted text" : "Hide quoted text"}
            </button>
            {!draft.hideQuoted && (
              <blockquote className="mt-2 border-l-[3px] border-line-strong pl-3 text-[12.5px] whitespace-pre-line text-ink-muted">
                {originalMessage.body}
              </blockquote>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {isNote ? (
            <Button type="submit" formAction={addInternalNote} variant="neutral" large>
              Add note
            </Button>
          ) : (
            <>
              <button
                type="submit"
                formAction={sendReply}
                className="inline-flex h-11 cursor-pointer items-center gap-2.5 border border-brand bg-brand px-[22px] text-sm font-semibold text-white"
              >
                <Icon name="send" size={16} />
                Send as ai@schindler.com
              </button>
              <span className="text-[12.5px] text-ink-muted">
                Nothing is sent until you click Send. The reply also appears in the mailbox Sent Items.
              </span>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
