import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { listCertFolders, readJson } from "../scripts/lib/read-certs.mjs";

/**
 * `certs/ADDING-A-CERT.md` requires every cert to carry a row in the root
 * README's Certifications table, and that row restates the bank status held
 * in `manifest.json`. Exam facts and domain weights are deliberately *not*
 * duplicated there — status is, because a reader deciding whether to trust a
 * bank should not have to open a manifest to find out.
 *
 * That makes status the one fact in this repository with two sources of truth
 * and no guard, which is exactly the shape `field-parity.test.mjs` exists to
 * prevent for the question schema. It had already drifted once: `ccar-f` and
 * `ccar-p` were promoted to `stable` in their manifests while the table went
 * on advertising both as `draft`, understating two banks for as long as it
 * took someone to read both files side by side. Nothing failed, which is the
 * problem.
 *
 * The table is the authority on presentation and the manifest on fact, so a
 * mismatch here is always fixed by correcting the README.
 */

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const certsPath = join(repositoryRoot, "certs");
const readmePath = join(repositoryRoot, "README.md");

/**
 * Matches one body row of the Certifications table: display name, then the
 * slug in backticks, then the status, then the review-record link. Anchored on
 * the backticked slug and the `certs/<slug>/` link rather than on the table's
 * position in the file, so inserting a section above it changes nothing.
 */
const ROW_PATTERN =
  /^\|\s*(?<name>[^|]+?)\s*\|\s*`(?<slug>[a-z0-9-]+)`\s*\|\s*(?<status>[a-z]+)\s*\|\s*\[[^\]]+\]\((?<record>[^)]+)\)\s*\|$/gm;

/**
 * The README writes cert names with an en dash and at least one manifest uses
 * an ASCII hyphen. Both render as the same name to a reader, and neither is
 * wrong, so the comparison ignores the distinction rather than forcing a
 * content edit to satisfy a test about statuses.
 */
function normalizeName(value) {
  return value.replace(/[‐-―]/g, "-").replace(/\s+/g, " ").trim();
}

const readmeText = (await readFile(readmePath, "utf8")).replace(/\r\n/g, "\n");
const rows = [...readmeText.matchAll(ROW_PATTERN)].map((match) => match.groups);
const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));

const slugs = (await listCertFolders(certsPath)).sort();
const manifests = new Map(
  await Promise.all(
    slugs.map(async (slug) => [
      slug,
      await readJson(join(certsPath, slug, "manifest.json")),
    ]),
  ),
);

test("the README Certifications table is parseable", () => {
  assert.ok(
    rows.length > 0,
    `no Certifications table rows matched in ${readmePath}. If the table's ` +
      "columns changed, update ROW_PATTERN rather than deleting this test.",
  );
  assert.equal(
    rowsBySlug.size,
    rows.length,
    "the README table lists a slug more than once",
  );
});

test("the README table lists every cert folder exactly once", () => {
  assert.deepEqual(
    [...rowsBySlug.keys()].sort(),
    slugs,
    "README table slugs do not match the folders under certs/",
  );
});

for (const slug of slugs) {
  test(`${slug}: README bank status matches its manifest`, () => {
    const row = rowsBySlug.get(slug);
    assert.ok(row, `${slug} has no row in the README Certifications table`);
    assert.equal(
      row.status,
      manifests.get(slug).status,
      `README advertises ${slug} as "${row.status}" but its manifest says ` +
        `"${manifests.get(slug).status}". Correct the README.`,
    );
  });

  test(`${slug}: README name matches its manifest`, () => {
    const row = rowsBySlug.get(slug);
    assert.ok(row, `${slug} has no row in the README Certifications table`);
    assert.equal(
      normalizeName(row.name),
      normalizeName(manifests.get(slug).name),
      `README calls ${slug} "${row.name}" but its manifest name is ` +
        `"${manifests.get(slug).name}"`,
    );
  });

  test(`${slug}: README review-record link resolves`, async () => {
    const row = rowsBySlug.get(slug);
    assert.ok(row, `${slug} has no row in the README Certifications table`);
    const target = resolve(repositoryRoot, row.record.replace(/^\.\//, ""));
    await assert.doesNotReject(
      access(target),
      `README links ${slug} to ${row.record}, which does not exist`,
    );
  });
}
