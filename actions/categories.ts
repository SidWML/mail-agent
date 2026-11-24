"use server";

import { createCategory, mergeCategories, retireCategory, updateCategory } from "@/services/categories";
import { runBulkAction } from "@/services/mails";
import { MESSAGES } from "@/lib/messages";
import { finishWithNotice, readReturnTo } from "./action-helpers";
import { getClosedUrl } from "@/lib/dialog";
import { finishWithFormError } from "./admin-helpers";

/** Add (no id) or edit (with id) a category. */
export async function saveCategory(formData: FormData) {
  const returnTo = readReturnTo(formData, "/categories");
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "");
  const input = {
    name,
    typical: String(formData.get("typical") ?? ""),
    slaHours: Number(formData.get("slaHours")),
    active: formData.get("active") === "on",
    recategorize: formData.get("recategorize") === "on",
  };
  const draft = { draftName: name, draftTypical: input.typical, draftSla: String(formData.get("slaHours") ?? "") };

  try {
    if (categoryId) {
      await updateCategory(categoryId, input);
    } else {
      const { category } = await createCategory(input);
      // The API always creates an active category; switch it off if the form asked for that.
      if (!input.active) await updateCategory(category.id, { active: false });
    }
  } catch (error) {
    finishWithFormError(error, returnTo, draft);
  }
  finishWithNotice(getClosedUrl(returnTo), categoryId ? MESSAGES.categorySaved : MESSAGES.categoryAdded);
}

export async function mergeCategoryList(formData: FormData) {
  const returnTo = readReturnTo(formData, "/categories");
  const sourceIds = formData.getAll("sourceId").map(String);
  const targetId = String(formData.get("targetId") ?? "");

  let moved = 0;
  try {
    ({ moved } = await mergeCategories({ sourceIds, targetId, recategorize: formData.get("recategorize") === "on" }));
  } catch (error) {
    finishWithFormError(error, returnTo, {});
  }
  finishWithNotice(getClosedUrl(returnTo), MESSAGES.categoriesMerged(moved));
}

export async function retireCategoryById(formData: FormData) {
  const returnTo = readReturnTo(formData, "/categories");
  const categoryId = String(formData.get("categoryId") ?? "");

  let moved = 0;
  try {
    ({ moved } = await retireCategory(categoryId, formData.get("recategorize") === "on"));
  } catch (error) {
    finishWithFormError(error, returnTo, {});
  }
  finishWithNotice(
    getClosedUrl(returnTo),
    MESSAGES.categoryRetired(moved),
  );
}

/**
 * Approve an AI-proposed category (AI-09): add it, then move the mails that suggested it into it.
 * The reason is written to the audit log with the move.
 */
export async function approveCategorySuggestion(formData: FormData) {
  const returnTo = readReturnTo(formData, "/categories");
  const name = String(formData.get("name") ?? "");
  const typical = String(formData.get("typical") ?? "");
  const mailIds = String(formData.get("mailIds") ?? "").split(",").filter(Boolean);

  let moved = 0;
  try {
    const { category } = await createCategory({ name, typical, slaHours: 24 });
    if (mailIds.length > 0) {
      const result = await runBulkAction(mailIds, "recategorize", { categoryId: category.id, reason: "AI-suggested category approved by the Platform Owner" });
      moved = result.done.length;
    }
  } catch (error) {
    finishWithFormError(error, returnTo, {});
  }
  finishWithNotice(returnTo, MESSAGES.suggestionApproved(name, moved));
}
