import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

/**
 * The agent workflows in `skills/` are procedural wrappers over `AGENTS.md`,
 * `CONTRIBUTING.md` and `certs/ADDING-A-CERT.md`. Two properties keep them
 * wrappers rather than a fourth copy of the rules, and neither is visible in
 * a diff of a single file.
 *
 * The first is that they carry no numeric thresholds. Every bank-level guard
 * threshold is an exported constant in `schemas/question-bank.mjs`, and
 * `npm run metrics` prints each one with its pass/fail. A number copied into
 * a workflow reads as authoritative, is never cross-checked against the
 * constant, and so is strictly worse than no number at all — the `scope` enum
 * drift in `ADDING-A-CERT.md` is what that failure mode looks like once live.
 *
 * The second is a line budget. These bodies are judgement only; over budget
 * in practice means repo-doc content has been pasted in.
 *
 * The layout is the portable Agent Skills one (`skills/<name>/SKILL.md`), so
 * `npx skills add .` installs them into any agent that supports it. Nothing
 * under `skills/` is agent-specific, and the install targets are gitignored —
 * which is why the frontmatter is checked here rather than trusted to a
 * particular agent noticing it is malformed.
 */

const workflowsRoot = fileURLToPath(new URL("../skills", import.meta.url));

const MAX_LINES = 80;

/**
 * Deliberately narrow. These match a bare percentage or character count used
 * as a limit — the shape the guard thresholds actually take in
 * `CONTRIBUTING.md` ("more than 10 characters", "at most 45% of") — and
 * nothing else. A broad "any digit" scan would fire on stage numbers, list
 * ordinals and `schemaVersion`, and would be turned off rather than obeyed.
 */
const THRESHOLD_PATTERNS = [
  { name: "a bare percentage", pattern: /\b\d+(?:\.\d+)?\s*%/ },
  { name: "a character count", pattern: /\b\d+\s+characters?\b/i },
];

/**
 * Line endings are normalised once, here, rather than by threading `\r?` into
 * every pattern below. A CRLF checkout cannot pass `npm run check` anyway —
 * Prettier's `endOfLine` default of "lf" rejects it at `format:check` — but a
 * frontmatter regex that silently stops matching is a worse way to find that
 * out than a formatting error that names the file.
 */
async function readSkill(name) {
  const path = join(workflowsRoot, name, "SKILL.md");
  try {
    const text = (await readFile(path, "utf8")).replace(/\r\n/g, "\n");
    return { name, path, text };
  } catch (cause) {
    // Deliberately not filtered out. A directory under skills/ with no
    // SKILL.md is one the installer skips in silence, so the workflow would
    // never reach an agent and nobody would notice. Surface it as a named
    // failing test rather than an ENOENT thrown during module evaluation,
    // which would abort the whole file before any test reports.
    return { name, path, text: null, cause };
  }
}

const workflowNames = (await readdir(workflowsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort();

const skills = await Promise.all(workflowNames.map(readSkill));

test("skills/ holds at least one workflow", () => {
  assert.ok(skills.length > 0, "no workflows found under skills/");
});

for (const { name, text, cause } of skills) {
  if (text === null) {
    test(`${name} has a SKILL.md`, () => {
      assert.fail(
        `skills/${name}/ has no readable SKILL.md (${cause.code}). Every ` +
          "directory under skills/ is a workflow; the installer skips the rest.",
      );
    });
    continue;
  }

  test(`${name} states no numeric threshold`, () => {
    for (const { name: shape, pattern } of THRESHOLD_PATTERNS) {
      const match = text.match(pattern);
      assert.equal(
        match,
        null,
        `skills/${name}/SKILL.md contains ${shape} ("${match?.[0]}"). ` +
          "Thresholds are exported constants; point at `npm run metrics` instead.",
      );
    }
  });

  test(`${name} stays inside its line budget`, () => {
    const lines = text.replace(/\n$/, "").split("\n").length;
    assert.ok(
      lines <= MAX_LINES,
      `skills/${name}/SKILL.md is ${lines} lines, budget is ${MAX_LINES}`,
    );
  });

  test(`${name} declares a name and a description`, () => {
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `skills/${name}/SKILL.md has no frontmatter block`);
    assert.match(frontmatter[1], /^description: /m);
    assert.match(frontmatter[1], /^name: /m, "frontmatter declares no name");
    assert.equal(
      frontmatter[1].match(/^name: (.+)$/m)?.[1]?.trim(),
      name,
      "frontmatter name must match the directory name",
    );
  });
}
