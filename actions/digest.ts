"use server";

import { finishWithError, finishWithNotice, readReturnTo } from "@/actions/action-helpers";
import { MESSAGES } from "@/lib/messages";
import { sendDailyDigest } from "@/services/alerts";

/** "Send digest now" (Platform Owner): the daily summary lands in the alerts straight away. */
export async function sendDigestNow(formData: FormData) {
  const returnTo = readReturnTo(formData, "/alerts");
  try {
    await sendDailyDigest();
  } catch (error) {
    return finishWithError(error, returnTo);
  }
  return finishWithNotice(returnTo, MESSAGES.digestSent);
}
