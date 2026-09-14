import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { manifestSchema, questionSchema } from "../schemas/question-bank.mjs";

/**
 * The question shape has two independent sources of truth: the zod
 * `questionSchema` here in `schemas/question-bank.mjs`, and the hand-rolled
 * `isQuestion` type guard in `src/lib/content.ts` (zod is not shipped in the
 * browser bundle). Nothing else in the repo checks that the two agree, so a
 * field added to one and not the other would pass `npm run validate` and then
 * be silently dropped — or silently accepted — at runtime.
 *
 * `isQuestion` is module-private, so it is exercised the way the app actually
 * uses it: through `loadCertContent`, via an injected fetcher.
 */

const contentUrl = new URL("../src/lib/content.ts", import.meta.url);
const contentPath = fileURLToPath(contentUrl);

/**
 * `content.ts` reads `import.meta.env.BASE_URL` (a Vite-injected global) at
 * call time inside `contentUrl()`. Under plain `node --test` — no Vite —
 * `import.meta.env` is simply `undefined`, so any call into `loadCertManifest`
 * / `loadCertContent` throws a `TypeError` before ever reaching the fetcher.
 * This load hook rewrites that one expression, for this one file only, to
 * read from a global this test controls instead. It changes nothing on disk
 * under `src/` — it only patches the in-memory source Node compiles.
 *
 * The obvious simplification is to make `normalizedBaseUrl` tolerate a missing
 * env (`import.meta.env?.BASE_URL ?? "/"`), which would let plain Node import
 * this module with no hook at all. It is deliberately not done: `vite.config.ts`
 * sets `base: "/cert-club/"`, so defaulting to `"/"` would turn a
 * misconfigured build from a loud startup failure into every content fetch
 * silently 404ing against the wrong path. The hook keeps that cost inside the
 * test instead of moving it into production.
 */
const hooks = registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (url !== contentUrl.href) {
      return result;
    }
    const source = Buffer.isBuffer(result.source)
      ? result.source.toString("utf8")
      : typeof result.source === "string"
        ? result.source
        : Buffer.from(result.source).toString("utf8");
    return {
      ...result,
      source: source.replaceAll(
        "import.meta.env",
        "globalThis.__FIELD_PARITY_IMPORT_META_ENV__",
      ),
    };
  },
});
globalThis.__FIELD_PARITY_IMPORT_META_ENV__ = { BASE_URL: "/" };

const { loadCertContent, loadCertManifest } = await import(contentPath);

// The module is loaded and cached, so the hook has done its job. Leaving it
// registered would put every later module load in this process through it.
hooks.deregister();

/** Required keys, derived from the schema rather than hardcoded — a
 * hardcoded list would itself be a second source of truth, which is exactly
 * what this test exists to avoid. zod v4 exposes each shape entry's own
 * wrapper type, and `ZodOptional` fields answer `isOptional()` truthfully. */
function requiredQuestionFields() {
  return Object.entries(questionSchema.shape)
    .filter(([, field]) => !field.isOptional())
    .map(([key]) => key);
}

function requiredManifestFields() {
  return Object.entries(manifestSchema.shape)
    .filter(([, field]) => !field.isOptional())
    .map(([key]) => key);
}

function validManifest() {
  return {
    schemaVersion: 1,
    cert: "test-cert",
    name: "Test certification",
    status: "stable",
    updatedAt: "2026-09-03",
    examUrl: "https://example.com/exam-guide",
    contentLicense: "CC-BY-SA-4.0",
    domains: [{ slug: "alpha", name: "Alpha", weight: 100 }],
  };
}

function validQuestion() {
  return {
    id: "test-cert-alpha-001",
    cert: "test-cert",
    schemaVersion: 1,
    type: "single",
    domain: "alpha",
    difficulty: "medium",
    status: "reviewed",
    stem: "Which option is correct?",
    options: [
      { id: "a", text: "The distractor" },
      { id: "b", text: "The correct answer" },
    ],
    correct: ["b"],
    explanation: "B is correct because the fixture says so.",
    sourceUrl: "https://example.com/source",
    sourceNote: "Fixture source",
    sourceCheckedAt: "2026-09-03",
  };
}

function fetcherFor(manifest, questions) {
  return async (url) => {
    const href = String(url);
    if (href.endsWith("/manifest.json")) {
      return jsonResponse(manifest);
    }
    if (href.endsWith("/questions/alpha.json")) {
      return jsonResponse(questions);
    }
    throw new Error(`Unexpected fetch in test fixture: ${href}`);
  };
}

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
  };
}

test("the fixture question is valid against questionSchema", () => {
  assert.doesNotThrow(() => questionSchema.parse(validQuestion()));
});

test("loadCertContent accepts a manifest and question bank that satisfy the schema", async () => {
  const content = await loadCertContent(
    "test-cert",
    fetcherFor(validManifest(), [validQuestion()]),
  );
  assert.equal(content.questions.length, 1);
  assert.equal(content.questions[0].id, "test-cert-alpha-001");
});

test("the required-field set is actually derived from the schema", () => {
  const fields = requiredQuestionFields();

  // Not an expected list — that would be the second source of truth this file
  // exists to prevent. These are load-bearing fields whose presence proves the
  // reflection still works, plus a floor so a broken derivation cannot silently
  // reduce the generated tests below to zero.
  for (const field of ["id", "cert", "type", "stem", "options", "correct"]) {
    assert.ok(fields.includes(field), `expected "${field}" to be required`);
  }
  assert.ok(
    fields.length >= 11,
    `derived only ${fields.length} required field(s) — reflection is probably broken`,
  );
  assert.ok(
    !fields.includes("subdomain") && !fields.includes("distractorNotes"),
    "optional fields must not be treated as required",
  );
});

for (const field of requiredQuestionFields()) {
  test(`loadCertContent rejects a question missing the required field "${field}"`, async () => {
    const question = validQuestion();
    delete question[field];

    await assert.rejects(
      loadCertContent("test-cert", fetcherFor(validManifest(), [question])),
      {
        name: "ContentLoadError",
        // fetchJson raises the same class for a transport or JSON failure, so
        // pin the message: this test must only pass because isQuestion said no.
        message: /question bank does not match the expected schema/,
      },
    );
  });
}

test("loadCertContent accepts a question carrying every optional field", async () => {
  const question = {
    ...validQuestion(),
    subdomain: "alpha-skill",
    distractorNotes: { a: "Plausible because X, but wrong because Y." },
  };
  assert.equal(questionSchema.safeParse(question).success, true);

  const content = await loadCertContent(
    "test-cert",
    fetcherFor(validManifest(), [question]),
  );

  assert.equal(content.questions.length, 1);
  assert.equal(content.questions[0].subdomain, "alpha-skill");
  assert.deepEqual(content.questions[0].distractorNotes, {
    a: "Plausible because X, but wrong because Y.",
  });
});

test("questionSchema rejects a question with an unrecognized extra field", () => {
  const question = { ...validQuestion(), unexpectedField: "surprise" };
  const result = questionSchema.safeParse(question);
  assert.equal(result.success, false);
});

/**
 * The two guards diverge here on purpose, and this test exists so the asymmetry
 * reads as intent rather than as an oversight a future author should "fix".
 *
 * `questionSchema` is `.strict()` because it guards what the repository emits:
 * `npm run check` runs it over all of `certs/` on every PR, so a stray or
 * misspelled field fails review rather than shipping. `isQuestion` guards what
 * the browser receives, where the right posture is the opposite — a runtime
 * guard that rejected unknown fields would make any additive content change
 * white-screen every reader still holding a cached bundle, which is precisely
 * what `schemaVersion` exists to let us avoid.
 *
 * Strict at the gate, tolerant at runtime. What must NOT diverge is the set of
 * required fields, and the generated tests above are what enforce that.
 */
test("the runtime guard tolerates an unrecognized extra field the schema rejects", async () => {
  const question = { ...validQuestion(), unexpectedField: "surprise" };
  const content = await loadCertContent(
    "test-cert",
    fetcherFor(validManifest(), [question]),
  );
  assert.equal(content.questions.length, 1);
});

test("the required-manifest-field set is actually derived from the schema", () => {
  const fields = requiredManifestFields();

  for (const field of [
    "schemaVersion",
    "cert",
    "name",
    "status",
    "updatedAt",
    "examUrl",
    "contentLicense",
    "domains",
  ]) {
    assert.ok(
      fields.includes(field),
      `expected "${field}" to be required on manifest`,
    );
  }
  assert.ok(
    !fields.includes("examQuestionCount") &&
      !fields.includes("examDurationMinutes"),
    "optional manifest fields must not be treated as required",
  );
});

for (const field of requiredManifestFields()) {
  test(`loadCertManifest rejects a manifest missing the required field "${field}"`, async () => {
    const manifest = validManifest();
    delete manifest[field];

    await assert.rejects(
      loadCertManifest("test-cert", fetcherFor(manifest, [validQuestion()])),
      {
        name: "ContentLoadError",
        message: /certification manifest does not match the expected schema/,
      },
    );
  });
}

test("loadCertManifest accepts a manifest carrying every optional field", async () => {
  const manifest = {
    ...validManifest(),
    examQuestionCount: 50,
    examDurationMinutes: 90,
  };
  assert.equal(manifestSchema.safeParse(manifest).success, true);

  const loaded = await loadCertManifest(
    "test-cert",
    fetcherFor(manifest, [validQuestion()]),
  );
  assert.equal(loaded.examQuestionCount, 50);
  assert.equal(loaded.examDurationMinutes, 90);
});

test("loadCertManifest rejects a manifest with an invalid optional field type", async () => {
  const badCountManifest = {
    ...validManifest(),
    examQuestionCount: "50",
  };
  await assert.rejects(
    loadCertManifest(
      "test-cert",
      fetcherFor(badCountManifest, [validQuestion()]),
    ),
    {
      name: "ContentLoadError",
      message: /certification manifest does not match the expected schema/,
    },
  );

  const badDurationManifest = {
    ...validManifest(),
    examDurationMinutes: "90",
  };
  await assert.rejects(
    loadCertManifest(
      "test-cert",
      fetcherFor(badDurationManifest, [validQuestion()]),
    ),
    {
      name: "ContentLoadError",
      message: /certification manifest does not match the expected schema/,
    },
  );
});

test("manifestSchema rejects a manifest with an unrecognized extra field", () => {
  const manifest = { ...validManifest(), unexpectedField: "surprise" };
  const result = manifestSchema.safeParse(manifest);
  assert.equal(result.success, false);
});

test("the runtime guard tolerates an unrecognized extra manifest field the schema rejects", async () => {
  const manifest = { ...validManifest(), unexpectedField: "surprise" };
  const loaded = await loadCertManifest(
    "test-cert",
    fetcherFor(manifest, [validQuestion()]),
  );
  assert.equal(loaded.cert, "test-cert");
});
