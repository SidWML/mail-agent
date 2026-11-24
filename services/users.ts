import { cache } from "react";
import type { UsersResponse } from "@/types/api";
import { getCurrentUserId, request } from "./http";

/** The people list. Cached for one page render, so the header, the filters and the dialogs share one call. */
export const getUsers = cache(async () => {
  const { users } = await request<UsersResponse>("/me");
  return users;
});

export async function getCurrentUser() {
  const [users, currentUserId] = await Promise.all([getUsers(), getCurrentUserId()]);
  return users.find((user) => user.id === currentUserId) ?? users[0];
}
