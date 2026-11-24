import type { Alert } from "./mailbox";

export interface AlertsResponse {
  alerts: Alert[];
}

/** The scenario switches the dummy server keeps (read with POST /api/sim {type:"state"}). */
export interface LabState {
  flags: { syncDown: boolean; sendFails: boolean; latency: boolean };
  offsetHours: number;
  unassignedNew: number;
}

export interface LabResult {
  ok: boolean;
  message?: string;
}
