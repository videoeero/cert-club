import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { AggregateMessageError } from "./lib/errors.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";

/**
 * Workstream 5 Stage A: an offline enumerator for the figure-bearing population.
 *
 * This script contains no hard checks and reaches no network. It lists every
 * figure found in the free-text provenance surface, per bank, and exits 0
 * whatever it finds — it reports, it does not gate. A reviewer adjudicates each
 * figure against the cited page; no regex draws the vendor-attribution
 * distinction that separates a documented figure from an invented one.
 *
 * Its value is that the population is reproducible. The hand-selected
 * population it replaces missed 12 of 62 items across five banks, and no
 * detection rule had ever been written down. Do not let a green run imply the
 * figures are sourced; it only means they have all been listed.
 */

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class ClaimsCheckError extends AggregateMessageError {
  constructor(messages = []) {
    super("Claims check failed:", messages);
    this.name = "ClaimsCheckError";
  }
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
 *
 * Boundary rules, each of which produced a silent miscount before being found:
 * - No trailing \b on the % branch. A word boundary after a non-word character
 *   asserts that a word character follows, so "85%," and "85% of" never match.
 * - [\s-]* unit separator, because units attach with a hyphen at least as often
 *   as a space in this corpus ("24-hour", "5-minute", "30-day").
 *
 * Match extent matters as much as match presence: the listing is what a reviewer
 * carries to the cited page, so a figure must be reported whole.
 * - Currency takes [\d,.]* after the first digit, or "$500" reports as "$5".
 * - An optional range arm keeps the lower bound, or "1,000-2,000 tokens" reports
 *   as "2,000 tokens".
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
 * Build an offline claims report for a single bank, enumerating all
 * figure-bearing questions in sorted ID order.
 */
export function buildClaimsReport(manifest, questions) {
  // Code-unit sort, as in scripts/lib/read-certs.mjs and check-sources.mjs:72:
  // localeCompare without an explicit locale varies with the host ICU locale,
  // and this ordering is what makes two runs diff cleanly.
  const sortedQuestions = [...questions].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
  const figureBearingQuestions = [];

  for (const q of sortedQuestions) {
    const figures = extractFigures(q);
    if (figures.length > 0) {
      figureBearingQuestions.push({
        id: q.id,
        figures,
      });
    }
  }

  return {
    cert: manifest.cert,
    totalQuestions: questions.length,
    figureBearingQuestions,
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
  for (const item of report.figureBearingQuestions) {
    lines.push(`  ${item.id}`);
    for (const { field, figure } of item.figures) {
      lines.push(`    ${field}: ${figure}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const slugs = [];
  let json = false;

  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
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

  const reports = [];
  try {
    for (const slug of selected) {
      const certPath = join(certsPath, slug);
      const [manifest, questions] = await Promise.all([
        readJson(join(certPath, "manifest.json")),
        readCertQuestions(certPath),
      ]);
      reports.push(buildClaimsReport(manifest, questions));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (json) {
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
