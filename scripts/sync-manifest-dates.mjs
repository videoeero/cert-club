import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { AggregateMessageError } from "./lib/errors.mjs";
import { readCertQuestions, readJson } from "./lib/read-certs.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class SyncDatesError extends AggregateMessageError {
  constructor(messages = []) {
    super("Sync manifest dates failed:", messages);
    this.name = "SyncDatesError";
  }
}

function runGit(args, cwd = repositoryRoot) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function applyManifestUpdatedAt(manifest, updatedAt) {
  const updated = {};
  let inserted = false;
  for (const [key, value] of Object.entries(manifest)) {
    if (key === "updatedAt") {
      updated.updatedAt = updatedAt;
      inserted = true;
      continue;
    }
    updated[key] = value;
    if (key === "status" && !inserted) {
      updated.updatedAt = updatedAt;
      inserted = true;
    }
  }
  if (!inserted) {
    updated.updatedAt = updatedAt;
  }
  return updated;
}

/**
 * Derives the last updated date for a certification folder:
 * 1. If any non-manifest file in certs/<slug>/ has uncommitted working-tree changes,
 *    returns today's calendar date.
 * 2. Otherwise returns the newest git commit author date touching certs/<slug>/.
 * 3. Falls back to the latest question sourceCheckedAt if that exceeds the git date,
 *    or the existing manifest.updatedAt if git history is unavailable (e.g. shallow clone).
 */
export function deriveCertUpdatedDate(
  certSlug,
  manifest,
  questions,
  options = {},
) {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const gitRunner = options.gitRunner ?? runGit;

  let maxSourceDate = "";
  for (const question of questions) {
    if (question.sourceCheckedAt > maxSourceDate) {
      maxSourceDate = question.sourceCheckedAt;
    }
  }

  // Check uncommitted changes in certs/<certSlug>/, ignoring manifest.json itself.
  const manifestRelativePath = posix.join("certs", certSlug, "manifest.json");
  const certRelativePath = posix.join("certs", certSlug);
  const statusOutput = gitRunner([
    "status",
    "--porcelain",
    "--",
    certRelativePath,
  ]);
  const hasUncommittedChanges = statusOutput.split("\n").some((line) => {
    if (line.length < 4) {
      return false;
    }
    const rawPath = line.slice(3).trim().split(" -> ").pop();
    const filePath = rawPath.replace(/^"|"$/g, "");
    return filePath !== manifestRelativePath;
  });

  if (hasUncommittedChanges) {
    return today;
  }

  const gitDate = gitRunner([
    "log",
    "-1",
    "--format=%as",
    "--",
    certRelativePath,
  ]);

  let derivedDate = gitDate || manifest.updatedAt || today;
  if (maxSourceDate && maxSourceDate > derivedDate) {
    derivedDate = maxSourceDate;
  }
  return derivedDate;
}

export async function syncManifestDates(options = {}) {
  const root = options.repositoryRoot ?? repositoryRoot;
  const certsRoot = join(root, "certs");
  const readJsonFn = options.readJsonFn ?? readJson;
  const writeJsonFn = options.writeJsonFn ?? writeFile;
  const readQuestionsFn = options.readQuestionsFn ?? readCertQuestions;

  const catalog = await readJsonFn(join(certsRoot, "catalog.json"));
  const certSlugs = catalog.certs;
  const isCheckMode = Boolean(options.check);
  const messages = [];
  const updates = [];

  for (const certSlug of certSlugs) {
    const certFolder = join(certsRoot, certSlug);
    const manifestPath = join(certFolder, "manifest.json");
    const manifest = await readJsonFn(manifestPath);
    const questions = await readQuestionsFn(certFolder);

    const targetDate = deriveCertUpdatedDate(
      certSlug,
      manifest,
      questions,
      options,
    );

    if (manifest.updatedAt !== targetDate) {
      if (isCheckMode) {
        messages.push(
          `${certSlug}: manifest.updatedAt "${manifest.updatedAt}" is out of sync with git/content date "${targetDate}"`,
        );
      } else {
        const previous = manifest.updatedAt;
        const updatedManifest = applyManifestUpdatedAt(manifest, targetDate);
        await writeJsonFn(
          manifestPath,
          `${JSON.stringify(updatedManifest, null, 2)}\n`,
          "utf8",
        );
        updates.push({
          cert: certSlug,
          previous,
          updated: targetDate,
        });
      }
    }
  }

  if (messages.length > 0) {
    throw new SyncDatesError(messages);
  }

  return updates;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const isCheck = process.argv.includes("--check");
  try {
    const updates = await syncManifestDates({ check: isCheck });
    if (updates.length > 0) {
      for (const update of updates) {
        console.log(
          `[sync-dates] Updated ${update.cert} manifest.updatedAt -> ${update.updated}`,
        );
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
