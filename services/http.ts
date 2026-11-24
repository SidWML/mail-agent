import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const DEFAULT_USER_ID = "u-rajeev";
export const USER_COOKIE = "user-id";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** The id of the signed-in persona (set by the switcher in the header). */
export async function getCurrentUserId() {
  const store = await cookies();
  return store.get(USER_COOKIE)?.value ?? DEFAULT_USER_ID;
}

async function getOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

/** One place that talks to /api. Every service function goes through here. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${await getOrigin()}/api${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers: {
      "x-user-id": await getCurrentUserId(),
      "content-type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: {} }));
    // Someone outside the mailbox groups sees only the Access denied screen.
    if (error?.code === "NO_MAILBOX_ACCESS") redirect("/access-denied");
    throw new ApiError(
      response.status,
      error?.code ?? "ERROR",
      error?.message ?? "Something went wrong.",
      error ?? {},
    );
  }
  return response.json();
}

/** Build "?a=1&b=2" from an object, skipping empty values. */
export function toQueryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
