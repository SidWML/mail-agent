"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
async function runAndFinish(formData: FormData, action: MailAction, successMessage: string) {
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
  await runAndFinish(formData, { type: "claim" }, "You took this mail. Replying is now open to you.");
}

/** Platform Owner: give the mail to a team member (also used to reassign). */
export async function assignMail(formData: FormData) {
  const userId = field(formData, "userId");
  const users = await getUsers();
  const name = users.find((user) => user.id === userId)?.name ?? "the team member";
  await runAndFinish(formData, { type: "assign", userId }, `Mail assigned to ${name}.`);
}

/** Platform Owner: take over someone else's mail. */
export async function assignMailToMe(formData: FormData) {
  await runAndFinish(formData, { type: "assign_to_me" }, "Assigned to you. You can reply now.");
}

export async function requestTakeover(formData: FormData) {
  await runAndFinish(
    formData,
    { type: "takeover_request", reason: field(formData, "reason") },
    "Takeover request sent to the owner.",
  );
}

/** The owner answers a takeover request. */
export async function decideTakeover(formData: FormData) {
  const approve = field(formData, "decision") === "approve";
  await runAndFinish(
    formData,
    { type: "takeover_decide", requestId: field(formData, "requestId"), approve },
    approve ? "Takeover approved. The mail has a new owner." : "Takeover declined. You stay the owner.",
  );
}

export async function markActed(formData: FormData) {
  await runAndFinish(
    formData,
    { type: "acted", outcome: field(formData, "outcome"), note: field(formData, "note") },
    "Mail marked as acted. It moved to Acted / Closed.",
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
    "Category changed. The reason is in the audit log.",
  );
}

export async function blockSender(formData: FormData) {
  await runAndFinish(formData, { type: "block" }, "Sender blocked. The mail was marked as acted (Spam).");
}

export async function deleteMail(formData: FormData) {
  await runAndFinish(formData, { type: "delete" }, "Mail deleted. You can restore it for 30 days.");
}

export async function restoreMail(formData: FormData) {
  await runAndFinish(formData, { type: "restore" }, "Mail restored.");
}

export async function reopenMail(formData: FormData) {
  await runAndFinish(formData, { type: "reopen" }, "Mail reopened. It is back In progress.");
}

export async function addInternalNote(formData: FormData) {
  await runAndFinish(formData, { type: "note", text: field(formData, "text") || field(formData, "body") }, "Internal note added.");
}
