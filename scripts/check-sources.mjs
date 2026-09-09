import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parsePositiveInteger } from "./lib/cli.mjs";
import { AggregateMessageError } from "./lib/errors.mjs";
import { sourcePageUrl } from "./lib/source-url.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_MAX_AGE_DAYS = 180;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_TIMEOUT_MS = 10000;
const DAY_MS = 24 * 60 * 60 * 1000;

// A pointer repeated on every online run, not just failing ones: see "Source
// review" in certs/ccdv-f/review-progress.md, where an early drift pass
// reported 404 on seven pages that were all in fact live — an artefact of
// that pass's own fetcher, not doc drift. Nothing here may be trusted enough
// to call a page "dead"; it can only be "unconfirmed".
export const UNRELIABILITY_NOTE =
  "Online results are unconfirmed, not authoritative: certs/ccdv-f/review-progress.md " +
  '§ "Source review" records a past fetcher reporting 404 on seven pages that were ' +
  "all live. Reconfirm by a second method before touching a sourceUrl.";

export class SourceCheckError extends AggregateMessageError {
  constructor(messages = []) {
    super("Source check failed:", messages);
    this.name = "SourceCheckError";
  }
}

/**
 * Every distinct source page cited by a bank, with the oldest and newest
 * sourceCheckedAt across the questions that cite it. The oldest date is what
 * staleness is judged against — a URL is only as fresh as its least-recently
 * confirmed citation.
 */
export function groupSourcesByUrl(questions) {
  const byUrl = new Map();

  for (const question of questions) {
    const { sourceUrl, sourceCheckedAt } = question;
    const pageUrl = sourcePageUrl(sourceUrl);
    const existing = byUrl.get(pageUrl);
    if (existing === undefined) {
      byUrl.set(pageUrl, {
        url: pageUrl,
        citedUrls: new Set([sourceUrl]),
        oldestCheckedAt: sourceCheckedAt,
        newestCheckedAt: sourceCheckedAt,
        questionCount: 1,
      });
      continue;
    }

    existing.citedUrls.add(sourceUrl);
    existing.questionCount += 1;
    // sourceCheckedAt is YYYY-MM-DD, so lexicographic order is chronological.
    if (sourceCheckedAt < existing.oldestCheckedAt) {
      existing.oldestCheckedAt = sourceCheckedAt;
    }
    if (sourceCheckedAt > existing.newestCheckedAt) {
      existing.newestCheckedAt = sourceCheckedAt;
    }
  }

  // Code-unit sort, as in scripts/lib/read-certs.mjs: localeCompare without an
  // explicit locale varies with the host ICU locale.
  return [...byUrl.values()]
    .map((source) => ({ ...source, citedUrls: [...source.citedUrls].sort() }))
    .sort((left, right) =>
      left.url < right.url ? -1 : left.url > right.url ? 1 : 0,
    );
}

function startOfUtcDay(dateLike) {
  const date = new Date(dateLike);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Ages each grouped source against `today`, injected rather than read from
 * `new Date()` here so the arithmetic is testable at an exact boundary day.
 * `stale` uses a strict `>` so a URL checked exactly `maxAgeDays` ago is not
 * yet flagged — the boundary belongs to the freshness side.
 */
export function assessStaleness(sources, { today, maxAgeDays }) {
  const todayMs = startOfUtcDay(today);

  return sources.map((source) => {
    const ageDays = Math.round(
      (todayMs - startOfUtcDay(`${source.oldestCheckedAt}T00:00:00.000Z`)) /
        DAY_MS,
    );
    return {
      ...source,
      ageDays,
      stale: ageDays > maxAgeDays,
    };
  });
}

/**
 * Classifies one already-settled fetch response. Redirects are reported, not
 * hidden: a citation that now 301s to a different path is drift worth seeing
 * even though the content still resolves.
 */
/**
 * A Response's url never carries the fragment the request was made with, so a
 * plain string comparison reports every anchored citation as redirected
 * forever. Five of the shipped sourceUrls are anchored, so this is not
 * hypothetical. Compare the parts a redirect can actually change.
 */
function sameTarget(requested, final) {
  return sourcePageUrl(requested) === sourcePageUrl(final);
}

function classifyResponse(url, response) {
  const finalUrl = response.url || url;
  const redirected = response.redirected === true || !sameTarget(url, finalUrl);

  if (response.ok) {
    return {
      url,
      status: redirected ? "redirected" : "ok",
      finalUrl,
      httpStatus: response.status,
    };
  }
  if (response.status >= 500) {
    return {
      url,
      status: "server-error",
      finalUrl,
      httpStatus: response.status,
    };
  }
  return { url, status: "client-error", finalUrl, httpStatus: response.status };
}

// Statuses a documentation host may return to HEAD while serving the same URL
// perfectly well over GET. 404 is on the list deliberately: ccdv-f's review
// record has a drift pass reporting 404 on seven live pages, and a false "this
// citation is gone" is the one error this tool must not make. A genuinely dead
// link costs one extra request, which is a trade worth making.
const RETRY_WITH_GET = new Set([403, 404, 405, 501]);

/**
 * An unread body holds its socket open in undici, so every response is drained
 * before the next request goes out. HEAD bodies are empty but still need
 * releasing.
 */
async function releaseBody(response) {
  try {
    await response.body?.cancel();
  } catch {
    // Already consumed or never had a body; nothing to release.
  }
}

async function checkOneUrl(url, { fetcher, timeoutMs }) {
  try {
    let response = await fetcher(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (RETRY_WITH_GET.has(response.status)) {
      await releaseBody(response);
      response = await fetcher(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
    }
    const classified = classifyResponse(url, response);
    await releaseBody(response);
    return classified;
  } catch (error) {
    // fetcher is injectable, so a rejection can carry anything a caller or a
    // test mock throws — including a bare string or nothing at all. Reading
    // .name off that would replace the finding with a TypeError.
    const detail = error instanceof Error ? error.message : String(error);
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return { url, status: "timeout", finalUrl: url, detail };
    }
    return { url, status: "network-error", finalUrl: url, detail };
  }
}

/**
 * One request per distinct URL, bounded to `concurrency` in flight at once via
 * a fixed-size worker pool pulling from a shared cursor — simpler than a
 * semaphore library and exactly as bounded. `fetcher` defaults to the global
 * `fetch` but every test injects a mock, per this codebase's seam convention
 * (loadCertContent's fetcher, the sampler's random source).
 */
export async function checkLiveness(
  urls,
  {
    fetcher = fetch,
    concurrency = DEFAULT_CONCURRENCY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = {},
) {
  const results = new Array(urls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const index = cursor++;
      results[index] = await checkOneUrl(urls[index], { fetcher, timeoutMs });
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, urls.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

/**
 * The offline half for one cert: grouped, aged sources plus the manifest's
 * examUrl. examUrl carries no sourceCheckedAt, so it is reported without an
 * age — its only offline "check" is being present and well-formed, which
 * manifestSchema already enforces at validate time. It still needs to appear
 * here because it is one more URL the online job must not skip.
 */
export function buildOfflineReport(manifest, questions, { today, maxAgeDays }) {
  const sources = assessStaleness(groupSourcesByUrl(questions), {
    today,
    maxAgeDays,
  });

  return {
    cert: manifest.cert,
    examUrl: manifest.examUrl,
    sources,
    staleCount: sources.filter((source) => source.stale).length,
  };
}

function formatOfflineReport(report, maxAgeDays) {
  const lines = [];
  lines.push(
    `${report.cert}: ${report.sources.length} distinct source URL(s), max age ${maxAgeDays}d`,
  );
  lines.push(`  exam guide: ${report.examUrl}`);

  for (const source of report.sources) {
    const flag = source.stale ? " <-- stale" : "";
    lines.push(
      `  ${source.url}\n    oldest ${source.oldestCheckedAt}  newest ${source.newestCheckedAt}  age ${source.ageDays}d  (${source.questionCount} question(s))${flag}`,
    );
  }
  lines.push(`  ${report.staleCount} URL(s) past the staleness threshold.`);
  return lines.join("\n");
}

function formatLivenessResult(result) {
  // Every URL in the report is page-keyed into the liveness map, so a miss
  // should be impossible — but losing a 65-request run to a TypeError on the
  // final formatting pass is not a trade worth making.
  if (result === undefined) {
    return "  [unconfirmed:not-checked] (no liveness result for this URL)";
  }
  if (result.status === "ok") {
    return `  [ok] ${result.url}`;
  }
  if (result.status === "redirected") {
    return `  [redirected] ${result.url} -> ${result.finalUrl}`;
  }
  const detail = result.httpStatus ?? result.detail ?? "";
  return `  [unconfirmed:${result.status}] ${result.url} (${detail})`;
}

async function main() {
  const argv = process.argv.slice(2);
  const slugs = [];
  const options = {
    offline: false,
    json: false,
    strict: false,
    strictNetwork: false,
    maxAgeDays: DEFAULT_MAX_AGE_DAYS,
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--offline") {
      options.offline = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--strict-network") {
      options.strictNetwork = true;
    } else if (
      arg === "--max-age-days" ||
      arg === "--concurrency" ||
      arg === "--timeout-ms"
    ) {
      const raw = argv[(index += 1)];
      const value = parsePositiveInteger(raw);
      if (value === null) {
        console.error(`${arg} must be a positive integer, received "${raw}"`);
        process.exitCode = 1;
        return;
      }
      if (arg === "--max-age-days") {
        options.maxAgeDays = value;
      } else if (arg === "--concurrency") {
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

  if (
    !Number.isInteger(options.maxAgeDays) ||
    !Number.isInteger(options.concurrency) ||
    !Number.isInteger(options.timeoutMs) ||
    options.maxAgeDays < 1 ||
    options.concurrency < 1 ||
    options.timeoutMs < 1
  ) {
    console.error(
      "--max-age-days, --concurrency and --timeout-ms must each be a positive integer",
    );
    process.exitCode = 1;
    return;
  }

  let certFolders;
  try {
    certFolders = await listCertFolders(join(repositoryRoot, "certs"));
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
        new SourceCheckError(
          missing.map((slug) => `no such cert folder "${slug}"`),
        ).message,
      );
      process.exitCode = 1;
      return;
    }
    selected = slugs;
  }

  const today = new Date();
  const offlineReports = [];
  try {
    for (const slug of selected) {
      const certPath = join(repositoryRoot, "certs", slug);
      const [manifest, questions] = await Promise.all([
        readJson(join(certPath, "manifest.json")),
        readCertQuestions(certPath),
      ]);
      offlineReports.push(
        buildOfflineReport(manifest, questions, {
          today,
          maxAgeDays: options.maxAgeDays,
        }),
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  let livenessByUrl = new Map();
  if (!options.offline) {
    const allUrls = new Set();
    for (const report of offlineReports) {
      allUrls.add(sourcePageUrl(report.examUrl));
      for (const source of report.sources) {
        allUrls.add(source.url);
      }
    }
    const urls = [...allUrls];
    const results = await checkLiveness(urls, {
      concurrency: options.concurrency,
      timeoutMs: options.timeoutMs,
    });
    livenessByUrl = new Map(results.map((result) => [result.url, result]));
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          reports: offlineReports,
          liveness: options.offline ? undefined : [...livenessByUrl.values()],
          unreliabilityNote: options.offline ? undefined : UNRELIABILITY_NOTE,
        },
        null,
        2,
      ),
    );
  } else {
    for (const report of offlineReports) {
      console.log(formatOfflineReport(report, options.maxAgeDays));
      if (!options.offline) {
        // The staleness block above already listed every URL, so say what this
        // second pass over the same list is reporting.
        console.log(`  liveness:`);
        console.log(
          formatLivenessResult(
            livenessByUrl.get(sourcePageUrl(report.examUrl)),
          ),
        );
        for (const source of report.sources) {
          console.log(formatLivenessResult(livenessByUrl.get(source.url)));
        }
      }
    }
    if (!options.offline) {
      console.log(`\n${UNRELIABILITY_NOTE}`);
    }
  }

  const totalStale = offlineReports.reduce(
    (sum, report) => sum + report.staleCount,
    0,
  );
  const networkFailures = [...livenessByUrl.values()].filter((result) =>
    ["client-error", "server-error", "timeout", "network-error"].includes(
      result.status,
    ),
  ).length;

  // Staleness is deterministic and safe to gate on; a vendor's transient
  // outage is not, so it only ever fails the run when explicitly opted in.
  if (options.strict && totalStale > 0) {
    console.error(
      `\nSource check failed: ${totalStale} URL(s) past the ${options.maxAgeDays}-day staleness threshold.`,
    );
    process.exitCode = 1;
  }
  if (options.strictNetwork && networkFailures > 0) {
    console.error(
      `\nSource check failed: ${networkFailures} URL(s) could not be confirmed. These are unconfirmed, not dead — see the note above.`,
    );
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
