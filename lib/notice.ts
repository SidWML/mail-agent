import type { Message } from "./messages";
import { readParam, withParams, type SearchParams } from "./url";

export type NoticeTone = "success" | "error" | "info";

export interface Notice {
  title: string;
  /** One calm line under the title. */
  detail?: string;
  tone: NoticeTone;
  /** Link that closes the notice (same page without it). */
  dismissHref: string;
}

/** The title and detail travel in one address value, split by a line break. */
export function encodeNotice(message: Message) {
  return typeof message === "string" ? message : message.detail ? `${message.title}\n${message.detail}` : message.title;
}

/** Read the one-time notice a server action left in the address (?notice=...&noticeTone=error). */
export function getNotice(pathname: string, params: SearchParams): Notice | undefined {
  const value = readParam(params, "notice");
  if (!value) return undefined;
  const [title, ...rest] = value.split("\n");
  const tone = readParam(params, "noticeTone");
  return {
    title,
    detail: rest.join("\n") || undefined,
    tone: tone === "error" || tone === "info" ? tone : "success",
    dismissHref: withParams(pathname, params, { notice: undefined, noticeTone: undefined }),
  };
}
