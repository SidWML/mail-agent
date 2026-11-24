import { cache } from "react";
import type { AlertsResponse } from "@/types/alerts";
import { request } from "./http";

/** The alerts outbox, newest first. Support team sees team alerts, the Owner sees all. Cached for one page render. */
export const getAlerts = cache(async () => {
  const { alerts } = await request<AlertsResponse>("/alerts");
  return alerts;
});
