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
