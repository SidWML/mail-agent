import MailDialogs from "@/components/modules/mail-dialogs/MailDialogs";
import { readParam, type SearchParams } from "@/lib/url";
import { getMail, translateMessage } from "@/services/mails";
import type { User } from "@/types/mailbox";
import AttachmentPreview from "./AttachmentPreview";
import { createDrawerLinks } from "./drawer-links";
import MailDrawer, { type DrawerPosition } from "./MailDrawer";

interface MailOverlayProps {
  params: SearchParams;
  currentUser: User;
  position: DrawerPosition;
}

/**
 * Everything drawn above the list, decided by the address:
 * ?mail=<id> the drawer, ?preview=<id> the attachment viewer, ?dialog=<name> a dialog
 * (about ?target=<id> when opened from the list, otherwise about the open mail).
 */
export default async function MailOverlay({ params, currentUser, position }: MailOverlayProps) {
  const mailId = readParam(params, "mail");
  const dialog = readParam(params, "dialog");
  const targetId = readParam(params, "target") ?? mailId;
  const previewId = readParam(params, "preview");
  const links = createDrawerLinks(params);

  // Load each mail once (opening a mail is written to the audit log).
  const needed = [...new Set([mailId, targetId].filter((id): id is string => Boolean(id)))];
  const details = new Map(await Promise.all(needed.map(async (id) => [id, await getMail(id)] as const)));
  const drawerDetail = mailId ? details.get(mailId) : undefined;
  const dialogDetail = targetId ? details.get(targetId) : undefined;

  // ?translate=<messageId>:<language code> shows one message in another language.
  const [translateMessageId, translateCode] = (readParam(params, "translate") ?? "").split(":");
  const translation =
    mailId && translateMessageId && translateCode
      ? await translateMessage(mailId, translateMessageId, translateCode).catch(() => undefined)
      : undefined;

  return (
    <>
      {drawerDetail && <MailDrawer
          detail={drawerDetail}
          currentUser={currentUser}
          links={links}
          position={position}
          translated={translation ? { messageId: translateMessageId, ...translation } : undefined}
        />}

      {drawerDetail && previewId && (
        <AttachmentPreview mail={drawerDetail.mail} attachmentId={previewId} closeHref={links.closePreview} getPreviewHref={links.preview} />
      )}

      {dialog && <MailDialogs dialog={dialog} params={params} detail={dialogDetail} currentUser={currentUser} links={links} />}
    </>
  );
}
