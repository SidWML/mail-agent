"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_COOKIE } from "@/services/http";

/** Demo persona switcher: remember who is "signed in", then go back to the inbox. */
export async function switchUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const store = await cookies();
  store.set(USER_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax" });
  redirect("/inbox");
}
