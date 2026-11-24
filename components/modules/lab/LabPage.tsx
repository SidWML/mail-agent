import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import AppShell from "@/components/layout/AppShell";
import { LAB_GROUPS, RESET_SCENARIO } from "@/lib/lab-scenarios";
import { getNotice } from "@/lib/notice";
import type { SearchParams } from "@/lib/url";
import { getLabState } from "@/services/lab";
import LabFlagRow from "./LabFlagRow";
import LabScenarioGroup from "./LabScenarioGroup";
import LabScenarioRow from "./LabScenarioRow";

interface LabPageProps {
  searchParams: Promise<SearchParams>;
}

const LAB_PATH = "/lab";

/** Demo page: play the situations from the requirements against the dummy API. */
export default async function LabPage({ searchParams: searchParamsPromise }: LabPageProps) {
  const params = await searchParamsPromise;
  const state = await getLabState();

  return (
    <AppShell activePath={LAB_PATH} notice={getNotice(LAB_PATH, params)}>
      <PageHeader
        title="Scenario lab"
        subtitle="Developer tool for the dummy backend. Each button plays one situation; then check the result in the inbox or the alerts."
      />

      <div className="flex shrink-0 gap-4 text-[13px] font-semibold text-brand">
        <Link href="/inbox">Open inbox</Link>
        <Link href="/alerts">Open alerts</Link>
      </div>

      {LAB_GROUPS.map((group) => (
        <LabScenarioGroup key={group.title} title={group.title}>
          {group.scenarios.map((scenario) => (
            <LabScenarioRow key={scenario.key} scenario={scenario} />
          ))}
        </LabScenarioGroup>
      ))}

      <LabScenarioGroup title="Switches">
        <LabFlagRow flag="syncDown" isOn={state.flags.syncDown} />
        <LabFlagRow flag="sendFails" isOn={state.flags.sendFails} />
        <LabFlagRow flag="latency" isOn={state.flags.latency} />
      </LabScenarioGroup>

      <LabScenarioGroup title="Start over">
        <LabScenarioRow scenario={RESET_SCENARIO} />
      </LabScenarioGroup>

      <p className="shrink-0 pb-2 text-xs text-ink-muted">
        Clock moved forward by {state.offsetHours} h. Unassigned new mails: {state.unassignedNew}.
      </p>
    </AppShell>
  );
}
