"use server";

import { finishWithError, finishWithNotice, readReturnTo } from "@/actions/action-helpers";
import { LAB_FLAGS, LAB_GROUPS, RESET_SCENARIO } from "@/lib/lab-scenarios";
import { runScenario } from "@/services/lab";

const ALL_SCENARIOS = [...LAB_GROUPS.flatMap((group) => group.scenarios), RESET_SCENARIO];

/** Scenario lab button (dev only, dummy backend): play one scenario, then come back with a notice. */
export async function runLabScenario(formData: FormData) {
  const returnTo = readReturnTo(formData, "/lab");
  const scenario = ALL_SCENARIOS.find((item) => item.key === String(formData.get("scenario")));
  if (!scenario) return finishWithNotice(returnTo, "Unknown scenario.", "error");

  let message: string;
  try {
    const result = await runScenario(scenario.body);
    message = result.message ?? `${scenario.label} done.`;
  } catch (error) {
    return finishWithError(error, returnTo);
  }
  return finishWithNotice(returnTo, message);
}

/** Turn one switch (sync down, send fails, delay) on or off. The form sends the new value. */
export async function setLabFlag(formData: FormData) {
  const returnTo = readReturnTo(formData, "/lab");
  const flag = LAB_FLAGS.find((item) => item.flag === String(formData.get("flag")));
  if (!flag) return finishWithNotice(returnTo, "Unknown switch.", "error");
  const turnOn = formData.get("value") === "on";

  try {
    await runScenario({ type: "flags", flags: { [flag.flag]: turnOn } });
  } catch (error) {
    return finishWithError(error, returnTo);
  }
  return finishWithNotice(returnTo, `${flag.label} is now ${turnOn ? "on" : "off"}.`);
}
