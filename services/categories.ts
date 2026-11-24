import type { CategoriesResponse } from "@/types/api";
import type { CategoryInput, MergeCategoriesInput } from "@/types/admin";
import type { Category } from "@/types/mailbox";
import { cache } from "react";
import { request, toQueryString } from "./http";

/** Cached for one page render, so every filter and dialog shares one call. */
export const getCategories = cache(async () => {
  const { categories } = await request<CategoriesResponse>("/categories");
  return categories;
});

export function createCategory(input: CategoryInput) {
  return request<{ category: Category }>("/categories", { method: "POST", body: input });
}

export function updateCategory(categoryId: string, input: Partial<CategoryInput>) {
  return request<{ category: Category }>(`/categories/${categoryId}`, { method: "PUT", body: input });
}

/** Retire a category. With moveMails its mails go to "Needs review". */
export function retireCategory(categoryId: string, moveMails: boolean) {
  return request<{ ok: true; moved: number }>(`/categories/${categoryId}${toQueryString({ recategorize: moveMails ? 1 : undefined })}`, {
    method: "DELETE",
  });
}

export function mergeCategories(input: MergeCategoriesInput) {
  return request<{ ok: true; moved: number }>("/categories/merge", { method: "POST", body: input });
}

export interface CategorySuggestion {
  name: string;
  count: number;
  mailIds: string[];
  /** One line that says what the mails are about (becomes the category's "typical mail"). */
  typical: string;
  examples: Array<{ id: string; subject: string }>;
}

/** New categories the AI proposes for mails that keep landing in "Needs review" (AI-09, Owner only). */
export async function getCategorySuggestions() {
  const { suggestions } = await request<{ suggestions: CategorySuggestion[] }>("/categories/suggestions");
  return suggestions;
}
