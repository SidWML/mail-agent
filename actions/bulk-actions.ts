"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MESSAGES } from "@/lib/messages";
import { changeUrl } from "@/lib/url";
import { runBulkAction } from "@/services/mails";
import { finishWithError, finishWithNotice, readReturnTo } from "./action-helpers";

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

const BULK_LABELS: Record<string, string> = {
  acted: "marked as acted",
  assign: "assigned",
  recategorize: "moved to a new category",
  delete: "deleted",
};

/** First step: the ticked rows and the chosen button open the confirmation dialog. */
export async function startBulkAction(bulkAction: string, formData: FormData) {
  const returnTo = readReturnTo(formData);
  const mailIds = formData.getAll("mailId").map(String);

  if (mailIds.length === 0) finishWithNotice(returnTo, MESSAGES.tickOneMail, "error");
  if (mailIds.length > 100) finishWithNotice(returnTo, MESSAGES.tooManyMails, "error");

  redirect(changeUrl(returnTo, { dialog: `bulk-${bulkAction}`, ids: mailIds.join(",") }));
}

/** Second step: run the action on every selected mail and report what was skipped and why. */
export async function confirmBulkAction(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const mailIds = field(formData, "ids").split(",").filter(Boolean);
  const action = field(formData, "bulkAction");

  const payload: Record<string, unknown> =
    action === "acted"
      ? { outcome: field(formData, "outcome"), note: field(formData, "note") }
      : action === "assign"
        ? { userId: field(formData, "userId") }
        : action === "recategorize"
          ? { categoryId: field(formData, "categoryId"), reason: field(formData, "reason") }
          : {};

  let result;
  try {
    result = await runBulkAction(mailIds, action, payload);
  } catch (error) {
    finishWithError(error, changeUrl(returnTo, { ids: undefined }));
  }

  revalidatePath("/inbox");
  const label = BULK_LABELS[action] ?? "updated";
  const reasons = [...new Set(result.failed.map((item) => item.reason))];
  finishWithNotice(
    changeUrl(returnTo, { ids: undefined }),
    result.done.length === 0 ? MESSAGES.bulkNothingDone(reasons) : MESSAGES.bulkDone(result.done.length, label, reasons, result.failed.length),
    result.done.length === 0 ? "error" : "success",
  );
}
