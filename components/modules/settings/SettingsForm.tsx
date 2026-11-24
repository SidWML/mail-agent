import { saveAiSettings } from "@/actions/settings";
import ActionFields from "@/components/common/ActionFields";
import Button from "@/components/ui/Button";
import FormField, { TextArea, TextInput } from "@/components/ui/FormField";
import type { AiSettings } from "@/types/mailbox";

interface SettingsFormProps {
  settings: AiSettings;
  /** Address to come back to after saving. */
  returnTo: string;
  /** Share of this period's mails that are below the current threshold (shows what a change would do). */
  needsReviewPercent?: number;
}

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="border border-card-line bg-card p-5">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <p className="mt-1 text-[13px] text-ink-3">{text}</p>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** The editable AI settings. Everything saves together; the server checks each value. */
export default function SettingsForm({ settings, returnTo, needsReviewPercent }: SettingsFormProps) {
  return (
    <form action={saveAiSettings} className="flex flex-col gap-5">
      <ActionFields returnTo={returnTo} />

      <Section title="Sorting" text="How the AI picks a category, and when it should ask a person to check.">
        <FormField
          label="Confidence threshold"
          hint={`Mails the AI is less sure about than this are marked “Needs review”. Default 0.6.${needsReviewPercent !== undefined ? ` Right now ${needsReviewPercent}% of mails are marked.` : ""}`}
        >
          <TextInput
            type="number"
            name="confidenceThreshold"
            min={0.1}
            max={0.95}
            step={0.05}
            defaultValue={settings.confidenceThreshold}
            required
            className="max-w-[140px]"
          />
        </FormField>
        <FormField label="Sorting instruction (prompt)" hint="Mail text is always treated as untrusted data: the AI cannot take actions on its own.">
          <TextArea name="classificationPrompt" defaultValue={settings.classificationPrompt} required className="min-h-[110px]" />
        </FormField>
      </Section>

      <Section title="Summaries and drafts" text="What the AI writes for the list, the detail view and reply drafts.">
        <FormField label="Summary instruction (prompt)">
          <TextArea name="summaryPrompt" defaultValue={settings.summaryPrompt} required className="min-h-[90px]" />
        </FormField>
        <FormField label="Reply draft instruction (prompt)" hint="A draft is never sent without a person clicking Send.">
          <TextArea name="draftPrompt" defaultValue={settings.draftPrompt} required className="min-h-[110px]" />
        </FormField>
      </Section>

      <Section title="Budget" text="A monthly limit for AI cost, with a warning before it is used up.">
        <div className="flex flex-wrap gap-5">
          <FormField label="Monthly budget (US dollars)">
            <TextInput type="number" name="monthlyBudgetUsd" min={1} step={1} defaultValue={settings.monthlyBudgetUsd} required className="w-[170px]" />
          </FormField>
          <FormField label="Warn me at (percent of budget)">
            <TextInput type="number" name="budgetAlertPercent" min={10} max={100} step={5} defaultValue={settings.budgetAlertPercent} required className="w-[170px]" />
          </FormField>
        </div>
      </Section>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" large>
          Save settings
        </Button>
        <span className="text-[12.5px] text-ink-muted">Changes apply to new mails straight away and are written to the audit log.</span>
      </div>
    </form>
  );
}
