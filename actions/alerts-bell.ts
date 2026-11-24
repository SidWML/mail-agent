"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ALERTS_SEEN_COOKIE } from "@/lib/alerts-cookie";
import { getAlerts } from "@/services/alerts";

/** "Mark all as read": remember the time of the newest alert this person has now seen, then stay on the same page. */
export async function markAlertsRead() {
  const alerts = await getAlerts();
  const newest = alerts.reduce((latest, alert) => (alert.at > latest ? alert.at : latest), "");
  if (newest) {
    const store = await cookies();
    store.set(ALERTS_SEEN_COOKIE, newest, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  }
  const referer = (await headers()).get("referer");
  const page = referer ? new URL(referer) : undefined;
  redirect(page ? page.pathname + page.search : "/inbox");
}
