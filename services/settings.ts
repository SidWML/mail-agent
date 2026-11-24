import { cache } from "react";
import type { AiSettings } from "@/types/mailbox";
import { request } from "./http";

export interface AiUsage {
  month: string;
  mails: number;
  tokens: number;
  costUsd: number;
  budgetUsd: number;
  percentOfBudget: number;
  tokensPerMail: number;
  /** True while the figures are estimated from mail volume (the dummy server has no real token counts). */
  isEstimate: boolean;
}

export interface SettingsResponse {
  settings: AiSettings;
  usage: AiUsage;
}

/** The AI settings and this month's AI usage. Cached for one page render. */
export const getSettings = cache(() => request<SettingsResponse>("/settings"));

export function saveSettings(changes: Partial<AiSettings>) {
  return request<SettingsResponse>("/settings", { method: "PUT", body: changes });
}
