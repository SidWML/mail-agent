import { readParam, withParams, type SearchParams } from "./url";

export interface Notice {
  message: string;
  tone: "success" | "error";
  /** Link that closes the notice (same page without it). */
  dismissHref: string;
}

/** Read the one-time notice a server action left in the address (?notice=...&noticeTone=error). */
export function getNotice(pathname: string, params: SearchParams): Notice | undefined {
  const message = readParam(params, "notice");
  if (!message) return undefined;
  return {
    message,
    tone: readParam(params, "noticeTone") === "error" ? "error" : "success",
    dismissHref: withParams(pathname, params, { notice: undefined, noticeTone: undefined }),
  };
}
