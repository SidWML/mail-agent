"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MESSAGES, type Message } from "@/lib/messages";
import { changeUrl } from "@/lib/url";
import { getUsers } from "@/services/users";
import { runMailAction } from "@/services/mails";
import { finishWithError, finishWithNotice, readReturnTo } from "./action-helpers";

type MailAction = { type: string; [field: string]: unknown };

/** Read a text field from a form (trimmed). */
const field = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

/**
 * Runs one mail action, then goes back to the page with a short result message.
 * Errors become the right dialog or notice (see finishWithError).
 */
async function runAndFinish(formData: FormData, action: MailAction, successMessage: Message) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const version = formData.get("version");

  try {
    await runMailAction(mailId, { ...action, version: version ? Number(version) : undefined });
  } catch (error) {
    finishWithError(error, returnTo);
  }

  revalidatePath("/inbox");
  finishWithNotice(returnTo, successMessage);
}

/** "Take it": the signed-in person becomes the owner of an unassigned mail. */
export async function claimMail(formData: FormData) {
  await runAndFinish(formData, { type: "claim" }, MESSAGES.mailTaken);
}

/** Platform Owner: give the mail to a team member (also used to reassign). */
export async function assignMail(formData: FormData) {
  const userId = field(formData, "userId");
  const users = await getUsers();
  const name = users.find((user) => user.id === userId)?.name ?? "the team member";
  await runAndFinish(formData, { type: "assign", userId }, MESSAGES.assigned(name));
}

/** Platform Owner: take over someone else's mail. */
export async function assignMailToMe(formData: FormData) {
  await runAndFinish(formData, { type: "assign_to_me" }, MESSAGES.assignedToYou);
}

export async function requestTakeover(formData: FormData) {
  await runAndFinish(
    formData,
    { type: "takeover_request", reason: field(formData, "reason") },
    MESSAGES.takeoverSent,
  );
}

/** The owner answers a takeover request. */
export async function decideTakeover(formData: FormData) {
  const approve = field(formData, "decision") === "approve";
  await runAndFinish(
    formData,
    { type: "takeover_decide", requestId: field(formData, "requestId"), approve },
    approve ? MESSAGES.takeoverApproved : MESSAGES.takeoverDeclined,
  );
}

export async function markActed(formData: FormData) {
  await runAndFinish(
    formData,
    { type: "acted", outcome: field(formData, "outcome"), note: field(formData, "note") },
    MESSAGES.markedActed,
  );
}

/** Forward, then ask what happens to the mail next (same step as after a reply). */
export async function forwardMail(formData: FormData) {
  const mailId = field(formData, "mailId");
  const returnTo = readReturnTo(formData);
  const to = field(formData, "to");

  try {
    await runMailAction(mailId, { type: "forward", to, note: field(formData, "note") });
  } catch (error) {
    finishWithError(error, returnTo);
  }

  revalidatePath("/inbox");
  redirect(changeUrl(returnTo, { dialog: "sent", sentKind: "forward", sentTo: to }));
}

export async function changeCategory(formData: FormData) {
  await runAndFinish(
    formData,
    { type: "recategorize", categoryId: field(formData, "categoryId"), reason: field(formData, "reason") },
    MESSAGES.categoryChanged,
  );
}

export async function blockSender(formData: FormData) {
  await runAndFinish(formData, { type: "block" }, MESSAGES.senderBlocked);
}

export async function deleteMail(formData: FormData) {
  await runAndFinish(formData, { type: "delete" }, MESSAGES.mailDeleted);
}

export async function restoreMail(formData: FormData) {
  await runAndFinish(formData, { type: "restore" }, MESSAGES.mailRestored);
}

export async function reopenMail(formData: FormData) {
  await runAndFinish(formData, { type: "reopen" }, MESSAGES.mailReopened);
}

export async function addInternalNote(formData: FormData) {
  await runAndFinish(formData, { type: "note", text: field(formData, "text") || field(formData, "body") }, MESSAGES.noteAdded);
}
