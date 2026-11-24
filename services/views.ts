import { cache } from "react";
import type { SavedView } from "@/types/mailbox";
import { request } from "./http";

/** The signed-in person's saved inbox views. Cached for one page render. */
export const getSavedViews = cache(async () => {
  const { views } = await request<{ views: SavedView[] }>("/views");
  return views;
});

export function saveView(name: string, query: string) {
  return request<{ view: SavedView }>("/views", { method: "POST", body: { name, query } });
}

export function deleteSavedView(viewId: string) {
  return request<{ ok: true }>(`/views/${viewId}`, { method: "DELETE" });
}
