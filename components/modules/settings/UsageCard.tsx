import { cn } from "@/lib/cn";
import type { AiUsage } from "@/services/settings";
import type { AiSettings } from "@/types/mailbox";

interface UsageCardProps {
  usage: AiUsage;
  settings: AiSettings;
}

const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** This month's AI usage against the budget, with the alert level marked on the bar. */
export default function UsageCard({ usage, settings }: UsageCardProps) {
  const percent = Math.min(100, usage.percentOfBudget);
  const overAlert = usage.percentOfBudget >= settings.budgetAlertPercent;

  return (
    <section className="border border-card-line bg-card p-5">
      <h2 className="text-[15px] font-semibold">AI usage this month</h2>
      <p className="mt-1 text-[13px] text-ink-3">Tokens and cost per month, with a warning when the budget runs low.</p>

      <p className="mt-5 text-4xl leading-none font-light">{money(usage.costUsd)}</p>
      <p className="mt-1.5 text-[13px] text-ink-3">
        of {money(usage.budgetUsd)} budget · {usage.percentOfBudget}% used
      </p>

      <div className="relative mt-4 h-2 bg-chart-track">
        <div className={cn("h-2 transition-[width] duration-500 ease-out", overAlert ? "bg-brand" : "bg-ok")} style={{ width: `${percent}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 bg-ink" style={{ left: `${settings.budgetAlertPercent}%` }} title={`Alert at ${settings.budgetAlertPercent}%`} />
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">Alert at {settings.budgetAlertPercent}% (the dark mark)</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-line-soft pt-4 text-[13px]">
        <div>
          <dt className="text-ink-muted">Mails sorted</dt>
          <dd className="mt-0.5 text-lg font-semibold">{usage.mails}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Tokens used</dt>
          <dd className="mt-0.5 text-lg font-semibold">{usage.tokens.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Tokens per mail</dt>
          <dd className="mt-0.5 text-lg font-semibold">{usage.tokensPerMail.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Status</dt>
          <dd className={cn("mt-0.5 text-lg font-semibold", overAlert ? "text-brand-dark" : "text-ok-dark")}>
            {overAlert ? "Over alert level" : "Within budget"}
          </dd>
        </div>
      </dl>

      {usage.isEstimate && (
        <p className="mt-4 text-xs text-ink-muted">Estimated from the number of mails and replies. The real system reads exact token counts from Azure OpenAI.</p>
      )}
    </section>
  );
}
