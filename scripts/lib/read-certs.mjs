import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { AggregateMessageError, ContentValidationError } from "./errors.mjs";

/**
 * Reading helpers shared by every script that walks certs/. The error wrapping
 * is deliberately the validator's: a raw ENOENT or JSON.parse stack tells an
 * author nothing about which file under certs/ is broken.
 */
export async function readJson(path) {
  let source;
  try {
    source = await readFile(path, "utf8");
  } catch (error) {
    throw new ContentValidationError([`${path}: ${error.message}`]);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new ContentValidationError([
      `${path}: invalid JSON (${error.message})`,
    ]);
  }
}

/**
 * Every questions/*.json file in one cert folder, read in filename order and
 * flattened into a single bank. Order matters because the bank-level guards and
 * the repository-wide duplicate-ID check report positional indices.
 *
 * Dot-files are skipped: AppleDouble "._name.json" siblings appear whenever the
 * tree is copied through a non-Apple filesystem, and parsing one as a question
 * bank fails in a way that points at the wrong problem.
 */
export async function readCertQuestions(certPath) {
  const questionsPath = join(certPath, "questions");
  let entries;
  try {
    entries = await readdir(questionsPath, { withFileTypes: true });
  } catch (error) {
    throw new ContentValidationError([`${questionsPath}: ${error.message}`]);
  }

  const files = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".json") &&
        !entry.name.startsWith("."),
    )
    .map((entry) => join(questionsPath, entry.name))
    .sort();

  // Read every file before failing, so an author fixing malformed JSON sees all
  // of it in one run rather than one file per attempt.
  const results = await Promise.allSettled(files.map((file) => readJson(file)));
  const banks = [];
  const messages = [];
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      if (result.reason instanceof AggregateMessageError) {
        // An aggregate carrying no messages would contribute nothing and let
        // the whole failure vanish, so fall back to its formatted message.
        messages.push(
          ...(result.reason.messages.length > 0
            ? result.reason.messages
            : [result.reason.message]),
        );
        continue;
      }
      throw result.reason;
    }

    // Each file must hold a bank, not a lone question: flattening a bare object
    // would absorb it as if it had been one element of an array, and a null or
    // a primitive would surface much later as a TypeError in a caller.
    if (!Array.isArray(result.value)) {
      messages.push(`${files[index]}: expected a JSON array of questions`);
      continue;
    }

    banks.push(result.value);
  }

  if (messages.length > 0) {
    throw new ContentValidationError(messages);
  }

  return banks.flat();
}

/**
 * Cert folder names under certs/, sorted by code unit — the same ordering as
 * the question files above, and unlike localeCompare it cannot vary with the
 * host locale, so local and CI runs agree. Dot-directories are skipped so local
 * tool config sitting in the tree is never mistaken for a cert. Whether an empty
 * result is an error is a policy call left to the caller.
 */
export async function listCertFolders(certsPath) {
  let entries;
  try {
    entries = await readdir(certsPath, { withFileTypes: true });
  } catch (error) {
    throw new ContentValidationError([`${certsPath}: ${error.message}`]);
  }

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}
