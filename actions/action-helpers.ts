import { redirect } from "next/navigation";
import { MESSAGES, type Message } from "@/lib/messages";
import { encodeNotice, type NoticeTone } from "@/lib/notice";
import { changeUrl } from "@/lib/url";
import { ApiError } from "@/services/http";

/** Where to go back to after an action. Only local paths are accepted. */
export function readReturnTo(formData: FormData, fallback = "/inbox") {
  const value = String(formData.get("returnTo") ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

/** Go back to the page, close any dialog, and show a one-time notice. */
export function finishWithNotice(returnTo: string, message: Message, tone: NoticeTone = "success"): never {
  redirect(
    changeUrl(returnTo, {
      // Close any dialog and forget what it was about.
      dialog: undefined,
      target: undefined,
      ids: undefined,
      owner: undefined,
      rejected: undefined,
      sentKind: undefined,
      sentTo: undefined,
      tplq: undefined,
      assignTeam: undefined,
      outcome: undefined,
      notice: encodeNotice(message),
      noticeTone: tone === "success" ? undefined : tone,
    }),
  );
}

/**
 * Turn an API error into the right screen:
 * ALREADY_CLAIMED -> conflict dialog, SEND_FAILED -> send-failed dialog, RESTORE_EXPIRED -> expired dialog,
 * STALE -> refresh with a notice, anything else -> an error notice with the server's message.
 */
export function finishWithError(error: unknown, returnTo: string): never {
  if (!(error instanceof ApiError)) throw error;

  switch (error.code) {
    case "ALREADY_CLAIMED":
      redirect(changeUrl(returnTo, { dialog: "conflict", owner: String(error.details.ownerName ?? "") }));
    case "SEND_FAILED":
      redirect(changeUrl(returnTo, { dialog: "send-failed" }));
    case "RESTORE_EXPIRED":
      redirect(changeUrl(returnTo, { dialog: "restore-expired" }));
    case "STALE":
      return finishWithNotice(returnTo, MESSAGES.changedByOthers, "error");
    case "NO_MAILBOX_ACCESS":
      redirect("/access-denied");
    default:
      // A mistake in the form (missing reason, bad address...): show the message and keep the dialog open.
      if (error.status === 400) redirect(changeUrl(returnTo, { notice: encodeNotice(MESSAGES.formProblem(error.message)), noticeTone: "error" }));
      return finishWithNotice(returnTo, MESSAGES.failed(error.message), "error");
  }
}
