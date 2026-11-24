export type SearchParams = Record<string, string | string[] | undefined>;

/** Read one value from page searchParams (first value if repeated). */
export function readParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Read a list value. Works for ?a=1&a=2 (checkbox forms) and ?a=1,2. */
export function readList(params: SearchParams, key: string) {
  const value = params[key];
  const parts = Array.isArray(value) ? value : value ? [value] : [];
  return parts.flatMap((part) => part.split(",")).filter(Boolean);
}

/** Link to the same page with some query values changed. Pass undefined to remove a value. */
export function withParams(
  pathname: string,
  current: SearchParams,
  changes: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const key of Object.keys(current)) {
    for (const value of readList(current, key)) query.append(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    query.delete(key);
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}

/** Same as withParams, but starting from a full "/path?query" string (used by server actions). */
export function changeUrl(url: string, changes: Record<string, string | number | undefined>) {
  const parsed = new URL(url, "http://local");
  for (const [key, value] of Object.entries(changes)) {
    parsed.searchParams.delete(key);
    if (value !== undefined && value !== "") parsed.searchParams.set(key, String(value));
  }
  const text = parsed.searchParams.toString();
  return text ? `${parsed.pathname}?${text}` : parsed.pathname;
}

/** Current query values as plain fields, minus the keys a form controls itself. Used for hidden inputs. */
export function getKeptFields(current: SearchParams, dropKeys: string[]) {
  const fields: Array<[string, string]> = [];
  for (const key of Object.keys(current)) {
    if (dropKeys.includes(key) || key === "page") continue;
    for (const value of readList(current, key)) fields.push([key, value]);
  }
  return fields;
}

/** The current page address ("/inbox?tab=mine&mail=m-1") without one-time keys such as the notice. */
export function getCurrentUrl(pathname: string, current: SearchParams, dropKeys: string[] = []) {
  return withParams(pathname, current, {
    notice: undefined,
    noticeTone: undefined,
    ...Object.fromEntries(dropKeys.map((key) => [key, undefined])),
  });
}
