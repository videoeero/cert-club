import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  ContentValidationError,
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

async function validContent() {
  return {
    manifest: await readFixture(
      "repository/certs/ccdv-f",
      "manifest.json",
    ),
    questions: await readFixture(
      "repository/certs/ccdv-f",
      "questions.json",
    ),
  };
}

test("accepts valid single- and multi-select questions", async () => {
  const { manifest, questions } = await validContent();

  assert.doesNotThrow(() =>
    validateCertContent("ccdv-f", manifest, questions),
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

test("validates repository cert content", async () => {
  const result = await validateRepository(fileURLToPath(repositoryFixtureUrl));

  assert.deepEqual(result, { manifestCount: 1, questionCount: 2 });
});
