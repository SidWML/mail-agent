import { changeUrl, getCurrentUrl, type SearchParams } from "./url";

/** Address keys that belong to an open form or dialog, removed when it closes. */
export const DIALOG_KEYS = ["dialog", "id", "draftName", "draftTypical", "draftSla", "draftBody", "draftCategory"];

/** The page address without any dialog, so a finished action lands on the plain list. */
export function getClosedUrl(returnTo: string) {
  return changeUrl(returnTo, Object.fromEntries(DIALOG_KEYS.map((key) => [key, undefined])));
}

/** Where a dialog's X, Cancel and backdrop go, and what its form sends as returnTo. */
export function getDialogUrls(pathname: string, params: SearchParams) {
  return {
    closeHref: getClosedUrl(getCurrentUrl(pathname, params)),
    returnTo: getCurrentUrl(pathname, params),
  };
}
