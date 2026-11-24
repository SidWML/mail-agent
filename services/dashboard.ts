import type { DashboardQuery, DashboardResponse } from "@/types/dashboard";
import { request, toQueryString } from "./http";

export function getDashboard(query: DashboardQuery = {}) {
  return request<DashboardResponse>(`/dashboard${toQueryString({ ...query })}`);
}
