"use server";

import { createTemplate, deleteTemplate, updateTemplate } from "@/services/templates";
import { MESSAGES } from "@/lib/messages";
import { finishWithNotice, readReturnTo } from "./action-helpers";
import { getClosedUrl } from "@/lib/dialog";
import { finishWithFormError } from "./admin-helpers";

/** Add (no id) or edit (with id) a reply template. */
export async function saveTemplate(formData: FormData) {
  const returnTo = readReturnTo(formData, "/templates");
  const templateId = String(formData.get("templateId") ?? "");
  const input = {
    name: String(formData.get("name") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    body: String(formData.get("body") ?? ""),
  };
  const draft = { draftName: input.name, draftBody: input.body, draftCategory: input.categoryId ?? "" };

  try {
    if (templateId) await updateTemplate(templateId, input);
    else await createTemplate(input);
  } catch (error) {
    finishWithFormError(error, returnTo, draft);
  }
  finishWithNotice(getClosedUrl(returnTo), templateId ? MESSAGES.templateSaved : MESSAGES.templateAdded);
}

export async function deleteTemplateById(formData: FormData) {
  const returnTo = readReturnTo(formData, "/templates");
  try {
    await deleteTemplate(String(formData.get("templateId") ?? ""));
  } catch (error) {
    finishWithFormError(error, returnTo, {});
  }
  finishWithNotice(getClosedUrl(returnTo), MESSAGES.templateDeleted);
}
