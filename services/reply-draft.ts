import { cookies } from "next/headers";

export type ComposeMode = "reply" | "replyAll" | "note";

export interface DraftAttachment {
  name: string;
  size: number;
  kind: "pdf" | "xlsx" | "png" | "docx";
}

/** What the person has typed in the reply box. Kept in a cookie so it survives dialogs and a failed send. */
export interface ReplyDraft {
  mode: ComposeMode;
  body: string;
  /** Extra people in To (the sender is always a recipient). */
  to: string[];
  cc: string[];
  attachments: DraftAttachment[];
  /** True when the text came from "Draft with AI" (shows the review-before-sending notice). */
  fromAi: boolean;
  hideQuoted: boolean;
}

export const EMPTY_DRAFT: ReplyDraft = {
  mode: "reply",
  body: "",
  to: [],
  cc: [],
  attachments: [],
  fromAi: false,
  hideQuoted: false,
};

const cookieName = (mailId: string) => `draft-${mailId}`;

export async function readReplyDraft(mailId: string): Promise<ReplyDraft> {
  const store = await cookies();
  const raw = store.get(cookieName(mailId))?.value;
  if (!raw) return EMPTY_DRAFT;
  try {
    const saved = JSON.parse(decodeURIComponent(raw));
    // Older drafts kept Cc as one text; read that too.
    const asList = (value: unknown) => (Array.isArray(value) ? value.map(String) : typeof value === "string" ? value.split(/[,;\s]+/).filter(Boolean) : []);
    return { ...EMPTY_DRAFT, ...saved, to: asList(saved.to), cc: asList(saved.cc) };
  } catch {
    return EMPTY_DRAFT;
  }
}

/** Only call from a server action. */
export async function saveReplyDraft(mailId: string, draft: ReplyDraft) {
  const store = await cookies();
  // Cookies hold about 4 KB, so very long text is cut rather than lost silently.
  const safe = { ...draft, body: draft.body.slice(0, 2000) };
  store.set(cookieName(mailId), encodeURIComponent(JSON.stringify(safe)), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 8 });
}

/** Only call from a server action. */
export async function clearReplyDraft(mailId: string) {
  const store = await cookies();
  store.delete(cookieName(mailId));
}
