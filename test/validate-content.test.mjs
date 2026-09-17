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

test("rejects an option repeated as another option", async () => {
  const { manifest, questions } = await validContent();
  const [first, second] = questions[0].options;
  second.text = first.text;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /duplicate option text/,
  );
});

test("treats options differing only in case or spacing as duplicates", async () => {
  // How a candidate reads them, not how they compare byte-for-byte: an
  // authoring pass that clobbers one option with another rarely reproduces
  // the whitespace exactly, and the item still has one fewer distractor.
  const { manifest, questions } = await validContent();
  const [first, second] = questions[0].options;
  second.text = `  ${first.text.toUpperCase()}  `;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /duplicate option text/,
  );
});

test("rejects a single-select item whose key is the only unqualified option", async () => {
  const { manifest, questions } = await validContent();
  const [distractor] = questions[0].options;
  distractor.text = "This one is always wrong";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /only one carrying no absolute qualifier/,
  );
});

test("accepts the same item once one distractor drops its absolute", async () => {
  // The documented fix, exercised end to end: softening the over-claim in a
  // single distractor is enough, because the strategy then leaves two options
  // standing and no longer answers the item on its own.
  const { manifest, questions } = await validContent();
  const [first] = questions[0].options;
  first.text = "This one is always wrong";
  questions[0].options.push({ id: "c", text: "This one is wrong too" });
  questions[0].distractorNotes = {
    ...questions[0].distractorNotes,
    c: "Wrong for a second reason.",
  };

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("ignores an absolute qualifier that the key itself carries", async () => {
  // The key is not the survivor here, so the strategy gains nothing. Keys are
  // allowed their absolutes: a source often states a genuinely universal rule,
  // and hedging the key to satisfy a word list would make it less true.
  const { manifest, questions } = await validContent();
  const [distractor, key] = questions[0].options;
  distractor.text = "This one is always wrong";
  key.text = "This one is never wrong";

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("leaves multi-select items outside the absolute-qualifier check", async () => {
  const { manifest, questions } = await validContent();
  const multi = questions.find((question) => question.type === "multi");
  for (const option of multi.options) {
    if (!multi.correct.includes(option.id)) {
      option.text = `${option.text} in every case`;
    }
  }

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
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

test("requires every manifest to declare a bank status", async () => {
  const { manifest, questions } = await validContent();
  delete manifest.status;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.status/,
  );
});

test("requires every manifest to declare an updatedAt date", async () => {
  const { manifest, questions } = await validContent();
  delete manifest.updatedAt;

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.updatedAt/,
  );
});

test("rejects an updatedAt date older than a question's sourceCheckedAt", async () => {
  const { manifest, questions } = await validContent();
  manifest.updatedAt = "2020-01-01";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.updatedAt: "2020-01-01" is older than question/,
  );
});

test("reports the latest question sourceCheckedAt when manifest.updatedAt is older", async () => {
  const { manifest, questions } = await validContent();
  questions[0].sourceCheckedAt = "2026-05-01";
  questions[1].sourceCheckedAt = "2026-09-08";
  manifest.updatedAt = "2026-08-01";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    new RegExp(
      `manifest\\.updatedAt: "2026-08-01" is older than question ${questions[1].id}'s sourceCheckedAt "2026-09-08"`,
    ),
  );
});

test("rejects an unparsable or malformed updatedAt date", async () => {
  const { manifest, questions } = await validContent();
  manifest.updatedAt = "not-a-date";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.updatedAt/,
  );
});

test("rejects an updatedAt date in the future", async () => {
  const { manifest, questions } = await validContent();
  manifest.updatedAt = "2099-01-01";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.updatedAt: cannot be in the future/,
  );
});

test("rejects a question sourceCheckedAt in the future", async () => {
  const { manifest, questions } = await validContent();
  questions[0].sourceCheckedAt = "2099-01-01";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /questions\.0\.sourceCheckedAt: cannot be in the future/,
  );
});

test("accepts dates matching the earliest active calendar day on Earth (UTC+14)", async () => {
  const { manifest, questions } = await validContent();
  const earthToday = new Date(Date.now() + 14 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  manifest.updatedAt = earthToday;
  questions[0].sourceCheckedAt = earthToday;

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
});

test("rejects an unknown manifest status", async () => {
  const { manifest, questions } = await validContent();
  manifest.status = "reviewed";

  assert.throws(
    () => validateCertContent("ccdv-f", manifest, questions),
    /manifest\.status/,
  );
});

test("accepts a draft bank", async () => {
  const { manifest, questions } = await validContent();
  manifest.status = "draft";

  assert.doesNotThrow(() => validateCertContent("ccdv-f", manifest, questions));
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
    stem: "Which option is correct?",
    // The key rotates through every position, so only length is exploitable.
    options: positions.map((id) => ({
      id,
      // Distinct per option, and all the same length: the bank-level length
      // guards these fixtures exercise measure means, so uniform padding
      // leaves the arithmetic alone while keeping the options non-identical.
      text:
        id === positions[index % positions.length]
          ? keyText
          : `A short distractor ${id}.`,
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
          : `A distractor carrying a great deal more qualifying detail ${option.id}.`,
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
