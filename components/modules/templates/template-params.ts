import type { Template } from "@/types/mailbox";

export const TEMPLATES_PATH = "/templates";
export const TEMPLATE_PAGE_SIZE = 8;
export const TEMPLATE_GRID_COLUMNS = "minmax(160px,1fr) minmax(190px,1fr) minmax(260px,2.4fr) minmax(190px,.9fr)";
export const TEMPLATE_READ_ONLY_GRID_COLUMNS = "minmax(160px,1fr) minmax(190px,1fr) minmax(260px,2.4fr)";

/** Sample sender shown in the form preview. */
const PREVIEW_SENDER_NAME = "Markus Weber";

export function getPreviewSenderName() {
  return PREVIEW_SENDER_NAME;
}

/** Fill the two placeholders the way the composer does: first name of the sender and the category name. */
export function fillPlaceholders(template: Pick<Template, "body">, categoryName: string) {
  const firstName = PREVIEW_SENDER_NAME.split(" ")[0];
  return template.body.replaceAll("‹sender name›", firstName).replaceAll("‹category›", categoryName);
}
