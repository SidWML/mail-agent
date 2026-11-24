/** What a toast says: a short title and, optionally, one line that explains what happens next. */
export type Message = string | { title: string; detail?: string };

const mails = (count: number) => `${count} ${count === 1 ? "mail" : "mails"}`;

/**
 * Every message the app shows after an action, in one place so the wording stays consistent:
 * a short title in the past tense, then one calm line about what it means.
 */
export const MESSAGES = {
  // One mail
  mailTaken: { title: "Mail taken", detail: "It’s yours now. You can reply from the drawer." },
  assigned: (name: string) => ({ title: `Assigned to ${name}`, detail: "It now shows under their items." }),
  assignedToYou: { title: "Assigned to you", detail: "You can reply now." },
  takeoverSent: { title: "Request sent", detail: "The owner will decide. You’ll see the answer on the mail." },
  takeoverApproved: { title: "Takeover approved", detail: "The mail has a new owner." },
  takeoverDeclined: { title: "Takeover declined", detail: "You stay the owner." },
  markedActed: { title: "Marked as acted", detail: "It moved to Acted / Closed." },
  categoryChanged: { title: "Category changed", detail: "Your reason is saved in the audit log." },
  senderBlocked: { title: "Sender blocked", detail: "The mail was marked as acted (Spam)." },
  mailDeleted: { title: "Mail deleted", detail: "You can restore it for 30 days." },
  mailRestored: { title: "Mail restored", detail: "It’s back where it was." },
  mailReopened: { title: "Mail reopened", detail: "It’s back in progress." },
  noteAdded: { title: "Note added", detail: "Only the team can see it." },
  replySentStaysOpen: { title: "Reply sent", detail: "The mail stays in progress." },
  replySentWaiting: { title: "Reply sent", detail: "Now waiting on the sender." },

  // Many mails
  bulkDone: (done: number, label: string, skippedReasons: string[], skippedCount: number) => ({
    title: `${mails(done)} ${label}`,
    detail: skippedCount > 0 ? `${skippedCount} skipped: ${skippedReasons.join("; ")}` : undefined,
  }),
  bulkNothingDone: (skippedReasons: string[]) => ({ title: "Nothing was changed", detail: skippedReasons.join("; ") }),
  tickOneMail: { title: "No mails ticked", detail: "Tick at least one mail first." },
  tooManyMails: { title: "Too many mails", detail: "You can change up to 100 mails at once." },

  // Saved views
  viewSaved: (name: string) => ({ title: "View saved", detail: `“${name}” is in your Views menu.` }),
  viewRemoved: { title: "View removed" },

  // Categories and templates
  categorySaved: { title: "Category saved" },
  categoryAdded: { title: "Category added", detail: "The AI can use it from the next mail." },
  categoriesMerged: (moved: number) => ({ title: "Categories merged", detail: `${mails(moved)} moved.` }),
  categoryRetired: (moved: number) => ({
    title: "Category retired",
    detail: moved > 0 ? `${mails(moved)} moved to Needs review.` : undefined,
  }),
  suggestionApproved: (name: string, moved: number) => ({
    title: `Category “${name}” added`,
    detail: moved > 0 ? `${mails(moved)} moved into it.` : undefined,
  }),
  templateSaved: { title: "Template saved" },
  templateAdded: { title: "Template added", detail: "Agents can insert it into replies." },
  templateDeleted: { title: "Template deleted" },
  templateNeeded: { title: "No template picked", detail: "Pick a template first." },
  notAnEmail: (addresses: string[]) => ({ title: "Check the address", detail: `Not an email address: ${addresses.join(", ")}` }),

  // Refresh
  newMail: (count: number) => ({ title: count === 1 ? "1 new mail" : `${count} new mails`, detail: "It is in your list now." }),
  upToDate: (since: string) => ({ title: "You’re up to date", detail: since ? `Nothing new since ${since}.` : "Nothing new." }),
  dashboardRefreshed: (at: string) => ({ title: "Dashboard refreshed", detail: `Numbers as of ${at}.` }),
  syncDelayed: (at: string) => ({ title: "Mail sync is delayed", detail: `Last updated ${at}. We keep retrying and nothing is lost.` }),

  // Reply box
  aiDraftReady: { title: "Draft ready", detail: "Written by the AI. Read and edit it before you send." },
  recipientsAdded: (count: number) => ({ title: count === 1 ? "Recipient added" : "Recipients added" }),
  recipientRemoved: { title: "Recipient removed" },
  attachmentRemoved: { title: "Attachment removed" },
  templateInserted: (name: string) => ({ title: "Template added to your reply", detail: `“${name}”. Edit it before you send.` }),
  filesAttached: (count: number) => ({ title: count === 1 ? "1 file attached" : `${count} files attached` }),
  filesNotAttached: { title: "Some files were not attached", detail: "See the list for the reason." },
  draftDiscarded: { title: "Draft discarded", detail: "The reply you typed was deleted." },

  // Sorting
  sorted: (label: string) => ({ title: `Sorted by ${label.toLowerCase()}`, detail: "We’ll remember this next time." }),

  // Settings, alerts, people
  settingsSaved: { title: "Settings saved", detail: "The change is in the audit log." },
  digestSent: { title: "Digest sent", detail: "It is in the Platform Owner’s alerts." },
  alertsRead: { title: "All caught up", detail: "Alerts marked as read." },
  switchedUser: (name: string) => ({ title: `Signed in as ${name}`, detail: "You see what this role can see." }),

  // Problems
  changedByOthers: { title: "This mail changed", detail: "Someone else updated it, so we refreshed it." },
  formProblem: (reason: string) => ({ title: "Check the form", detail: reason }),
  failed: (reason: string) => ({ title: "That didn’t work", detail: reason }),
} as const;
