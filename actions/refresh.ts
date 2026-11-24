"use server";

import { redirect, RedirectType } from "next/navigation";
import { finishWithError, readReturnTo } from "@/actions/action-helpers";
import { formatClockTime } from "@/lib/format";
import { MESSAGES } from "@/lib/messages";
import { encodeNotice } from "@/lib/notice";
import { changeUrl } from "@/lib/url";
import { getMails } from "@/services/mails";

/**
 * Refresh (button or timer): load the page again and say what changed.
 * The timer (auto = 1) stays quiet unless there is something to tell, so it never nags.
 */
export async function refreshPage(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const isAutomatic = formData.get("auto") === "1";
  const knownCount = formData.get("knownCount") === null ? NaN : Number(formData.get("knownCount"));
  const syncedAt = String(formData.get("syncedAt") ?? "");
  const syncedLabel = syncedAt ? formatClockTime(syncedAt) : "";

  let fresh;
  try {
    fresh = await getMails({ tab: "all", pageSize: 1 });
  } catch (error) {
    return finishWithError(error, returnTo);
  }

  const newCount = Number.isNaN(knownCount) ? 0 : fresh.counts.all - knownCount;
  const go = (message: Parameters<typeof encodeNotice>[0], tone?: "error" | "info") =>
    redirect(changeUrl(returnTo, { notice: encodeNotice(message), noticeTone: tone }), RedirectType.replace);

  if (fresh.syncDown) return go(MESSAGES.syncDelayed(formatClockTime(fresh.lastSync)), "error");
  if (newCount > 0) return go(MESSAGES.newMail(newCount));
  if (isAutomatic) redirect(returnTo, RedirectType.replace);
  if (Number.isNaN(knownCount)) return go(MESSAGES.dashboardRefreshed(formatClockTime(fresh.lastSync)), "info");
  return go(MESSAGES.upToDate(syncedLabel), "info");
}
