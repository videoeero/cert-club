import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  ContentValidationError,
  validateCatalog,
  validateCertContent,
  validateRepository,
} from "../scripts/validate-content.mjs";
import {
  SCOPE_MIN_CORE_SHARE,
  SCOPE_MIN_SAMPLE,
} from "../schemas/question-bank.mjs";

const fixtureUrl = new URL("./fixtures/", import.meta.url);
const repositoryFixtureUrl = new URL("repository/", fixtureUrl);

async function readFixture(name, file) {
  return JSON.parse(
    await readFile(new URL(`${name}/${file}`, fixtureUrl), "utf8"),
  );
}

async function readFixtureQuestions(name) {
  const questionsUrl = new URL(`${name}/questions/`, fixtureUrl);
  const entries = await readdir(questionsUrl, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  const perFile = await Promise.all(
    files.map((file) => readFixture(name, `questions/${file}`)),
  );
  return perFile.flat();
}

async function validContent() {
  return {
    manifest: await readFixture("repository/certs/ccdv-f", "manifest.json"),
    questions: await readFixtureQuestions("repository/certs/ccdv-f"),
  };
}

test("accepts valid single- and multi-select questions", async () => {
  const { manifest, questions } = await validContent();

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("accepts a catalog that lists every cert folder exactly once", () => {
  assert.deepEqual(
    validateCatalog({ schemaVersion: 1, certs: ["ccdv-f", "az-900"] }, [
      "az-900",
      "ccdv-f",
    ]),
    ["ccdv-f", "az-900"],
  );
});

test("rejects duplicate and mismatched catalog entries", () => {
  assert.throws(
    () =>
      validateCatalog({ schemaVersion: 1, certs: ["ccdv-f", "ccdv-f"] }, [
        "ccdv-f",
      ]),
    /duplicate cert slug "ccdv-f"/,
  );
  assert.throws(
    () =>
      validateCatalog({ schemaVersion: 1, certs: ["ccdv-f", "missing-cert"] }, [
        "ccdv-f",
        "az-900",
      ]),
    /"missing-cert" has no matching cert folder/,
  );
  assert.throws(
    () =>
      validateCatalog({ schemaVersion: 1, certs: ["ccdv-f"] }, [
        "ccdv-f",
        "az-900",
      ]),
    /certs\/az-900: cert folder is not listed in catalog.json/,
  );
});

test("rejects the deliberately broken fixture", async () => {
  const manifest = await readFixture("broken", "manifest.json");
  const questions = await readFixture("broken", "questions.json");

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    ContentValidationError,
  );
});

test("rejects duplicate question IDs", async () => {
  const { manifest, questions } = await validContent();
  questions[1].id = questions[0].id;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /duplicate question ID/,
  );
});

test("enforces answer counts for single- and multi-select questions", async () => {
  const { manifest, questions } = await validContent();
  questions[0].correct = ["a", "b"];
  questions[1].correct = ["a"];

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /single-select questions must have exactly one correct option/,
  );
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /multi-select questions must have at least two correct options/,
  );
});

test("requires answer keys to reference real option IDs", async () => {
  const { manifest, questions } = await validContent();
  questions[0].correct = ["missing"];

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /references unknown option ID "missing"/,
  );
});

test("requires question domains and certs to match the manifest", async () => {
  const { manifest, questions } = await validContent();
  questions[0].domain = "unknown-domain";
  questions[1].cert = "another-cert";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /is not declared in the manifest/,
  );
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /expected "ccdv-f", received "another-cert"/,
  );
});

test("requires every manifest domain to have at least one question", async () => {
  const { manifest, questions } = await validContent();
  manifest.domains[0].weight = 99;
  manifest.domains.push({
    slug: "empty-domain",
    name: "Empty Domain",
    weight: 1,
  });

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /"empty-domain" has no questions\/empty-domain\.json file/,
  );
});

test("requires the manifest cert to match its folder", async () => {
  const { manifest, questions } = await validContent();

  assert.throws(
    () => validateCertContent("another-cert", manifest, questions),
    /expected "another-cert" to match the cert folder/,
  );
});

test("requires well-formed HTTP or HTTPS source URLs", async () => {
  const { manifest, questions } = await validContent();
  questions[0].sourceUrl = "ftp://example.com/source";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /must use HTTP or HTTPS/,
  );
});

test("requires concise, single-line source notes", async () => {
  const { manifest, questions } = await validContent();
  questions[0].sourceNote = "A".repeat(141);

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /questions\.0\.sourceNote/,
  );

  questions[0].sourceNote = "First line\nSecond line";
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /must be a single line without newlines/,
  );
});

test("rejects multi-select answers that are exactly the first options", async () => {
  const { manifest, questions } = await validContent();
  questions[1].options = [
    { id: "a", text: "First correct answer" },
    { id: "c", text: "Second correct answer" },
    { id: "b", text: "The distractor" },
  ];
  questions[1].correct = ["a", "c"];

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /must not be exactly the first options in listed order/,
  );
});

test("accepts multi-select answers that are not a leading run", async () => {
  const { manifest, questions } = await validContent();

  assert.deepEqual(questions[1].correct, ["a", "c"]);
  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("rejects a bank whose single-select answers are position-biased", async () => {
  const { manifest, questions } = await validContent();
  const template = questions[0];
  const biased = Array.from({ length: 24 }, (_, index) => ({
    ...structuredClone(template),
    id: `ccdv-f-1${String(index).padStart(3, "0")}`,
    // 20 of 24 answer in position 1, which is above the 50% ceiling.
    correct: [index < 20 ? "a" : "b"],
    distractorNotes: undefined,
  }));

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, biased),
    /single-select answers are biased toward position 1: 20 of 24/,
  );
});

test("ignores position bias below the minimum sample size", async () => {
  const { manifest, questions } = await validContent();
  const template = questions[0];
  const small = Array.from({ length: 10 }, (_, index) => ({
    ...structuredClone(template),
    id: `ccdv-f-2${String(index).padStart(3, "0")}`,
    correct: ["a"],
    distractorNotes: undefined,
  }));

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, small));
});

function lengthBiasBank(count, keyText, prefix) {
  const positions = ["a", "b", "c", "d"];

  return Array.from({ length: count }, (_, index) => ({
    id: `ccdv-f-${prefix}${String(index).padStart(3, "0")}`,
    cert: "ccdv-f",
    schemaVersion: 1,
    type: "single",
    domain: "tools-and-mcps",
    difficulty: "medium",
    status: "reviewed",
    scope: "core",
    stem: "Which option is correct?",
    // The key rotates through every position, so only length is exploitable.
    options: positions.map((id) => ({
      id,
      text:
        id === positions[index % positions.length]
          ? keyText
          : "A short distractor.",
    })),
    correct: [positions[index % positions.length]],
    explanation: "The key is the correct option.",
    sourceUrl: "https://example.com/source",
    sourceNote: "Section 1",
    sourceCheckedAt: "2026-09-03",
  }));
}

test("rejects a bank whose correct answers are systematically longer", async () => {
  const { manifest } = await validContent();
  const biased = lengthBiasBank(
    24,
    "A correct option carrying a great deal more qualifying detail than any of its distractors.",
    "3",
  );

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, biased),
    /correct options are length-biased: they run longer than their distractors/,
  );
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, biased),
    /biased toward the longest option: the key is the longest option in 24 of 24/,
  );
});

test("rejects a bank whose correct answers are systematically shorter", async () => {
  const { manifest } = await validContent();
  const biased = lengthBiasBank(24, "Short.", "4").map((question) => ({
    ...question,
    options: question.options.map((option) => ({
      ...option,
      text:
        option.text === "Short."
          ? option.text
          : "A distractor carrying a great deal more qualifying detail than the key does.",
    })),
  }));

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, biased),
    /correct options are length-biased: they run shorter than their distractors/,
  );
});

test("ignores length bias below the minimum sample size", async () => {
  const { manifest } = await validContent();
  const small = lengthBiasBank(
    10,
    "A correct option carrying a great deal more qualifying detail than any of its distractors.",
    "5",
  );

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, small));
});

test("accepts the shipped bank's answer lengths", async () => {
  const certUrl = new URL("../certs/ccdv-f/", import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL("manifest.json", certUrl), "utf8"),
  );
  const questionsUrl = new URL("questions/", certUrl);
  const files = (await readdir(questionsUrl, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  const questions = (
    await Promise.all(
      files.map(async (file) =>
        JSON.parse(await readFile(new URL(file, questionsUrl), "utf8")),
      ),
    )
  ).flat();

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("validates repository cert content", async () => {
  const result = await validateRepository(fileURLToPath(repositoryFixtureUrl));

  assert.deepEqual(result, { manifestCount: 1, questionCount: 2 });
});

test("accepts skill weights that total their domain weight", async () => {
  const { manifest, questions } = await validContent();
  manifest.domains[0].skills = [
    { slug: "mcp-architecture", name: "MCP Architecture", weight: 40 },
    { slug: "tool-implementation", name: "Tool Implementation", weight: 60 },
  ];
  questions[1].subdomain = "tool-implementation";

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("rejects skill weights that do not total the domain weight", async () => {
  const { manifest, questions } = await validContent();
  manifest.domains[0].skills = [
    { slug: "mcp-architecture", name: "MCP Architecture", weight: 40 },
    { slug: "tool-implementation", name: "Tool Implementation", weight: 50 },
  ];

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /skill weights must total the domain weight 100, received 90/,
  );
});

test("rejects duplicate skill slugs within a domain", async () => {
  const { manifest, questions } = await validContent();
  manifest.domains[0].skills = [
    { slug: "mcp-architecture", name: "MCP Architecture", weight: 40 },
    { slug: "mcp-architecture", name: "Duplicate", weight: 60 },
  ];

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /duplicate skill slug "mcp-architecture"/,
  );
});

test("requires question subdomains to name a declared skill", async () => {
  const { manifest, questions } = await validContent();
  manifest.domains[0].skills = [
    { slug: "mcp-architecture", name: "MCP Architecture", weight: 100 },
  ];

  // questions[1] has no subdomain at all.
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /questions\.1\.subdomain: is required because domain "tools-and-mcps" declares skills/,
  );

  questions[1].subdomain = "not-a-declared-skill";
  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /questions\.1\.subdomain: "not-a-declared-skill" is not a skill of domain "tools-and-mcps"/,
  );
});

test("leaves subdomains unchecked for domains without a skill breakdown", async () => {
  const { manifest, questions } = await validContent();
  questions[0].subdomain = "anything-at-all";

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("requires a scope note on questions that are not core", async () => {
  const { manifest, questions } = await validContent();
  questions[0].scope = "deep";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /is required when scope is "deep"/,
  );

  questions[0].scopeNote =
    "Tests exact CLI flag semantics, above sample level.";
  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("rejects a scope note on a core question", async () => {
  const { manifest, questions } = await validContent();
  questions[0].scopeNote = "Unjustified note.";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /must only be set when scope is not "core"/,
  );
});

test("rejects an unknown scope value", async () => {
  const { manifest, questions } = await validContent();
  questions[0].scope = "extended";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    ContentValidationError,
  );
});

test("requires every question to declare a scope", async () => {
  const { manifest, questions } = await validContent();
  delete questions[0].scope;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /questions\.0\.scope/,
  );
});

function scopedBank(count, deepCount) {
  const bank = lengthBiasBank(count, "A short distractor.", "scope");

  for (const question of bank.slice(0, deepCount)) {
    question.scope = "deep";
    question.scopeNote = "Above the sample questions' cognitive level.";
  }

  return bank;
}

test("rejects a bank whose exam-aligned slice falls below the floor", async () => {
  const { manifest } = await validContent();
  // One more than the floor tolerates: 24 * (1 - 0.8) = 4.8, so 5 tips it.
  const deep = Math.floor(24 * (1 - SCOPE_MIN_CORE_SHARE)) + 1;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, scopedBank(24, deep)),
    /too little of the bank is exam-aligned/,
  );

  assert.doesNotThrow(() =>
    validateCertContent("ccdv-f", manifest, scopedBank(24, deep - 1)),
  );
});

test("ignores the exam-aligned floor below the minimum sample size", async () => {
  const { manifest } = await validContent();
  const size = SCOPE_MIN_SAMPLE - 1;

  assert.doesNotThrow(() =>
    validateCertContent("ccdv-f", manifest, scopedBank(size, size)),
  );
});
