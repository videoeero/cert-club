/**
 * Formats a remaining-time countdown as a clock string (MM:SS or H:MM:SS).
 * Suitable for live timer displays.
 */
export function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formats the elapsed time between two ISO 8601 timestamps as a
 * human-readable string (e.g. "1h 23m 45s"). Falls back to "< 1s"
 * for invalid, reversed, or sub-second ranges.
 */
export function formatUsedTime(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "< 1s";
  }
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  if (totalSeconds < 1) {
    return "< 1s";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }
  return parts.join(" ");
}

const CALENDAR_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formats a calendar date string (YYYY-MM-DD) into a human-readable string (e.g. "Sep 7, 2026").
 * Evaluated in UTC so local timezone offsets do not cause day-shifting artifacts.
 * Returns the original string untouched if the input is malformed, out of bounds, or rolls over.
 */
export function formatCalendarDate(dateString: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  const parts = dateString.split("-");
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) {
    return dateString;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return dateString;
  }
  return CALENDAR_DATE_FORMATTER.format(date);
}
