"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MESSAGES } from "@/lib/messages";
import { encodeNotice } from "@/lib/notice";
import { changeUrl } from "@/lib/url";
import { USER_COOKIE } from "@/services/http";
import { getUsers } from "@/services/users";

/** Demo persona switcher: remember who is "signed in", then go back to the inbox. */
export async function switchUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const name = (await getUsers()).find((user) => user.id === userId)?.name ?? "this person";
  const store = await cookies();
  store.set(USER_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax" });
  redirect(changeUrl("/inbox", { notice: encodeNotice(MESSAGES.switchedUser(name)), noticeTone: "info" }));
}
