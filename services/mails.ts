import type {
  AiDraftResponse,
  BulkResult,
  MailDetailResponse,
  MailListQuery,
  MailListResponse,
  TemplatesResponse,
} from "@/types/api";
import { cache } from "react";
import { request, toQueryString } from "./http";

// Reads are cached for one page render: asking twice for the same list or mail makes one call.
const fetchMails = cache((queryString: string) => request<MailListResponse>(`/mails${queryString}`));
const fetchMail = cache((mailId: string) => request<MailDetailResponse>(`/mails/${mailId}`));

export function getMails(query: MailListQuery = {}) {
  return fetchMails(toQueryString({ ...query }));
}

/** One mail with its thread, what you may do with it, and who is replying. */
export function getMail(mailId: string) {
  return fetchMail(mailId);
}

/** One endpoint runs every mail button: claim, assign, reply, acted, delete, restore... */
export function runMailAction(mailId: string, action: { type: string; [field: string]: unknown }) {
  return request<{ ok: true }>(`/mails/${mailId}/actions`, { method: "POST", body: action });
}

/** Same action on up to 100 mails. Mails that are not allowed are reported in `failed`. */
export function runBulkAction(mailIds: string[], action: string, payload: Record<string, unknown> = {}) {
  return request<BulkResult>("/mails/bulk", { method: "POST", body: { ids: mailIds, action, ...payload } });
}

/** Draft reply written by the AI. Never sent automatically. */
export function getAiDraft(mailId: string) {
  return request<AiDraftResponse>("/ai/draft", { method: "POST", body: { mailId } });
}

export async function getReplyTemplates() {
  const { templates } = await request<TemplatesResponse>("/templates");
  return templates;
}

export interface TranslationResult {
  text: string;
  language: string;
  from: string;
  /** How many sentences the demo translator knew. 0 means the text came back unchanged. */
  translatedParts: number;
}

/** Translate one message of a mail (demo translator on the dummy server). */
export function translateMessage(mailId: string, messageId: string, language: string) {
  return request<TranslationResult>("/ai/translate", { method: "POST", body: { mailId, messageId, to: language } });
}
