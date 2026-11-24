import { cache } from "react";
import { request } from "./http";

export interface Preferences {
  /** The inbox sort this person chose last. */
  sort?: string;
}

/** Choices the server remembers for the signed-in person. Cached for one page render. */
export const getPreferences = cache(async () => {
  const { preferences } = await request<{ preferences: Preferences }>("/preferences");
  return preferences;
});

export function saveSortPreference(sort: string) {
  return request<{ preferences: Preferences }>("/preferences", { method: "PUT", body: { sort } });
}
