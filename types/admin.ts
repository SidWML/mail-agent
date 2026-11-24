import type { AuditEntry, Template } from "./mailbox";

/** Fields the category form sends. */
export interface CategoryInput {
  name: string;
  typical: string;
  slaHours: number;
  active?: boolean;
  /** Edit form toggle "Re-categorize existing mails" (the dummy API accepts and ignores it). */
  recategorize?: boolean;
}

export interface MergeCategoriesInput {
  sourceIds: string[];
  targetId: string;
  recategorize: boolean;
}

/** Fields the template form sends. */
export interface TemplateInput {
  name: string;
  categoryId?: string;
  body: string;
}

export interface TemplatesResponse {
  templates: Template[];
}

/** Query values the audit endpoint understands. */
export interface AuditQuery {
  user?: string;
  action?: string;
  q?: string;
}

export interface AuditResponse {
  entries: AuditEntry[];
  total: number;
  /** Every action name that appears in the log, for the Action type menu. */
  actions: string[];
}
