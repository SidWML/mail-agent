"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mergeAddresses, parseAddresses } from "@/lib/addresses";
import { changeUrl } from "@/lib/url";
import { ApiError } from "@/services/http";
import { getAiDraft, getReplyTemplates, runMailAction } from "@/services/mails";
import {
  clearReplyDraft,
  readReplyDraft,
  saveReplyDraft,
  type ComposeMode,
  type DraftAttachment,
  type ReplyDraft,
} from "@/services/reply-draft";
import { finishWithError, finishWithNotice, readReturnTo } from "./action-helpers";

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "");

/** The reply box as it is on screen right now: text, Cc and the chosen tab, plus what is already attached. */
async function readDraftFromForm(formData: FormData): Promise<ReplyDraft> {
  const saved = await readReplyDraft(field(formData, "mailId"));
  const mode = field(formData, "mode") as ComposeMode;
  return {
    ...saved,
    mode: ["reply", "replyAll", "note"].includes(mode) ? mode : saved.mode,
    body: field(formData, "body"),
  };
}

/**
 * Add the addresses typed in the "To" and "Cc" boxes to the draft's recipient lists.
 * Returns the pieces that were not email addresses, so the person can be told.
 */
function addTypedRecipients(draft: ReplyDraft, formData: FormData) {
  const typedTo = parseAddresses(field(formData, "toInput"));
  const typedCc = parseAddresses(field(formData, "ccInput"));
  draft.to = mergeAddresses(draft.to, typedTo.valid);
  draft.cc = mergeAddresses(draft.cc, typedCc.valid);
  return [...typedTo.invalid, ...typedCc.invalid];
}

/**
 * Every small button in the composer goes through here: the tabs, "Draft with AI", "Insert template",
 * "Attach files", remove-attachment and "Hide quoted text". The typed text is saved first, so nothing is lost.
 */
export async function updateReplyDraft(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const intent = field(formData, "intent");
  const draft = await readDraftFromForm(formData);
  const invalidAddresses = addTypedRecipients(draft, formData);

  if (intent.startsWith("mode:")) {
    draft.mode = intent.slice(5) as ComposeMode;
  } else if (intent.startsWith("remove-to:")) {
    draft.to = draft.to.filter((_, index) => index !== Number(intent.slice(10)));
  } else if (intent.startsWith("remove-cc:")) {
    draft.cc = draft.cc.filter((_, index) => index !== Number(intent.slice(10)));
  } else if (intent === "toggle-quoted") {
    draft.hideQuoted = !draft.hideQuoted;
  } else if (intent.startsWith("remove-attachment:")) {
    draft.attachments = draft.attachments.filter((_, index) => index !== Number(intent.slice(18)));
  } else if (intent === "ai-draft") {
    try {
      const result = await getAiDraft(mailId);
      draft.body = result.draft;
      draft.fromAi = true;
    } catch (error) {
      await saveReplyDraft(mailId, draft);
      finishWithError(error, returnTo);
    }
  }

  await saveReplyDraft(mailId, draft);
  if (invalidAddresses.length > 0) {
    finishWithNotice(returnTo, `Not an email address: ${invalidAddresses.join(", ")}`, "error");
  }
  if (intent === "dialog:attach") redirect(changeUrl(returnTo, { dialog: "attach" }));
  if (intent === "dialog:template") redirect(changeUrl(returnTo, { dialog: "template" }));
  redirect(changeUrl(returnTo, { dialog: undefined }));
}

/** Put a template into the reply box. The text can still be edited before sending. */
export async function insertTemplate(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const templateId = field(formData, "templateId");
  const searchText = field(formData, "tplq").trim();

  // Enter in the search box: show the matching templates instead of inserting.
  if (field(formData, "intent") !== "insert") redirect(changeUrl(returnTo, { dialog: "template", tplq: searchText }));
  if (!templateId) finishWithNotice(changeUrl(returnTo, { dialog: "template" }), "Pick a template first.", "error");

  const templates = await getReplyTemplates();
  const template = templates.find((item) => item.id === templateId);
  const draft = await readReplyDraft(mailId);
  if (template) {
    // ‹sender name› and ‹category› are filled in with this mail's values.
    const text = template.body
      .replaceAll("‹sender name›", field(formData, "senderFirstName"))
      .replaceAll("‹category›", field(formData, "categoryName"));
    draft.body = draft.body.trim() ? `${draft.body.trimEnd()}\n\n${text}` : text;
    draft.fromAi = false;
    await saveReplyDraft(mailId, draft);
  }
  redirect(changeUrl(returnTo, { dialog: undefined, tplq: undefined }));
}

// Files the composer accepts. Sizes and types are samples (the doc leaves them open).
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const KIND_BY_EXTENSION: Record<string, DraftAttachment["kind"]> = {
  pdf: "pdf",
  xls: "xlsx",
  xlsx: "xlsx",
  csv: "xlsx",
  doc: "docx",
  docx: "docx",
  txt: "docx",
  pptx: "docx",
  png: "png",
  jpg: "png",
  jpeg: "png",
};

/** Add the chosen files to the reply. Files that are too big or of a blocked type are listed, not added. */
export async function attachFiles(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const draft = await readReplyDraft(mailId);
  const rejected: string[] = [];

  for (const entry of formData.getAll("files")) {
    if (!(entry instanceof File) || !entry.name) continue;
    const extension = entry.name.split(".").pop()?.toLowerCase() ?? "";
    const kind = KIND_BY_EXTENSION[extension];
    if (!kind) rejected.push(`${entry.name}|File type not allowed`);
    else if (entry.size > MAX_FILE_BYTES) rejected.push(`${entry.name}|Too large. Share a link instead`);
    else draft.attachments.push({ name: entry.name, size: entry.size, kind });
  }
  await saveReplyDraft(mailId, draft);

  if (rejected.length > 0) redirect(changeUrl(returnTo, { dialog: "attach", rejected: rejected.join(";;") }));
  redirect(changeUrl(returnTo, { dialog: undefined, rejected: undefined }));
}

/** Send the reply from ai@schindler.com. On success the next-status step opens; on failure the text stays. */
export async function sendReply(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const draft = await readDraftFromForm(formData);
  const invalidAddresses = addTypedRecipients(draft, formData);
  if (invalidAddresses.length > 0) {
    await saveReplyDraft(mailId, draft);
    finishWithNotice(returnTo, `Not an email address: ${invalidAddresses.join(", ")}`, "error");
  }

  try {
    await runMailAction(mailId, {
      type: "reply",
      body: draft.body,
      replyAll: draft.mode === "replyAll",
      to: draft.to,
      cc: draft.cc,
      attachments: draft.attachments,
      version: field(formData, "version") ? Number(field(formData, "version")) : undefined,
    });
  } catch (error) {
    // Keep the text and attachments so "Try again" and "Keep editing" lose nothing.
    await saveReplyDraft(mailId, draft);
    if (error instanceof ApiError && error.code === "SEND_FAILED") {
      redirect(changeUrl(returnTo, { dialog: "send-failed" }));
    }
    finishWithError(error, returnTo);
  }

  await clearReplyDraft(mailId);
  revalidatePath("/inbox");
  redirect(changeUrl(returnTo, { dialog: "sent" }));
}

/** "Reply sent" step: keep Waiting on sender, go back to In progress, or close the mail. */
export async function chooseNextStatus(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  // "Keep In progress" is its own button; Apply uses the chosen radio.
  const choice = field(formData, "quick") || field(formData, "nextStatus");

  if (choice === "acted") redirect(changeUrl(returnTo, { dialog: "acted" }));

  if (choice === "In progress") {
    try {
      await runMailAction(mailId, { type: "set_status", status: "In progress" });
    } catch (error) {
      finishWithError(error, returnTo);
    }
    revalidatePath("/inbox");
    finishWithNotice(returnTo, "Reply sent. The mail stays In progress.");
  }

  finishWithNotice(returnTo, "Reply sent. Waiting on the sender.");
}

/** Throw away the typed reply. */
export async function discardReplyDraft(formData: FormData) {
  await clearReplyDraft(field(formData, "mailId"));
  redirect(changeUrl(readReturnTo(formData), { dialog: undefined }));
}
