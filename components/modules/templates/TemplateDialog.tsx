import { getDialogUrls } from "@/lib/dialog";
import { readParam, type SearchParams } from "@/lib/url";
import type { Category, Template } from "@/types/mailbox";
import DeleteTemplateDialog from "./DeleteTemplateDialog";
import TemplateForm from "./TemplateForm";
import { TEMPLATES_PATH } from "./template-params";

interface TemplateDialogProps {
  params: SearchParams;
  templates: Template[];
  categories: Category[];
}

/** Picks the form or dialog named by ?dialog= (new, edit, delete). Shows nothing for an unknown one. */
export default function TemplateDialog({ params, templates, categories }: TemplateDialogProps) {
  const dialog = readParam(params, "dialog");
  const template = templates.find((item) => item.id === readParam(params, "id"));
  const urls = getDialogUrls(TEMPLATES_PATH, params);

  if (dialog === "new") return <TemplateForm categories={categories} params={params} {...urls} />;
  if (dialog === "edit" && template) return <TemplateForm template={template} categories={categories} params={params} {...urls} />;
  if (dialog === "delete" && template) return <DeleteTemplateDialog template={template} {...urls} />;
  return null;
}
