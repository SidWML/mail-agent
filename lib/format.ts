const pad = (value: number) => String(value).padStart(2, "0");

/** "RS" from "Ravi S.", "MW" from "Markus W.". */
export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Age as the screens show it: "42 min", "1 h", "1 d 2 h".
 * With shortMinutes the minutes read "20 m" and hours keep two-digit minutes ("1 h 05 m"), as in Time to act.
 */
export function formatDuration(hours: number, shortMinutes = false) {
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  const days = Math.floor(totalMinutes / 1440);
  const remainingHours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`;
  if (remainingHours > 0) {
    if (shortMinutes && minutes > 0) return `${remainingHours} h ${pad(minutes)} m`;
    return `${remainingHours} h`;
  }
  return shortMinutes ? `${minutes} m` : `${minutes} min`;
}

/** Which of the 4 age-strip segments are filled: <1 day, 1-3 days, 3-7 days, >7 days. */
export function getAgeBucket(hours: number) {
  if (hours < 24) return 1;
  if (hours < 72) return 2;
  if (hours < 168) return 3;
  return 4;
}

const timeOfDay = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const dayAndMonth = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function daysBetween(from: Date, to: Date) {
  const startOfFrom = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const startOfTo = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((startOfTo - startOfFrom) / 86400_000);
}

/** Received time under the age: "09:12" today, "Yesterday", then "21 Nov". */
export function formatReceivedLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const daysAgo = daysBetween(date, now);
  if (daysAgo === 0) return timeOfDay(date);
  if (daysAgo === 1) return "Yesterday";
  return dayAndMonth(date);
}

/** Acted time under "Time to act": "Today 09:40", "Yesterday", then "21 Nov". */
export function formatActedLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const daysAgo = daysBetween(date, now);
  if (daysAgo === 0) return `Today ${timeOfDay(date)}`;
  if (daysAgo === 1) return "Yesterday";
  return dayAndMonth(date);
}

/** "2 d ago" for the Deleted tab. */
export function formatDaysAgo(iso: string, now = new Date()) {
  const hours = (now.getTime() - new Date(iso).getTime()) / 3600_000;
  return hours < 24 ? `${formatDuration(hours, true)} ago` : `${Math.floor(hours / 24)} d ago`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatClockTime(iso: string) {
  return timeOfDay(new Date(iso));
}

export function formatFileSize(bytes: number) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`;
}

/** Time on a message in the thread: "Today, 08:55", "Yesterday, 11:05", then "21 Nov, 09:10". */
export function formatMessageTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const daysAgo = daysBetween(date, now);
  if (daysAgo === 0) return `Today, ${timeOfDay(date)}`;
  if (daysAgo === 1) return `Yesterday, ${timeOfDay(date)}`;
  return `${dayAndMonth(date)}, ${timeOfDay(date)}`;
}

/** "today at 10:42", "yesterday at 10:42", then "on 21 Nov at 10:42" - for sentences in the drawer. */
export function formatWhenSentence(iso: string, now = new Date()) {
  const date = new Date(iso);
  const daysAgo = daysBetween(date, now);
  if (daysAgo === 0) return `today at ${timeOfDay(date)}`;
  if (daysAgo === 1) return `yesterday at ${timeOfDay(date)}`;
  return `on ${dayAndMonth(date)} at ${timeOfDay(date)}`;
}

/** Whole days between an earlier time and now. */
export function daysSince(iso: string, now = new Date()) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86400_000);
}

/** Hours from now until a time in the future (negative when it is already past). */
export function hoursUntil(iso: string, now = new Date()) {
  return (new Date(iso).getTime() - now.getTime()) / 3600_000;
}
