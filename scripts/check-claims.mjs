import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parsePositiveInteger } from "./lib/cli.mjs";
import { AggregateMessageError } from "./lib/errors.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";
import { sourcePageUrl } from "./lib/source-url.mjs";

/**
 * Workstream 5 Stage B: check claims against cited vendor documentation.
 *
 * Checks 1 and 2 (quotes and backticked identifiers) and Check 3 (figures) are
 * all advisory — none gate. A reviewer adjudicates findings against the cited
 * page; no regex reliably separates real citations from config values, globs,
 * illustrative prompt fragments, or scenario entity nouns.
 *
 * Scope:
 * - Stage A enumerates the figure-bearing population offline.
 * - Stage B fetches page text for .md-serving hosts only: platform.claude.com,
 *   code.claude.com, modelcontextprotocol.io (360 of 561 citations).
 * - All other hosts (docs.aws.amazon.com, aws.amazon.com, learn.microsoft.com,
 *   www.anthropic.com/engineering which 404s on .md) are OUT OF SCOPE and report
 *   inconclusive.
 * - A failed, thin, or non-.md fetch is inconclusive, NEVER a finding.
 * - Normalises both sides before comparing: casefold, collapse whitespace,
 *   straighten curly quotes.
 * - Check 1 (advisory): quoted spans in the provenance surface compared against
 *   the cited page.
 * - Check 2 (advisory): backticked identifiers compared against the cited page.
 * - Check 3 (advisory): annotates Stage A's figure listing with page presence.
 */

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const DEFAULT_CONCURRENCY = 8;
export const DEFAULT_TIMEOUT_MS = 10_000;

export const MD_HOSTS = new Set([
  "platform.claude.com",
  "code.claude.com",
  "modelcontextprotocol.io",
]);

export class ClaimsCheckError extends AggregateMessageError {
  constructor(messages = []) {
    super("Claims check failed:", messages);
    this.name = "ClaimsCheckError";
  }
}

/**
 * Check if a URL belongs to one of the supported .md-serving hosts.
 */
export function isMdHost(url) {
  try {
    const parsed = new URL(url);
    return MD_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Convert a citation page URL to its markdown endpoint URL if on an in-scope host.
 * Strips fragment selectors and ensures a .md extension. Returns null for
 * out-of-scope hosts or unparseable URLs.
 */
export function toMdUrl(url) {
  try {
    const pageUrl = sourcePageUrl(url);
    const parsed = new URL(pageUrl);
    if (!MD_HOSTS.has(parsed.hostname)) {
      return null;
    }
    if (!parsed.pathname.endsWith(".md")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "") + ".md";
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Strip Markdown structural and inline markers to aid verbatim phrase matching
 * against source prose formatted with bold, italic, or links.
 */
export function stripMarkdown(text) {
  if (!text) {
    return "";
  }
  return (
    text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Unescape before stripping: a heading written `## Handling errors with
      // is\_error` carries the underscore escaped, and leaving the backslash in
      // makes the page text differ from the quote by a character the reader
      // never sees.
      .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")
      .replace(/[*_~`#]/g, " ")
      .replace(/^[-*+]\s+/gm, "")
  );
}

/**
 * Normalise text for claims comparison: casefold, collapse whitespace,
 * straighten curly quotes.
 */
export function normalizeText(text) {
  if (!text) {
    return "";
  }
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The free-text provenance surface defined by CONTRIBUTING.md § Question content
 * requirements: explanation, sourceNote, distractorNotes, and the text of keyed
 * options (options listed in correct).
 *
 * Non-keyed option text is deliberately excluded because a distractor may assert
 * a falsehood by design.
 */
export function provenanceSurface(q) {
  const keyed = new Set(q.correct || []);
  return [
    q.explanation || "",
    q.sourceNote || "",
    ...Object.values(q.distractorNotes || {}),
    ...(q.options || [])
      .filter((o) => keyed.has(o.id))
      .map((o) => o.text || ""),
  ].join("\n");
}

const WORD_UNIT =
  String.raw`percent|ms|milliseconds?|sec|seconds?|min|minutes?|hr|hours?|days?|` +
  String.raw`weeks?|months?|years?|[KMGT]i?B|tokens?|requests?`;

/**
 * Pinned detection rule for figures: currency amounts, percentages, and numeric
 * quantities followed by units (durations, sizes, tokens, requests).
 */
export const FIGURE = new RegExp(
  String.raw`\$\s?\d[\d,.]*\b` +
    String.raw`|\b\d[\d,.]*\s*%` +
    String.raw`|\b\d[\d,.]*(?:\s*[–-]\s*\d[\d,.]*)?[\s-]*(?:${WORD_UNIT})\b`,
  "i",
);

const FIGURE_GLOBAL = new RegExp(FIGURE.source, "gi");

/**
 * Extract all matched figures from a question's provenance surface, paired with
 * the field they originated from.
 */
export function extractFigures(q) {
  const keyed = new Set(q.correct || []);
  const entries = [];

  function checkField(fieldName, text) {
    if (!text) {
      return;
    }
    const matches = text.match(FIGURE_GLOBAL);
    if (matches) {
      for (const figure of matches) {
        entries.push({ field: fieldName, figure });
      }
    }
  }

  checkField("explanation", q.explanation);
  checkField("sourceNote", q.sourceNote);
  if (q.distractorNotes) {
    for (const key of Object.keys(q.distractorNotes).sort()) {
      checkField(`distractorNotes.${key}`, q.distractorNotes[key]);
    }
  }
  for (const opt of q.options || []) {
    if (keyed.has(opt.id)) {
      checkField(`options.${opt.id}`, opt.text);
    }
  }

  return entries;
}

/**
 * A quoted span that is not a citation of the cited page. Check 1 is advisory,
 * but shapes that are clearly not page prose are filtered to reduce noise.
 *
 * - Placeholders: "<prompt>", "<ticket-number>".
 * - Identifier-shaped single tokens: "record_filing_entity", "maxTokens" — a code
 *   literal being named, not page prose being quoted.
 *
 * Quotes sitting inside a backticked code span are dropped during extraction, via
 * codeSpanRanges, rather than here: by the time a span is isolated the surrounding
 * backticks are gone.
 */
export function isNonCitationSpan(span) {
  if (/^<[^>]*>$/.test(span)) {
    return true;
  }
  return (
    !/\s/.test(span) &&
    /^[A-Za-z_$][\w$.]*$/.test(span) &&
    /[_$.]|[a-z][A-Z]/.test(span)
  );
}

/**
 * Character ranges covered by backticked code spans.
 *
 * Used to drop a quote that sits *inside* a code sample — the double quotes in
 * `tool_choice: {"type": "tool", "name": "record_filing_entity"}` quote a JSON
 * value, not the vendor page. Deleting code spans outright is wrong: a quotation
 * may legitimately *contain* one ("place `cache_control` on the last block…"),
 * and blanking it mid-quote manufactures a mismatch against text that is fine.
 */
export function codeSpanRanges(text) {
  const ranges = [];
  for (const m of text.matchAll(/`[^`\n]*`/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

function isInsideRange(ranges, start, end) {
  return ranges.some(([from, to]) => start >= from && end <= to);
}

/**
 * Extract quoted spans from text: spans inside "..." or '...'.
 * Normalises curly quotes before matching. Avoids internal apostrophes like don't or model's.
 * Code spans and non-citation shapes are excluded — see codeSpanRanges and isNonCitationSpan.
 */
export function extractQuotedSpans(text) {
  if (!text) {
    return [];
  }
  const matches = [];
  const normalized = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  const codeRanges = codeSpanRanges(normalized);

  const collect = (pattern) => {
    for (const m of normalized.matchAll(pattern)) {
      if (isInsideRange(codeRanges, m.index, m.index + m[0].length)) {
        continue;
      }
      // Backticks inside a quotation mark up an identifier; the page carries it
      // plain, so drop them from the needle rather than from the quote.
      const trimmed = m[1].replace(/`/g, "").trim();
      if (trimmed && !isNonCitationSpan(trimmed)) {
        matches.push(trimmed);
      }
    }
  };

  collect(/"([^"\n]+)"/g);
  collect(/(?<!\w)'([^'\n]+)'(?!\w)/g);

  return matches;
}

/**
 * Extract backticked identifiers from text: non-whitespace tokens enclosed in backticks.
 */
export function extractBackticks(text) {
  if (!text) {
    return [];
  }
  const matches = [];
  for (const m of text.matchAll(/`([^`\s\n]+)`/g)) {
    const trimmed = m[1].trim();
    if (trimmed) {
      matches.push(trimmed);
    }
  }
  return matches;
}

/**
 * Check if needle appears on page text after normalisation (casefolding, whitespace
 * collapsing, quote straightening) and optional markdown/trailing-punctuation stripping.
 */
export function isTextOnPage(pageText, needle) {
  const normNeedle = normalizeText(needle);
  if (!normNeedle) {
    return false;
  }
  const normRaw = normalizeText(pageText);
  const normStripped = normalizeText(stripMarkdown(pageText));
  // stripMarkdown reads `_` as emphasis, so `cache_control` on the page becomes
  // "cache control" while the quoted needle keeps the underscore. Compare a
  // variant with the emphasis characters flattened on BOTH sides, so any quote
  // carrying a snake_case identifier still matches.
  const loose = (value) => normalizeText(value.replace(/[_*~`\\]/g, " "));
  const looseRaw = loose(normRaw);
  const looseStripped = loose(normStripped);

  const present = (candidate) => {
    const trimmed = candidate.trim();
    if (!trimmed) {
      return false;
    }
    const noPunct = trimmed.replace(/[.,;:!?]+$/, "").trim();
    const looseTrimmed = loose(trimmed);
    const looseNoPunct = loose(noPunct);
    return (
      normRaw.includes(trimmed) ||
      normStripped.includes(trimmed) ||
      (looseTrimmed.length > 0 &&
        (looseRaw.includes(looseTrimmed) ||
          looseStripped.includes(looseTrimmed))) ||
      (noPunct.length > 0 &&
        (normRaw.includes(noPunct) ||
          normStripped.includes(noPunct) ||
          looseRaw.includes(looseNoPunct) ||
          looseStripped.includes(looseNoPunct)))
    );
  };

  // An elided quotation ("A... B") is a standard citation convention, not an
  // invented one: each retained segment must appear on the page, and they must
  // appear in the order quoted. Treating the whole span as one literal made every
  // elided quote in the corpus a false finding, which is most of check 1's noise.
  const segments = normNeedle
    .split(/\s*(?:\.\.\.|\u2026)\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length > 1) {
    const inOrder = (haystack, transform) => {
      let cursor = 0;
      for (const segment of segments) {
        const candidate = transform(segment);
        const noPunct =
          transform(segment.replace(/[.,;:!?]+$/, "").trim()) || candidate;
        let at = haystack.indexOf(candidate, cursor);
        if (at === -1) {
          at = haystack.indexOf(noPunct, cursor);
        }
        if (at === -1) {
          return false;
        }
        cursor = at + 1;
      }
      return true;
    };

    const identity = (segment) => segment;
    return (
      inOrder(normStripped, identity) ||
      inOrder(normRaw, identity) ||
      inOrder(looseRaw, loose)
    );
  }

  return present(normNeedle);
}

async function releaseBody(response) {
  try {
    await response.body?.cancel?.();
  } catch {
    // Already consumed or never had a body; nothing to release.
  }
}

/**
 * Fetch text of a single documentation page for .md-serving hosts.
 * Returns { url, mdUrl, status: "ok" | "inconclusive", reason?, detail?, httpStatus?, text }.
 */
export async function fetchPageText(
  url,
  { fetcher = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const mdUrl = toMdUrl(url);
  if (!mdUrl) {
    return {
      url,
      mdUrl: null,
      status: "inconclusive",
      reason: "out-of-scope host",
      text: null,
    };
  }

  let response;
  try {
    response = await fetcher(mdUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      url,
      mdUrl,
      status: "inconclusive",
      reason: "network-error",
      detail,
      text: null,
    };
  }

  if (!response.ok) {
    await releaseBody(response);
    return {
      url,
      mdUrl,
      status: "inconclusive",
      reason: "http-error",
      httpStatus: response.status,
      text: null,
    };
  }

  const contentType =
    typeof response.headers?.get === "function"
      ? response.headers.get("content-type") || ""
      : "";
  if (contentType.includes("text/html")) {
    await releaseBody(response);
    return {
      url,
      mdUrl,
      status: "inconclusive",
      reason: "non-md response",
      text: null,
    };
  }

  let rawText;
  try {
    rawText =
      typeof response.text === "function"
        ? await response.text()
        : String(response.body || "");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      url,
      mdUrl,
      status: "inconclusive",
      reason: "network-error",
      detail,
      text: null,
    };
  }

  if (rawText.trim().length < 50) {
    return {
      url,
      mdUrl,
      status: "inconclusive",
      reason: "thin page",
      text: null,
    };
  }

  return {
    url,
    mdUrl,
    status: "ok",
    text: rawText,
  };
}

/**
 * Fetch multiple pages bounded to concurrency limit via a worker pool.
 */
export async function fetchPages(
  urls,
  {
    fetcher = fetch,
    concurrency = DEFAULT_CONCURRENCY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = {},
) {
  const results = new Map();
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const result = await fetchPageText(url, { fetcher, timeoutMs });
      results.set(url, result);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, urls.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

/**
 * Run Check 1, Check 2, and Check 3 on a single question against its fetched page result.
 */
export function checkQuestionClaims(q, pageResult) {
  const surface = provenanceSurface(q);
  const quotes = extractQuotedSpans(surface);
  const backticks = extractBackticks(surface);
  const figures = extractFigures(q);

  const pageOk = pageResult && pageResult.status === "ok";
  const findings = [];

  const checkedQuotes = quotes.map((quote) => {
    if (!pageOk) {
      return { quote, status: "inconclusive" };
    }
    const matched = isTextOnPage(pageResult.text, quote);
    if (!matched) {
      findings.push({
        type: "quote-mismatch",
        id: q.id,
        item: quote,
        sourceUrl: q.sourceUrl,
      });
      return { quote, status: "mismatch" };
    }
    return { quote, status: "matched" };
  });

  const checkedBackticks = backticks.map((identifier) => {
    if (!pageOk) {
      return { identifier, status: "inconclusive" };
    }
    const matched = isTextOnPage(pageResult.text, identifier);
    if (!matched) {
      findings.push({
        type: "identifier-missing",
        id: q.id,
        item: identifier,
        sourceUrl: q.sourceUrl,
      });
      return { identifier, status: "missing" };
    }
    return { identifier, status: "matched" };
  });

  const checkedFigures = figures.map(({ field, figure }) => {
    if (!pageOk) {
      return { field, figure, presence: "inconclusive" };
    }
    const found = isTextOnPage(pageResult.text, figure);
    return { field, figure, presence: found ? "found" : "not-found" };
  });

  return {
    id: q.id,
    sourceUrl: q.sourceUrl,
    pageStatus: pageResult?.status || "inconclusive",
    reason: pageResult?.reason,
    quotes: checkedQuotes,
    backticks: checkedBackticks,
    figures: checkedFigures,
    findings,
  };
}

/**
 * Build claims report for a single bank, optionally incorporating page fetch results.
 */
export function buildClaimsReport(manifest, questions, options = {}) {
  const sortedQuestions = [...questions].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
  const figureBearingQuestions = [];
  const findings = [];
  let quotesChecked = 0;
  let quoteMatches = 0;
  let quoteMismatches = 0;
  let identifiersChecked = 0;
  let identifierMatches = 0;
  let identifierMissing = 0;

  const pageResults = options.pageResults;

  for (const q of sortedQuestions) {
    if (pageResults) {
      const pageUrl = sourcePageUrl(q.sourceUrl);
      const pageResult = pageResults.get(pageUrl);
      const questionCheck = checkQuestionClaims(q, pageResult);

      if (questionCheck.figures.length > 0) {
        figureBearingQuestions.push({
          id: q.id,
          // Why the page could not settle these figures, when it could not.
          // Carried per question so the report can distinguish an unreadable
          // host from a page that was read and stayed silent.
          reason: questionCheck.reason,
          figures: questionCheck.figures,
        });
      }

      for (const f of questionCheck.findings) {
        findings.push(f);
      }

      for (const qEntry of questionCheck.quotes) {
        if (qEntry.status !== "inconclusive") {
          quotesChecked++;
          if (qEntry.status === "matched") {
            quoteMatches++;
          } else {
            quoteMismatches++;
          }
        }
      }

      for (const bEntry of questionCheck.backticks) {
        if (bEntry.status !== "inconclusive") {
          identifiersChecked++;
          if (bEntry.status === "matched") {
            identifierMatches++;
          } else {
            identifierMissing++;
          }
        }
      }
    } else {
      const figures = extractFigures(q);
      if (figures.length > 0) {
        figureBearingQuestions.push({
          id: q.id,
          figures,
        });
      }
    }
  }

  return {
    cert: manifest.cert,
    totalQuestions: questions.length,
    figureBearingQuestions,
    findings,
    quotesChecked,
    quoteMatches,
    quoteMismatches,
    identifiersChecked,
    identifierMatches,
    identifierMissing,
    hasPageResults: Boolean(pageResults),
  };
}

/**
 * Format a bank's claims report for deterministic, diffable display.
 */
export function formatClaimsReport(report) {
  const lines = [];
  lines.push(
    `${report.cert}: ${report.figureBearingQuestions.length} figure-bearing question(s) of ${report.totalQuestions}`,
  );

  if (report.hasPageResults) {
    if (report.findings.length > 0) {
      lines.push(`  Advisory findings (${report.findings.length}):`);
      for (const f of report.findings) {
        if (f.type === "quote-mismatch") {
          lines.push(`    ${f.id}: quote mismatch "${f.item}"`);
        } else if (f.type === "identifier-missing") {
          lines.push(`    ${f.id}: missing identifier \`${f.item}\``);
        }
      }
    } else {
      lines.push(
        `  Advisory checks: 0 findings (${report.quotesChecked} quote(s), ${report.identifiersChecked} identifier(s) checked)`,
      );
    }
  }

  for (const item of report.figureBearingQuestions) {
    lines.push(`  ${item.id}`);
    for (const fig of item.figures) {
      // "inconclusive" covers two outcomes a reader must not confuse: the page
      // was read and did not settle the figure, or the page was never readable
      // at all. Only the first is a lead. The most common second case is a
      // citation on a host that does not serve .md, which yields a whole bank
      // of findings that look actionable and are structurally uncheckable —
      // so name the reason the fetch already recorded.
      const detail =
        fig.presence === "inconclusive" && item.reason
          ? `${fig.presence}: ${item.reason}`
          : fig.presence;
      const presenceStr = detail ? ` (${detail})` : "";
      lines.push(`    ${fig.field}: ${fig.figure}${presenceStr}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const slugs = [];
  const options = {
    json: false,
    offline: false,
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--offline") {
      options.offline = true;
    } else if (arg === "--concurrency" || arg === "--timeout-ms") {
      const raw = argv[++i];
      const value = parsePositiveInteger(raw);
      if (value === null) {
        console.error(`${arg} must be a positive integer, received "${raw}"`);
        process.exitCode = 1;
        return;
      }
      if (arg === "--concurrency") {
        options.concurrency = value;
      } else {
        options.timeoutMs = value;
      }
    } else if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      process.exitCode = 1;
      return;
    } else {
      slugs.push(arg);
    }
  }

  const certsPath = join(repositoryRoot, "certs");
  let certFolders;
  try {
    certFolders = await listCertFolders(certsPath);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  let selected = certFolders;
  if (slugs.length > 0) {
    const missing = slugs.filter((slug) => !certFolders.includes(slug));
    if (missing.length > 0) {
      console.error(
        new ClaimsCheckError(
          missing.map((slug) => `no such cert folder "${slug}"`),
        ).message,
      );
      process.exitCode = 1;
      return;
    }
    selected = certFolders.filter((folder) => slugs.includes(folder));
  }

  const bankData = [];
  const allPageUrls = new Set();
  try {
    for (const slug of selected) {
      const certPath = join(certsPath, slug);
      const [manifest, questions] = await Promise.all([
        readJson(join(certPath, "manifest.json")),
        readCertQuestions(certPath),
      ]);
      bankData.push({ manifest, questions });
      if (!options.offline) {
        for (const q of questions) {
          allPageUrls.add(sourcePageUrl(q.sourceUrl));
        }
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  let pageResults;
  if (!options.offline) {
    pageResults = await fetchPages([...allPageUrls], {
      concurrency: options.concurrency,
      timeoutMs: options.timeoutMs,
    });
  }

  const reports = bankData.map(({ manifest, questions }) =>
    buildClaimsReport(manifest, questions, {
      pageResults: options.offline ? undefined : pageResults,
    }),
  );

  if (options.json) {
    console.log(JSON.stringify(reports, null, 2));
  } else {
    for (const report of reports) {
      console.log(formatClaimsReport(report));
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
