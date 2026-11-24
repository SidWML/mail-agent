import type { TemplateInput, TemplatesResponse } from "@/types/admin";
import type { Template } from "@/types/mailbox";
import { request } from "./http";

export async function getTemplates() {
  const { templates } = await request<TemplatesResponse>("/templates");
  return templates;
}

export function createTemplate(input: TemplateInput) {
  return request<{ template: Template }>("/templates", { method: "POST", body: input });
}

export function updateTemplate(templateId: string, input: TemplateInput) {
  return request<{ template: Template }>(`/templates/${templateId}`, { method: "PUT", body: input });
}

export function deleteTemplate(templateId: string) {
  return request<{ ok: true }>(`/templates/${templateId}`, { method: "DELETE" });
}
