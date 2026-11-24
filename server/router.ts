import { NextRequest } from "next/server";

/**
 * Calls the /api route handlers directly, inside the same server function, instead of sending an HTTP request
 * to the app's own address. On a host that runs every route as a separate serverless function, one page would
 * otherwise start six to ten functions (each with a cold start) and the data would not be shared between them.
 * The API routes themselves stay as they are: they are what a real backend would replace.
 */
type Handler = (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<Response>;
type RouteModule = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", Handler>>;

/** Static paths are listed before dynamic ones ([id]) so "/mails/bulk" is not read as a mail id. */
const ROUTES: Array<{ path: string; load: () => Promise<RouteModule> }> = [
  { path: "/ai/draft", load: () => import("@/app/api/ai/draft/route") },
  { path: "/ai/translate", load: () => import("@/app/api/ai/translate/route") },
  { path: "/alerts", load: () => import("@/app/api/alerts/route") },
  { path: "/audit", load: () => import("@/app/api/audit/route") },
  { path: "/categories/merge", load: () => import("@/app/api/categories/merge/route") },
  { path: "/categories/suggestions", load: () => import("@/app/api/categories/suggestions/route") },
  { path: "/categories/[id]", load: () => import("@/app/api/categories/[id]/route") },
  { path: "/categories", load: () => import("@/app/api/categories/route") },
  { path: "/dashboard", load: () => import("@/app/api/dashboard/route") },
  { path: "/digest", load: () => import("@/app/api/digest/route") },
  { path: "/mails/bulk", load: () => import("@/app/api/mails/bulk/route") },
  { path: "/mails/[id]/actions", load: () => import("@/app/api/mails/[id]/actions/route") },
  { path: "/mails/[id]", load: () => import("@/app/api/mails/[id]/route") },
  { path: "/mails", load: () => import("@/app/api/mails/route") },
  { path: "/me", load: () => import("@/app/api/me/route") },
  { path: "/preferences", load: () => import("@/app/api/preferences/route") },
  { path: "/presence", load: () => import("@/app/api/presence/route") },
  { path: "/settings", load: () => import("@/app/api/settings/route") },
  { path: "/sim", load: () => import("@/app/api/sim/route") },
  { path: "/templates/[id]", load: () => import("@/app/api/templates/[id]/route") },
  { path: "/templates", load: () => import("@/app/api/templates/route") },
  { path: "/views/[id]", load: () => import("@/app/api/views/[id]/route") },
  { path: "/views", load: () => import("@/app/api/views/route") },
];

/** Match "/mails/m-1/actions" against "/mails/[id]/actions" and return the route and its params. */
function findRoute(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  for (const route of ROUTES) {
    const pattern = route.path.split("/").filter(Boolean);
    if (pattern.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const matches = pattern.every((segment, index) => {
      if (segment.startsWith("[")) {
        params[segment.slice(1, -1)] = decodeURIComponent(parts[index]);
        return true;
      }
      return segment === parts[index];
    });
    if (matches) return { route, params };
  }
  return undefined;
}

interface ApiCall {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  userId: string;
  body?: unknown;
}

/** Run one API call and return its Response, exactly like fetch("/api/...") would. */
export async function callApi(path: string, { method, userId, body }: ApiCall): Promise<Response> {
  const url = new URL(`/api${path}`, "http://internal");
  const found = findRoute(url.pathname.replace(/^\/api/, ""));
  if (!found) return Response.json({ error: { code: "NOT_FOUND", message: "Unknown address." } }, { status: 404 });

  const handler = (await found.route.load())[method];
  if (!handler) return Response.json({ error: { code: "METHOD", message: "Not allowed." } }, { status: 405 });

  const request = new NextRequest(url, {
    method,
    headers: { "x-user-id": userId, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handler(request, { params: Promise.resolve(found.params) });
}
