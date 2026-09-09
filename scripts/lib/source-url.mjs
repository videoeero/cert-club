/**
 * A fragment selects a section of a page the server never sees, so several
 * anchored citations of one document are one source page. ccdv-f cites 70 URLs
 * across 65 pages.
 *
 * This lives in lib because two tools have to agree on it: bank-metrics counts
 * distinct source pages, check-sources groups staleness and liveness by page.
 * When they each had their own version they agreed only by coincidence — one
 * used URL parsing, the other a string split, which diverge on any URL whose
 * normalised form differs from how it was written.
 */
export function sourcePageUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.href;
  } catch {
    // Not parseable as a URL: the schema rejects those at validate time, so
    // this only happens on hand-built input. Fall back to the raw string
    // rather than throwing from a helper used purely for grouping.
    return url;
  }
}
