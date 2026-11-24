"use server";

import { redirect } from "next/navigation";
import { changeUrl } from "@/lib/url";
import { saveSortPreference } from "@/services/preferences";
import { deleteSavedView, saveView } from "@/services/views";
import { SORT_OPTIONS } from "@/components/modules/inbox/inbox-filters";
import { MESSAGES } from "@/lib/messages";
import { encodeNotice } from "@/lib/notice";
import { finishWithError, finishWithNotice, readReturnTo } from "./action-helpers";

/** Address keys that describe the open mail or one-time messages, not the list itself. */
const NOT_PART_OF_A_VIEW = ["mail", "dialog", "target", "preview", "page", "notice", "noticeTone", "ids", "owner", "rejected", "sentKind", "sentTo", "tplq"];

/** Save the current tab, filters and sort under a name (FR-12). */
export async function saveCurrentView(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const name = String(formData.get("name") ?? "").trim();
  const parsed = new URL(returnTo, "http://local");
  NOT_PART_OF_A_VIEW.forEach((key) => parsed.searchParams.delete(key));

  try {
    await saveView(name, parsed.searchParams.toString());
  } catch (error) {
    finishWithError(error, returnTo);
  }
  finishWithNotice(returnTo, MESSAGES.viewSaved(name));
}

export async function removeSavedView(formData: FormData) {
  const returnTo = readReturnTo(formData);
  await deleteSavedView(String(formData.get("viewId") ?? ""));
  finishWithNotice(returnTo, MESSAGES.viewRemoved);
}

/**
 * Sort menu: remember the choice for this person (FR-09), then show the list sorted.
 * Every other field of the form is the current address, kept as hidden inputs.
 */
export async function applySort(formData: FormData) {
  const sort = String(formData.get("sort") ?? "newest");
  await saveSortPreference(sort);

  const query = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || key === "sort" || typeof value !== "string") continue;
    query.append(key, value);
  }
  query.set("sort", sort);
  const label = SORT_OPTIONS.find((option) => option.value === sort)?.short ?? "your choice";
  redirect(changeUrl(`/inbox?${query.toString()}`, { page: undefined, notice: encodeNotice(MESSAGES.sorted(label)), noticeTone: "info" }));
}
