export const AUDIT_PATH = "/audit";
export const AUDIT_PAGE_SIZE = 8;
export const AUDIT_GRID_COLUMNS = "1fr 1fr 1.2fr 2.6fr 2fr";
export const AUDIT_FILTER_KEYS = ["user", "action", "q"];

/** Where anyone but the Platform Owner is sent. */
export const AUDIT_DENIED_URL = `/inbox?notice=${encodeURIComponent("Only the Platform Owner can open the audit log.")}&noticeTone=error`;
