import { assignMail, blockSender, changeCategory, decideTakeover, deleteMail, forwardMail, markActed, reopenMail, requestTakeover } from "@/actions/mail-actions";
import { confirmBulkAction } from "@/actions/bulk-actions";
import { attachFiles, chooseNextStatus, insertTemplate, sendReply } from "@/actions/reply-actions";
import ActionFields from "@/components/common/ActionFields";
import type { DrawerLinks } from "@/components/modules/mail-drawer/drawer-links";
import { readList, readParam, withParams, type SearchParams } from "@/lib/url";
import { getCategories } from "@/services/categories";
import { getMails, getReplyTemplates } from "@/services/mails";
import { readReplyDraft } from "@/services/reply-draft";
import { getUsers } from "@/services/users";
import type { MailDetailResponse } from "@/types/api";
import type { User } from "@/types/mailbox";
import ActedDialog from "./ActedDialog";
import AssignDialog from "./AssignDialog";
import AttachFilesDialog from "./AttachFilesDialog";
import BlockSenderDialog from "./BlockSenderDialog";
import CategoryDialog from "./CategoryDialog";
import ClaimConflictDialog from "./ClaimConflictDialog";
import DeleteDialog from "./DeleteDialog";
import ForwardDialog from "./ForwardDialog";
import InsertTemplateDialog from "./InsertTemplateDialog";
import ReopenDialog from "./ReopenDialog";
import ReplySentDialog from "./ReplySentDialog";
import RestoreExpiredDialog from "./RestoreExpiredDialog";
import SendFailedDialog from "./SendFailedDialog";
import ShortcutsDialog from "./ShortcutsDialog";
import TakeoverRequestDialog from "./TakeoverRequestDialog";
import TakeoverReviewDialog from "./TakeoverReviewDialog";

interface MailDialogsProps {
  dialog: string;
  params: SearchParams;
  /** The mail the dialog is about (missing for bulk dialogs). */
  detail?: MailDetailResponse;
  currentUser: User;
  links: DrawerLinks;
}

/** Picks the dialog named in the address (?dialog=...) and gives it the data it needs. */
export default async function MailDialogs({ dialog, params, detail, currentUser, links }: MailDialogsProps) {
  const closeHref = links.closeDialog;
  const mail = detail?.mail;
  const hiddenFields = mail ? <ActionFields mailId={mail.id} version={mail.version} returnTo={links.returnTo} /> : null;

  if (dialog === "shortcuts") return <ShortcutsDialog closeHref={closeHref} />;

  // ---- Bulk dialogs: the ticked rows are in ?ids=a,b,c -------------------------------------------
  if (dialog.startsWith("bulk-")) {
    const mailIds = readList(params, "ids");
    const bulkAction = dialog.slice(5);
    const bulkFields = (
      <>
        <input type="hidden" name="ids" value={mailIds.join(",")} />
        <input type="hidden" name="bulkAction" value={bulkAction} />
        <ActionFields returnTo={links.returnTo} />
      </>
    );

    if (bulkAction === "acted") return <ActedDialog action={confirmBulkAction} hiddenFields={bulkFields} closeHref={closeHref} bulkCount={mailIds.length} />;
    if (bulkAction === "delete") return <DeleteDialog action={confirmBulkAction} hiddenFields={bulkFields} closeHref={closeHref} bulkCount={mailIds.length} />;
    if (bulkAction === "assign") {
      const people = await getAssignablePeople();
      return <AssignDialog action={confirmBulkAction} hiddenFields={bulkFields} closeHref={closeHref} people={people} bulkCount={mailIds.length} selectedTeam={readParam(params, "assignTeam") ?? ""} getTeamHref={(team) => withParams("/inbox", params, { assignTeam: team || undefined })} />;
    }
    if (bulkAction === "recategorize") {
      const categories = await getCategories();
      return <CategoryDialog action={confirmBulkAction} hiddenFields={bulkFields} closeHref={closeHref} categories={categories} bulkCount={mailIds.length} />;
    }
    return null;
  }

  if (!mail || !detail) return null;

  // ---- Result dialogs ----------------------------------------------------------------------------
  if (dialog === "conflict") {
    const openMailHref = withParams("/inbox", params, { mail: mail.id, dialog: undefined, target: undefined, owner: undefined });
    return <ClaimConflictDialog closeHref={closeHref} openMailHref={openMailHref} mail={mail} />;
  }
  if (dialog === "restore-expired") return <RestoreExpiredDialog closeHref={closeHref} mail={mail} />;

  if (dialog === "send-failed") {
    const draft = await readReplyDraft(mail.id);
    return <SendFailedDialog action={sendReply} hiddenFields={hiddenFields} closeHref={closeHref} senderName={mail.sender} status={mail.status} draft={draft} />;
  }

  if (dialog === "sent") {
    const isForward = readParam(params, "sentKind") === "forward";
    const confirmation = isForward
      ? `Forwarded as ai@schindler.com to ${readParam(params, "sentTo") ?? "the recipient"}`
      : `Sent as ai@schindler.com to ${mail.sender}`;
    return (
      <ReplySentDialog
        action={chooseNextStatus}
        hiddenFields={hiddenFields}
        closeHref={closeHref}
        confirmation={confirmation}
        currentStatus={mail.status}
      />
    );
  }

  // ---- Action dialogs ----------------------------------------------------------------------------
  switch (dialog) {
    case "acted":
      return <ActedDialog action={markActed} hiddenFields={hiddenFields} closeHref={closeHref} defaultOutcome={readParam(params, "outcome") ?? undefined} />;

    case "delete":
      return <DeleteDialog action={deleteMail} hiddenFields={hiddenFields} closeHref={closeHref} sender={mail.sender} subject={mail.subject} />;

    case "block":
      return <BlockSenderDialog action={blockSender} hiddenFields={hiddenFields} closeHref={closeHref} senderEmail={mail.email} />;

    case "forward": {
      const attachmentNames = mail.thread.flatMap((message) => message.attachments.map((attachment) => attachment.name));
      return <ForwardDialog action={forwardMail} hiddenFields={hiddenFields} closeHref={closeHref} attachmentNames={attachmentNames} />;
    }

    case "takeover":
      return (
        <TakeoverRequestDialog
          action={requestTakeover}
          hiddenFields={hiddenFields}
          closeHref={closeHref}
          ownerName={mail.ownerName ?? "The owner"}
          subject={mail.subject}
        />
      );

    case "takeover-review": {
      const request = mail.takeovers.find((item) => item.state === "open");
      if (!request) return null;
      return (
        <TakeoverReviewDialog
          action={decideTakeover}
          hiddenFields={hiddenFields}
          closeHref={closeHref}
          request={request}
          subject={mail.subject}
          isOwnerOfMail={mail.ownerId === currentUser.id}
        />
      );
    }

    case "reopen": {
      const users = await getUsers();
      const previousOwnerName = users.find((user) => user.id === (mail.prevOwnerId ?? mail.ownerId))?.name;
      return <ReopenDialog action={reopenMail} hiddenFields={hiddenFields} closeHref={closeHref} previousOwnerName={previousOwnerName} />;
    }

    case "assign": {
      const people = await getAssignablePeople();
      return <AssignDialog action={assignMail} hiddenFields={hiddenFields} closeHref={closeHref} people={people} currentOwnerId={mail.ownerId} selectedTeam={readParam(params, "assignTeam") ?? ""} getTeamHref={(team) => withParams("/inbox", params, { assignTeam: team || undefined })} />;
    }

    case "category": {
      const categories = await getCategories();
      return (
        <CategoryDialog
          action={changeCategory}
          hiddenFields={hiddenFields}
          closeHref={closeHref}
          categories={categories}
          currentCategoryId={mail.categoryId}
          aiCategoryId={mail.aiCategoryId}
          aiCategoryName={mail.aiCategory}
          confidencePercent={Math.round(mail.confidence * 100)}
        />
      );
    }

    case "attach": {
      const draft = await readReplyDraft(mail.id);
      const rejected = (readParam(params, "rejected") ?? "").split(";;").filter(Boolean);
      return <AttachFilesDialog action={attachFiles} hiddenFields={hiddenFields} closeHref={closeHref} attached={draft.attachments} rejected={rejected} />;
    }

    case "template": {
      const [templates, categories] = await Promise.all([getReplyTemplates(), getCategories()]);
      return (
        <InsertTemplateDialog
          action={insertTemplate}
          hiddenFields={hiddenFields}
          closeHref={closeHref}
          templates={templates}
          categories={categories}
          suggestedIds={detail.suggestedTemplateIds}
          searchText={readParam(params, "tplq") ?? ""}
          senderName={mail.sender}
          categoryName={mail.category ?? "your request"}
        />
      );
    }

    default:
      return null;
  }
}

/** Team members the Platform Owner can assign to, with how many open mails each has. */
async function getAssignablePeople() {
  const [users, activeMails] = await Promise.all([getUsers(), getMails({ tab: "active", pageSize: 1 })]);
  return users
    .filter((user) => user.role === "agent")
    .map((user) => ({ user, openMails: activeMails.facets.assignee[user.id] ?? 0 }));
}
