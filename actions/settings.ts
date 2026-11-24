"use server";

import { redirect } from "next/navigation";
import { changeUrl } from "@/lib/url";
import { ApiError } from "@/services/http";
import { saveSettings } from "@/services/settings";
import { finishWithNotice, readReturnTo } from "./action-helpers";

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

/** Save the AI settings. A mistake in a field is shown as a message and nothing is saved. */
export async function saveAiSettings(formData: FormData) {
  const returnTo = readReturnTo(formData, "/settings");

  try {
    await saveSettings({
      confidenceThreshold: Number(field(formData, "confidenceThreshold")),
      classificationPrompt: field(formData, "classificationPrompt"),
      summaryPrompt: field(formData, "summaryPrompt"),
      draftPrompt: field(formData, "draftPrompt"),
      monthlyBudgetUsd: Number(field(formData, "monthlyBudgetUsd")),
      budgetAlertPercent: Number(field(formData, "budgetAlertPercent")),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      redirect(changeUrl(returnTo, { notice: error.message, noticeTone: "error" }));
    }
    throw error;
  }
  finishWithNotice(returnTo, "Settings saved. The change is in the audit log.");
}
