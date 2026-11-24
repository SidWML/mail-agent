import type { AuditQuery, AuditResponse } from "@/types/admin";
import { request, toQueryString } from "./http";

export function getAuditLog(query: AuditQuery = {}) {
  return request<AuditResponse>(`/audit${toQueryString({ ...query })}`);
}
