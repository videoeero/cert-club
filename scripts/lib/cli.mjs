/**
 * Number.parseInt stops at the first non-digit, so "10s" becomes 10 and
 * "18questions" becomes 18 — a typo silently becomes a plausible-looking value
 * and the run carries on with the wrong number. Every numeric flag in the
 * content tooling goes through here so none of them can do that.
 *
 * Returns null rather than throwing, because each script reports argument
 * problems in its own error style: some aggregate into a *Error, some print a
 * usage line straight to stderr.
 */
export function parsePositiveInteger(raw) {
  if (typeof raw !== "string" || !/^\d+$/.test(raw.trim())) {
    return null;
  }
  const value = Number.parseInt(raw.trim(), 10);
  return value >= 1 ? value : null;
}
