import { redirect } from "next/navigation";
import { getClosedUrl } from "@/lib/dialog";
import { changeUrl } from "@/lib/url";
import { ApiError } from "@/services/http";
import { finishWithError } from "./action-helpers";

/** Validation errors from the API: the form stays open so the person can fix the field. */
const FORM_ERROR_CODES = ["NAME_REQUIRED", "SLA_REQUIRED", "REQUIRED", "BAD_INPUT", "REASON_REQUIRED"];

/**
 * An API error after submitting a form. Validation errors keep the dialog open, show the message,
 * and put what was typed back in the address (draft values) so nothing is lost. Other errors close the dialog.
 */
export function finishWithFormError(error: unknown, returnTo: string, draft: Record<string, string>): never {
  if (error instanceof ApiError && FORM_ERROR_CODES.includes(error.code)) {
    redirect(changeUrl(returnTo, { ...draft, notice: error.message, noticeTone: "error" }));
  }
  return finishWithError(error, getClosedUrl(returnTo));
}
