import Link from "next/link";
import { redirect } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import AppShell from "@/components/layout/AppShell";
import { getNotice } from "@/lib/notice";
import { changeUrl, type SearchParams } from "@/lib/url";
import { getAlerts } from "@/services/alerts";
import { getCurrentUser } from "@/services/users";
import AlertItem from "./AlertItem";

interface AlertsPageProps {
  searchParams: Promise<SearchParams>;
}

const ALERTS_PATH = "/alerts";

/** The alerts outbox: what the system would post to the team channel or email to the Owner. */
export default async function AlertsPage({ searchParams: searchParamsPromise }: AlertsPageProps) {
  const params = await searchParamsPromise;
  const currentUser = await getCurrentUser();

  // Viewers get no alerts at all.
  if (currentUser.role === "viewer") {
    redirect(changeUrl("/inbox", { notice: "Alerts are only for the support team.", noticeTone: "error" }));
  }

  const alerts = await getAlerts();

  return (
    <AppShell activePath={ALERTS_PATH} notice={getNotice(ALERTS_PATH, params)}>
      <Link href="/inbox" className="shrink-0 text-[13px] font-semibold text-brand">
        &larr; Back to inbox
      </Link>
      <PageHeader
        title="Alerts"
        subtitle={
          currentUser.role === "owner"
            ? "Messages and emails the system sends, newest first: team channel, breach alerts and the daily digest."
            : "Messages the system posts to the team channel, newest first."
        }
      />

      {alerts.length === 0 ? (
        <EmptyState icon="check" title="No alerts yet" message="Alerts appear here when a high-urgency mail arrives or an SLA is breached." />
      ) : (
        <div className="flex shrink-0 flex-col items-start gap-4">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
