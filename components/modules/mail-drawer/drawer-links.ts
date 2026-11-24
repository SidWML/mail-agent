import { getCurrentUrl, withParams, type SearchParams } from "@/lib/url";

export const INBOX_PATH = "/inbox";

/** Addresses the drawer and its dialogs link to. Everything is a query value, so a link is all it takes. */
export function createDrawerLinks(params: SearchParams) {
  return {
    /** Back to the list, exactly as it was (same tab, filters and page). */
    close: withParams(INBOX_PATH, params, {
      mail: undefined,
      translate: undefined,
      dialog: undefined,
      target: undefined,
      preview: undefined,
      ids: undefined,
      owner: undefined,
      rejected: undefined,
      sentKind: undefined,
      sentTo: undefined,
      tplq: undefined,
      assignTeam: undefined,
      outcome: undefined,
    }),
    /** Same drawer with a dialog on top. */
    dialog: (name: string, extra: Record<string, string | undefined> = {}) =>
      withParams(INBOX_PATH, params, { dialog: name, ...extra }),
    /** Same drawer with the dialog closed. */
    closeDialog: withParams(INBOX_PATH, params, {
      dialog: undefined,
      target: undefined,
      ids: undefined,
      owner: undefined,
      rejected: undefined,
      sentKind: undefined,
      sentTo: undefined,
      tplq: undefined,
      assignTeam: undefined,
      outcome: undefined,
    }),
    /** Open another mail in the drawer (previous / next). */
    openMail: (mailId: string) =>
      withParams(INBOX_PATH, params, { mail: mailId, translate: undefined, dialog: undefined, preview: undefined, notice: undefined, noticeTone: undefined }),
    /** Show one message translated (message id + language code). */
    translate: (messageId: string, languageCode: string) => withParams(INBOX_PATH, params, { translate: `${messageId}:${languageCode}` }),
    showOriginal: withParams(INBOX_PATH, params, { translate: undefined }),
    /** Pictures in mails are blocked until the reader shows them. */
    showImages: withParams(INBOX_PATH, params, { images: "1" }),
    hideImages: withParams(INBOX_PATH, params, { images: undefined }),
    preview: (attachmentId: string) => withParams(INBOX_PATH, params, { preview: attachmentId }),
    closePreview: withParams(INBOX_PATH, params, { preview: undefined }),
    /** The address server actions return to. */
    returnTo: getCurrentUrl(INBOX_PATH, params),
  };
}

export type DrawerLinks = ReturnType<typeof createDrawerLinks>;
