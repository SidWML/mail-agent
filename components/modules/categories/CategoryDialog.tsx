import { getDialogUrls } from "@/lib/dialog";
import { readParam, type SearchParams } from "@/lib/url";
import type { CategoryWithCount } from "@/types/api";
import { CATEGORIES_PATH } from "./category-params";
import CategoryForm from "./CategoryForm";
import MergeCategoriesForm from "./MergeCategoriesForm";
import RetireCategoryDialog from "./RetireCategoryDialog";

interface CategoryDialogProps {
  params: SearchParams;
  categories: CategoryWithCount[];
}

/** Picks the form or dialog named by ?dialog= (new, edit, merge, retire). Shows nothing for an unknown one. */
export default function CategoryDialog({ params, categories }: CategoryDialogProps) {
  const dialog = readParam(params, "dialog");
  const category = categories.find((item) => item.id === readParam(params, "id"));
  const urls = getDialogUrls(CATEGORIES_PATH, params);

  if (dialog === "new") return <CategoryForm params={params} {...urls} />;
  if (dialog === "edit" && category) return <CategoryForm category={category} params={params} {...urls} />;
  if (dialog === "retire" && category && !category.system) return <RetireCategoryDialog category={category} {...urls} />;
  if (dialog === "merge") {
    const mergeable = categories.filter((item) => item.active && !item.system);
    return <MergeCategoriesForm categories={mergeable} {...urls} />;
  }
  return null;
}
