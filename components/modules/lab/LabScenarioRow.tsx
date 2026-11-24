import { runLabScenario } from "@/actions/lab";
import Button from "@/components/ui/Button";
import type { LabScenario } from "@/lib/lab-scenarios";

interface LabScenarioRowProps {
  scenario: LabScenario;
}

/** One button and the line that says what it proves. */
export default function LabScenarioRow({ scenario }: LabScenarioRowProps) {
  return (
    <form action={runLabScenario} className="flex items-center gap-4 px-5 py-2.5">
      <input type="hidden" name="scenario" value={scenario.key} />
      <input type="hidden" name="returnTo" value="/lab" />
      <Button type="submit" variant="outline" className="w-[220px]">
        {scenario.label}
      </Button>
      <p className="text-[13px] text-ink-3">{scenario.proves}</p>
    </form>
  );
}
