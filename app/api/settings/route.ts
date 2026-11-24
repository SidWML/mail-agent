import { handleRoute } from '@/server/handle-route';
import { db, logAudit, now } from '@/server/store';
import { ApiError } from '@/server/actions';
import type { AiSettings } from '@/types/mailbox';

// Rough, blended price used for the demo usage figures: US dollars per 1,000 tokens.
const PRICE_PER_1K_TOKENS = 0.01;
const TOKENS_PER_MAIL = 1800; // classify + summarise + entities
const TOKENS_PER_REPLY = 600; // an AI-assisted reply

// This month's AI usage, estimated from the mails and replies in the dummy data (AI cost control).
function usage() {
  const d = db();
  const startOfMonth = new Date(now());
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const mails = d.mails.filter((m) => new Date(m.receivedAt) >= startOfMonth);
  const replies = mails.reduce((sum, m) => sum + m.thread.filter((x) => x.kind === 'out').length, 0);
  const tokens = mails.length * TOKENS_PER_MAIL + replies * TOKENS_PER_REPLY;
  const costUsd = Math.round((tokens / 1000) * PRICE_PER_1K_TOKENS * 100) / 100;
  return {
    month: startOfMonth.toISOString().slice(0, 7),
    mails: mails.length,
    tokens,
    costUsd,
    budgetUsd: d.settings.monthlyBudgetUsd,
    percentOfBudget: Math.round((costUsd / d.settings.monthlyBudgetUsd) * 100),
    tokensPerMail: mails.length ? Math.round(tokens / mails.length) : 0,
    isEstimate: true,
  };
}

// GET /api/settings  -> { settings, usage }   (staff may read; only the Owner may change)
export const GET = handleRoute('any-staff', async () => ({ settings: db().settings, usage: usage() }));

// PUT /api/settings  body: any of the settings fields
export const PUT = handleRoute(['owner'], async (req, u) => {
  const body = (await req.json()) as Partial<AiSettings>;
  const current = db().settings;
  const next: AiSettings = { ...current };

  if (body.confidenceThreshold !== undefined) {
    const value = Number(body.confidenceThreshold);
    if (!(value >= 0.1 && value <= 0.95)) throw new ApiError(400, 'BAD_THRESHOLD', 'The confidence threshold must be between 0.1 and 0.95.');
    next.confidenceThreshold = Math.round(value * 100) / 100;
  }
  for (const key of ['classificationPrompt', 'summaryPrompt', 'draftPrompt'] as const) {
    if (body[key] !== undefined) {
      const text = String(body[key]).trim();
      if (text.length < 20) throw new ApiError(400, 'PROMPT_TOO_SHORT', 'A prompt needs at least a sentence.');
      next[key] = text;
    }
  }
  if (body.monthlyBudgetUsd !== undefined) {
    const value = Number(body.monthlyBudgetUsd);
    if (!(value > 0)) throw new ApiError(400, 'BAD_BUDGET', 'The monthly budget must be more than 0.');
    next.monthlyBudgetUsd = value;
  }
  if (body.budgetAlertPercent !== undefined) {
    const value = Number(body.budgetAlertPercent);
    if (!(value >= 10 && value <= 100)) throw new ApiError(400, 'BAD_ALERT_PERCENT', 'The budget alert must be between 10 and 100 percent.');
    next.budgetAlertPercent = Math.round(value);
  }

  // Every change is written to the audit log with before and after (FR-29).
  (Object.keys(next) as Array<keyof AiSettings>).forEach((key) => {
    if (next[key] !== current[key]) {
      const short = (value: unknown) => (typeof value === 'string' && value.length > 60 ? value.slice(0, 57) + '…' : String(value));
      logAudit(u, 'Settings changed', undefined, `${key}: ${short(current[key])}`, `${key}: ${short(next[key])}`);
    }
  });
  db().settings = next;
  return { settings: next, usage: usage() };
});
