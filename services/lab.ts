import type { LabResult, LabState } from "@/types/alerts";
import { request } from "./http";

/** Play one scenario on the dummy server (dev only). */
export function runScenario(body: Record<string, unknown>) {
  return request<LabResult>("/sim", { method: "POST", body });
}

/** Current switches (sync down, send fails, delay) and how far the clock was moved. */
export function getLabState() {
  return request<LabState>("/sim", { method: "POST", body: { type: "state" } });
}
