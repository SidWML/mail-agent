import { redirect } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import AppShell from "@/components/layout/AppShell";
import { getNotice } from "@/lib/notice";
import { changeUrl, getCurrentUrl, type SearchParams } from "@/lib/url";
import { getSettings } from "@/services/settings";
import { getCurrentUser } from "@/services/users";
import SettingsForm from "./SettingsForm";
import UsageCard from "./UsageCard";

const SETTINGS_PATH = "/settings";

interface SettingsPageProps {
  searchParams: Promise<SearchParams>;
}

/** AI settings (Platform Owner): confidence threshold, prompts and budget, changed without a release. */
export default async function SettingsPage({ searchParams: searchParamsPromise }: SettingsPageProps) {
  const params = await searchParamsPromise;
  const currentUser = await getCurrentUser();

  if (currentUser.role !== "owner") {
    redirect(changeUrl("/inbox", { notice: "Only the Platform Owner can open the AI settings.", noticeTone: "error" }));
  }

  const { settings, usage } = await getSettings();

  return (
    <AppShell activePath={SETTINGS_PATH} notice={getNotice(SETTINGS_PATH, params)}>
      <PageHeader
        title="AI settings"
        subtitle="Change how the AI sorts, summarises and drafts, and how much it may cost, without a release. Every change is in the audit log."
      />
      <div className="grid grid-cols-12 items-start gap-5 pb-4">
        <div className="col-span-12 lg:col-span-8">
          <SettingsForm settings={settings} returnTo={getCurrentUrl(SETTINGS_PATH, params)} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UsageCard usage={usage} settings={settings} />
        </div>
      </div>
    </AppShell>
  );
}
