import Link from "next/link";
import EscapeKey from "@/components/common/EscapeKey";
import Icon from "@/components/ui/Icon";
import type { MailDetailResponse } from "@/types/api";
import type { User } from "@/types/mailbox";
import { readReplyDraft } from "@/services/reply-draft";
import AiSummaryPanel from "./AiSummaryPanel";
import type { DrawerLinks } from "./drawer-links";
import DrawerTopBar from "./DrawerTopBar";
import MailHeader from "./MailHeader";
import NoteBox from "./NoteBox";
import OwnershipBar from "./OwnershipBar";
import ReplyComposer from "./ReplyComposer";
import ReplyGate from "./ReplyGate";
import ThreadChain from "./ThreadChain";
import type { MessageTranslation } from "./ThreadMessage";

/** Where this mail sits in the list it was opened from. */
export interface DrawerPosition {
  mailIds: string[];
  total: number;
  /** "Active", "My items"... */
  listLabel: string;
}

interface MailDrawerProps {
  detail: MailDetailResponse;
  currentUser: User;
  links: DrawerLinks;
  position: DrawerPosition;
  /** The message currently shown translated (asked for with ?translate=), if any. */
  translated?: ({ messageId: string } & MessageTranslation);
  /** True when the reader chose to show the pictures in mails (?images=1). */
  showImages: boolean;
}

/** Right-hand panel (84% wide) with the whole mail. Opened by ?mail=<id>; the list stays visible behind it. */
export default async function MailDrawer({ detail, currentUser, links, position, translated, showImages }: MailDrawerProps) {
  const { mail, perms, someoneReplying } = detail;
  const hasImages = mail.thread.some((message) => message.images?.length);
  const draft = perms.reply ? await readReplyDraft(mail.id) : undefined;

  const index = position.mailIds.indexOf(mail.id);
  const previousId = index > 0 ? position.mailIds[index - 1] : undefined;
  const nextId = index >= 0 && index < position.mailIds.length - 1 ? position.mailIds[index + 1] : undefined;
  const positionLabel = `${index >= 0 ? `Mail ${index + 1} of ${position.total}` : "Mail"} · ${position.listLabel}`;
  const isOpen = ["New", "In progress", "Waiting on sender"].includes(mail.status);

  // Keyboard shortcuts: only the ones this person may use (the server decides, see perms).
  const shortcuts: Record<string, string> = { "?": links.dialog("shortcuts") };
  if (nextId) Object.assign(shortcuts, { j: links.openMail(nextId), ArrowRight: links.openMail(nextId) });
  if (previousId) Object.assign(shortcuts, { k: links.openMail(previousId), ArrowLeft: links.openMail(previousId) });
  if (perms.claim) shortcuts.c = "click:[data-shortcut=claim]";
  if (perms.reply) shortcuts.r = "focus:#reply-text";
  if (perms.acted) shortcuts.a = links.dialog("acted");
  if (perms.forward) shortcuts.f = links.dialog("forward");
  if (perms.recategorize) shortcuts.g = links.dialog("category");
  if (perms.del) shortcuts.d = links.dialog("delete");

  return (
    <EscapeKey closeHref={links.close} shortcuts={shortcuts} dataOverlay="drawer" className="fixed inset-0 z-40">
      <Link href={links.close} aria-label="Close mail" className="animate-fade absolute inset-0 bg-[rgba(26,26,28,0.52)]" />

      <aside className="animate-drawer absolute inset-y-0 right-0 flex w-full lg:w-[84%] flex-col border-l border-line-strong bg-page shadow-drawer">
        <DrawerTopBar
          closeHref={links.close}
          previousHref={previousId ? links.openMail(previousId) : undefined}
          nextHref={nextId ? links.openMail(nextId) : undefined}
          positionLabel={positionLabel}
          shortcutsHref={links.dialog("shortcuts")}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-8">
          <div className="flex flex-wrap items-start gap-4">
            <section className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
              <div className="border border-[#e6e6e6] bg-card">
                <MailHeader mail={mail} />
                <OwnershipBar mail={mail} perms={perms} currentUser={currentUser} links={links} />

                {someoneReplying && isOpen && (
                  <div className="flex items-center gap-2.5 border-t border-[#d3e0f7] bg-status-new-bg px-6 py-2.5 text-[13px] font-semibold text-status-new-fg">
                    <span className="size-2 rounded-full bg-status-new-dot" />
                    {someoneReplying} is replying to this mail right now
                  </div>
                )}

                {perms.takeoverDecide && mail.takeovers.some((request) => request.state === "open") && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-[#f2d98a] bg-[#fff8e1] px-6 py-2.5 text-[13px] text-status-progress-fg">
                    <span className="font-semibold">
                      {mail.takeovers.find((request) => request.state === "open")?.byName} asks to take over this mail.
                    </span>
                    <Link href={links.dialog("takeover-review")} className="font-semibold text-brand">
                      Review request
                    </Link>
                  </div>
                )}

                {mail.duplicateOf && isOpen && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-status-new-dot/30 bg-status-new-bg px-6 py-2.5 text-[13px] text-status-new-fg">
                    <Icon name="link" size={15} />
                    <span>
                      <strong className="font-semibold">Possible duplicate.</strong> Same sender and topic as “{mail.duplicateSubject}” within 7 days.
                    </span>
                    <span className="ml-auto flex items-center gap-4">
                      <Link href={links.openMail(mail.duplicateOf)} className="font-semibold text-brand">
                        Open that mail
                      </Link>
                      {perms.acted && (
                        <Link href={links.dialog("acted", { outcome: "Duplicate" })} className="font-semibold text-brand">
                          Mark as duplicate
                        </Link>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3 px-6 py-5">
                  <div className="flex flex-wrap items-center gap-2.5 border border-line-soft bg-stripe px-3.5 py-2 text-[12.5px] text-ink-2">
                    <Icon name="lock" size={14} className="text-ink-3" />
                    {hasImages && showImages ? "Images from the sender are shown. Scripts are still removed." : "External images are blocked and scripts are removed for safety."}
                    {hasImages && (
                      <Link href={showImages ? links.hideImages : links.showImages} className="font-semibold text-brand">
                        {showImages ? "Hide images" : "Show images"}
                      </Link>
                    )}
                  </div>
                  <ThreadChain
                    messages={mail.thread}
                    mailId={mail.id}
                    senderEmail={mail.email}
                    getPreviewHref={links.preview}
                    getTranslateHref={links.translate}
                    showOriginalHref={links.showOriginal}
                    showImages={showImages}
                    translated={translated}
                  />
                </div>
              </div>

              {perms.reply && draft ? (
                <ReplyComposer mail={mail} draft={draft} returnTo={links.returnTo} />
              ) : (
                <>
                  <ReplyGate mail={mail} perms={perms} currentUser={currentUser} links={links} />
                  {perms.note && isOpen && <NoteBox mailId={mail.id} version={mail.version} returnTo={links.returnTo} />}
                </>
              )}
            </section>

            <AiSummaryPanel
              mail={mail}
              perms={perms}
              changeCategoryHref={links.dialog("category")}
              blockSenderHref={links.dialog("block")}
            />
          </div>
        </div>
      </aside>
    </EscapeKey>
  );
}
