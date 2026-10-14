import type { Manifest } from "../types";

export interface FilterRegexResult {
  regex: RegExp | null;
  error: string | null;
}

export interface CompiledFilter {
  regex: RegExp | null;
  error: string | null;
  test: (manifest: Manifest) => boolean;
}

/**
 * Checks for nested quantifiers that could cause catastrophic backtracking (ReDoS).
 */
export function isPotentiallyUnsafeRegex(pattern: string): boolean {
  return /\((?:\?:)?[^)]*([+*]|\{\d+,?\d*\}).*?\)([+*]|\{\d+,?\d*\})/.test(
    pattern,
  );
}

/**
 * Compiles a query into a regular expression if explicitly enclosed in `/.../` or `/.../flags`.
 *
 * If not enclosed in slashes, regular expressions are not activated and this returns
 * `{ regex: null, error: null }`, allowing plain substring matching without ReDoS risks
 * or syntax errors on ordinary text (e.g. "c++", "(aws)").
 *
 * If enclosed in `/.../`, returns `{ regex, error: null }` on success, or
 * `{ regex: null, error: message }` if the syntax is invalid or potentially catastrophic.
 */
export function compileFilterRegex(query: string): FilterRegexResult {
  const trimmed = query.trim();
  if (!trimmed || !trimmed.startsWith("/")) {
    return { regex: null, error: null };
  }

  const slashMatch = /^\/(.*)\/([a-z]*)$/i.exec(trimmed);
  if (!slashMatch) {
    // Unclosed slash — treat as plain text while typing without error
    return { regex: null, error: null };
  }

  const pattern = slashMatch[1];
  const flags = slashMatch[2];

  if (!pattern) {
    return { regex: null, error: null };
  }

  if (isPotentiallyUnsafeRegex(pattern)) {
    return {
      regex: null,
      error: "Potentially unsafe regular expression (nested quantifiers)",
    };
  }

  try {
    const effectiveFlags = flags.includes("i") ? flags : `${flags}i`;
    return { regex: new RegExp(pattern, effectiveFlags), error: null };
  } catch (err) {
    return {
      regex: null,
      error: err instanceof Error ? err.message : "Invalid regular expression",
    };
  }
}

/**
 * Compiles a search query into an efficient matcher function.
 * Matches by regex if enclosed in `/.../`, otherwise performs case-insensitive
 * substring matching across `name`, `cert`, and `vendor`.
 */
export function compileFilter(query: string): CompiledFilter {
  const trimmed = query.trim();
  if (!trimmed) {
    return { regex: null, error: null, test: () => true };
  }

  const { regex, error } = compileFilterRegex(trimmed);
  if (regex) {
    return {
      regex,
      error,
      test: (manifest: Manifest) =>
        regex.test(manifest.name) ||
        regex.test(manifest.cert) ||
        regex.test(manifest.vendor ?? ""),
    };
  }

  const lower = trimmed.toLowerCase();
  return {
    regex: null,
    error,
    test: (manifest: Manifest) =>
      manifest.name.toLowerCase().includes(lower) ||
      manifest.cert.toLowerCase().includes(lower) ||
      (manifest.vendor ?? "").toLowerCase().includes(lower),
  };
}

/**
 * Tests whether a certification manifest matches the filter query across
 * its `name`, `cert` (code), or `vendor` fields.
 *
 * Accepts either a string query or a pre-compiled `CompiledFilter`.
 */
export function matchesCertFilter(
  manifest: Manifest,
  query: string | CompiledFilter,
): boolean {
  if (typeof query === "object" && query !== null && "test" in query) {
    return query.test(manifest);
  }
  const trimmed = query.trim();
  if (!trimmed) {
    return true;
  }
  return compileFilter(trimmed).test(manifest);
}

/**
 * Filters an array of certification manifests by query.
 * Compiles the matcher once for the entire list.
 */
export function filterManifests(
  manifests: readonly Manifest[],
  query: string,
): Manifest[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...manifests];
  }
  const compiled = compileFilter(trimmed);
  return manifests.filter(compiled.test);
}
