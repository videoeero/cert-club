import assert from "node:assert/strict";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { buildBankMetrics, parseCliArgs } from "../scripts/bank-metrics.mjs";
import {
  LENGTH_BIAS_MAX_LONGEST_SHARE,
  LENGTH_BIAS_MIN_SAMPLE,
  questionBankSchema,
} from "../schemas/question-bank.mjs";

function manifest(domains) {
  return {
    schemaVersion: 1,
    cert: "test-cert",
    name: "Test Cert",
    status: "draft",
    examUrl: "https://example.com/exam",
    contentLicense: "CC-BY-SA-4.0",
    domains,
  };
}

function question(overrides = {}) {
  return {
    id: overrides.id ?? "test-cert-domain-one-001",
    cert: "test-cert",
    schemaVersion: 1,
    type: "single",
    domain: "domain-one",
    difficulty: "medium",
    status: "reviewed",
    stem: "Which option is correct?",
    options: [
      { id: "a", text: "Correct option" },
      { id: "b", text: "A distractor" },
      { id: "c", text: "Another distractor" },
      { id: "d", text: "Yet another distractor" },
    ],
    correct: ["a"],
    explanation: "Because it is correct.",
    sourceUrl: "https://example.com/source",
    sourceNote: "Section 1",
    sourceCheckedAt: "2026-09-03",
    ...overrides,
  };
}

// Rotates the key through every position so a single template can produce a
// bank with a known, controllable position/length profile.
function bankOfSize(count, buildOne) {
  return Array.from({ length: count }, (_, index) => buildOne(index));
}

const singleDomainManifest = manifest([
  { slug: "domain-one", name: "Domain One", weight: 100 },
]);

test("buildBankMetrics handles an empty bank without dividing by zero", () => {
  const metrics = buildBankMetrics(singleDomainManifest, [], {
    today: new Date("2026-09-09T00:00:00.000Z"),
  });

  assert.equal(metrics.questionCount, 0);
  assert.equal(metrics.domains[0].actual, 0);
  assert.equal(metrics.domains[0].actualShare, 0);
  assert.equal(metrics.formatMix.single.count, 0);
  assert.equal(metrics.distinctSourcePages, 0);
  assert.equal(metrics.positionDistribution.total, 0);
  assert.equal(metrics.positionDistribution.maxShare, 0);
  assert.equal(metrics.lengthBias.meanDelta, null);
  assert.equal(metrics.lengthBias.medianDelta, null);
  assert.equal(metrics.longestOptionIsKey.sampleSize, 0);
  assert.equal(metrics.longestOptionIsKey.share, 0);
  assert.equal(metrics.distractorNotesCoverage.optionShare, 0);
  assert.equal(metrics.distractorNotesCoverage.questionShare, 0);
  assert.equal(metrics.baselines.alwaysLongestOption.expectedScore, null);
  assert.equal(
    metrics.baselines.eliminateAbsoluteQualifiers.expectedScore,
    null,
  );
  for (const guard of Object.values(metrics.guards)) {
    assert.equal(guard.status, "advisory (below sample minimum)");
  }
});

test("buildBankMetrics handles a single-question bank", () => {
  const metrics = buildBankMetrics(singleDomainManifest, [question()], {
    today: new Date("2026-09-09T00:00:00.000Z"),
  });

  assert.equal(metrics.questionCount, 1);
  assert.equal(metrics.domains[0].actual, 1);
  assert.equal(metrics.domains[0].actualShare, 1);
  assert.equal(metrics.positionDistribution.total, 1);
  assert.equal(metrics.positionDistribution.entries[0].position, 0);
  assert.equal(metrics.longestOptionIsKey.sampleSize, 1);
});

test("domain and skill breakdown report actual share against blueprint weight", () => {
  const withSkills = manifest([
    {
      slug: "domain-one",
      name: "Domain One",
      weight: 100,
      skills: [
        { slug: "skill-a", name: "Skill A", weight: 60 },
        { slug: "skill-b", name: "Skill B", weight: 40 },
      ],
    },
  ]);

  const questions = [
    question({ id: "q1", subdomain: "skill-a" }),
    question({ id: "q2", subdomain: "skill-a" }),
    question({ id: "q3", subdomain: "skill-b" }),
  ];

  const metrics = buildBankMetrics(withSkills, questions);

  assert.equal(metrics.domains[0].actual, 3);
  assert.equal(metrics.domains[0].actualShare, 1);

  const skillA = metrics.skills.find((s) => s.slug === "skill-a");
  const skillB = metrics.skills.find((s) => s.slug === "skill-b");
  assert.equal(skillA.actual, 2);
  assert.equal(skillA.actualShare, 2 / 3);
  assert.equal(skillB.actual, 1);
  assert.equal(skillB.actualShare, 1 / 3);
});

test("format mix reports single vs multi and multi's answer-count breakdown", () => {
  const questions = [
    question({ id: "q1", type: "single", correct: ["a"] }),
    question({ id: "q2", type: "single", correct: ["a"] }),
    question({
      id: "q3",
      type: "multi",
      correct: ["a", "b"],
    }),
    question({
      id: "q4",
      type: "multi",
      correct: ["a", "b", "c"],
    }),
    question({
      id: "q5",
      type: "multi",
      correct: ["a", "c"],
      options: [
        { id: "a", text: "One" },
        { id: "b", text: "Two" },
        { id: "c", text: "Three" },
      ],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.formatMix.single.count, 2);
  assert.equal(metrics.formatMix.multi.count, 3);
  assert.deepEqual(metrics.formatMix.multi.byAnswerCount, [
    { answerCount: 2, count: 2 },
    { answerCount: 3, count: 1 },
  ]);
});

test("difficulty x format matrix counts every combination", () => {
  const questions = [
    question({ id: "q1", difficulty: "easy", type: "single" }),
    question({ id: "q2", difficulty: "easy", type: "single" }),
    question({
      id: "q3",
      difficulty: "hard",
      type: "multi",
      correct: ["a", "b"],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.difficultyFormatMatrix.easy.single, 2);
  assert.equal(metrics.difficultyFormatMatrix.easy.multi, 0);
  assert.equal(metrics.difficultyFormatMatrix.hard.multi, 1);
  assert.equal(metrics.difficultyFormatMatrix.medium.single, 0);
});

test("distinct source pages dedupes by URL, ignoring the fragment", () => {
  const questions = [
    question({ id: "q1", sourceUrl: "https://example.com/doc#section-1" }),
    question({ id: "q2", sourceUrl: "https://example.com/doc#section-2" }),
    question({ id: "q3", sourceUrl: "https://example.com/other-doc" }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.distinctSourcePages, 2);
});

test("single-select position distribution counts where the key falls", () => {
  const questions = [
    question({ id: "q1", correct: ["a"] }),
    question({ id: "q2", correct: ["a"] }),
    question({ id: "q3", correct: ["b"] }),
    // A multi-select must not be counted in the single-select distribution.
    question({ id: "q4", type: "multi", correct: ["a", "b"] }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.positionDistribution.total, 3);
  // Positions no key lands on are reported as zero rather than omitted: "the
  // answer is never in slot C or D" is a tell, and a short list hides it.
  assert.deepEqual(
    metrics.positionDistribution.entries.map((e) => [e.position, e.count]),
    [
      [0, 2],
      [1, 1],
      [2, 0],
      [3, 0],
    ],
  );
  assert.equal(metrics.positionDistribution.maxCount, 2);
  assert.equal(metrics.positionDistribution.maxShare, 2 / 3);
});

test("mean and median option length delta over key-minus-distractor length", () => {
  const questions = [
    question({
      id: "q1",
      correct: ["a"],
      options: [
        { id: "a", text: "A".repeat(10) },
        { id: "b", text: "B".repeat(4) },
      ],
    }),
    question({
      id: "q2",
      correct: ["a"],
      options: [
        { id: "a", text: "A".repeat(6) },
        { id: "b", text: "B".repeat(4) },
      ],
    }),
    question({
      id: "q3",
      correct: ["a"],
      options: [
        { id: "a", text: "A".repeat(20) },
        { id: "b", text: "B".repeat(4) },
      ],
    }),
  ];
  // deltas: 6, 2, 16 -> mean 8, median 6

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.lengthBias.meanDelta, 8);
  assert.equal(metrics.lengthBias.medianDelta, 6);
  assert.equal(metrics.lengthBias.sampleSize, 3);
});

test("longest-option-is-key share matches questionBankSchema's own guard", () => {
  // 24 questions, 20 of which have the key as the strict longest option:
  // 20/24 = 83.3%, well above LENGTH_BIAS_MAX_LONGEST_SHARE (45%), so the
  // guard must reject it and our number must agree with the guard's own count.
  const questions = bankOfSize(24, (index) => {
    const keyIsLongest = index < 20;
    return question({
      id: `test-cert-domain-one-${String(index).padStart(3, "0")}`,
      correct: ["a"],
      options: [
        { id: "a", text: keyIsLongest ? "A".repeat(50) : "Short" },
        { id: "b", text: "A distractor of modest length" },
        { id: "c", text: "Another modest distractor" },
      ],
    });
  });

  const rejection = questionBankSchema.safeParse(questions);
  assert.equal(rejection.success, false);
  const message = rejection.error.issues
    .map((issue) => issue.message)
    .join("\n");
  assert.match(
    message,
    /biased toward the longest option: the key is the longest option in 20 of 24/,
  );

  const metrics = buildBankMetrics(singleDomainManifest, questions);
  assert.equal(metrics.longestOptionIsKey.count, 20);
  assert.equal(metrics.longestOptionIsKey.sampleSize, 24);
  assert.equal(metrics.longestOptionIsKey.share, 20 / 24);
  assert.ok(metrics.longestOptionIsKey.share > LENGTH_BIAS_MAX_LONGEST_SHARE);
  assert.equal(metrics.guards.longestOptionIsKey.status, "FAIL");
  assert.equal(metrics.guards.longestOptionIsKey.sampleSize, 24);
  assert.equal(
    metrics.guards.longestOptionIsKey.minSample,
    LENGTH_BIAS_MIN_SAMPLE,
  );
});

test("longest-option-is-key share stays advisory below the guard's sample minimum", () => {
  const questions = bankOfSize(10, (index) =>
    question({
      id: `test-cert-domain-one-${String(index).padStart(3, "0")}`,
      correct: ["a"],
      options: [
        { id: "a", text: "A".repeat(50) },
        { id: "b", text: "Short" },
      ],
    }),
  );

  assert.doesNotThrow(() => questionBankSchema.parse(questions));

  const metrics = buildBankMetrics(singleDomainManifest, questions);
  assert.equal(metrics.longestOptionIsKey.count, 10);
  assert.equal(
    metrics.guards.longestOptionIsKey.status,
    "advisory (below sample minimum)",
  );
});

test("distractorNotes coverage counts noted distractors and fully-noted questions", () => {
  const questions = [
    question({
      id: "q1",
      correct: ["a"],
      distractorNotes: { b: "wrong because...", c: "wrong because..." },
      options: [
        { id: "a", text: "Correct" },
        { id: "b", text: "Wrong one" },
        { id: "c", text: "Wrong two" },
      ],
    }),
    question({
      id: "q2",
      correct: ["a"],
      distractorNotes: { b: "wrong because..." },
      options: [
        { id: "a", text: "Correct" },
        { id: "b", text: "Wrong one" },
        { id: "c", text: "Wrong two" },
      ],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.distractorNotesCoverage.questionsWithDistractors, 2);
  assert.equal(metrics.distractorNotesCoverage.fullyCoveredQuestions, 1);
  assert.equal(metrics.distractorNotesCoverage.questionShare, 0.5);
  // 3 of 4 total distractor options across both questions carry a note.
  assert.equal(metrics.distractorNotesCoverage.optionShare, 3 / 4);
});

test("sourceCheckedAt age distribution buckets by days before a frozen today, boundaries inclusive", () => {
  const today = new Date("2026-09-09T00:00:00.000Z");
  const questions = [
    question({ id: "q1", sourceCheckedAt: "2026-09-09" }), // 0 days
    question({ id: "q2", sourceCheckedAt: "2026-08-10" }), // 30 days: edge of bucket 1
    question({ id: "q3", sourceCheckedAt: "2026-08-09" }), // 31 days: edge of bucket 2
    question({ id: "q4", sourceCheckedAt: "2025-09-09" }), // 365 days: edge of bucket 4
    question({ id: "q5", sourceCheckedAt: "2025-09-08" }), // 366 days: over the edge
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions, { today });

  const byLabel = Object.fromEntries(
    metrics.sourceAge.buckets.map((b) => [b.label, b.count]),
  );
  assert.equal(byLabel["0-30d"], 2);
  assert.equal(byLabel["31-90d"], 1);
  assert.equal(byLabel["181-365d"], 1);
  assert.equal(byLabel[">365d"], 1);
  assert.equal(metrics.sourceAge.oldestDays, 366);
  assert.equal(metrics.sourceAge.newestDays, 0);
});

test("sourceCheckedAt age distribution clamps future dates to 0 days instead of dropping them", () => {
  const today = new Date("2026-09-01T00:00:00.000Z");
  const questions = [
    question({ id: "q1", sourceCheckedAt: "2026-09-05" }), // in the future relative to frozen today
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions, { today });

  const byLabel = Object.fromEntries(
    metrics.sourceAge.buckets.map((b) => [b.label, b.count]),
  );
  assert.equal(byLabel["0-30d"], 1);
  assert.equal(metrics.sourceAge.sampleSize, 1);
  assert.equal(metrics.sourceAge.newestDays, 0);
});

test('"always pick the longest option" baseline scores the share of singles where the longest option is the key', () => {
  const questions = [
    question({
      id: "q1",
      correct: ["a"],
      options: [
        { id: "a", text: "Long correct option" },
        { id: "b", text: "Short" },
      ],
    }),
    question({
      id: "q2",
      correct: ["b"],
      options: [
        { id: "a", text: "Long wrong option here" },
        { id: "b", text: "Short" },
      ],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.baselines.alwaysLongestOption.expectedScore, 0.5);
  assert.equal(metrics.baselines.alwaysLongestOption.sampleSize, 2);
});

test('"always pick the longest option" baseline splits credit across ties', () => {
  const questions = [
    question({
      id: "q1",
      correct: ["a"],
      options: [
        { id: "a", text: "Tied" },
        { id: "b", text: "Tied" },
      ],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.baselines.alwaysLongestOption.expectedScore, 0.5);
});

test('"eliminate absolute qualifiers, then guess" baseline scores by remaining pool size', () => {
  const questions = [
    // Two absolutes eliminated, key is the lone survivor: score 1.
    question({
      id: "q1",
      correct: ["c"],
      options: [
        { id: "a", text: "This is always true" },
        { id: "b", text: "This is never true" },
        { id: "c", text: "This depends on configuration" },
      ],
    }),
    // Key itself carries an absolute and is eliminated: score 0.
    question({
      id: "q2",
      correct: ["a"],
      options: [
        { id: "a", text: "This must always happen" },
        { id: "b", text: "This might happen" },
      ],
    }),
    // No absolutes anywhere: guess among all 2 options, key present: score 0.5.
    question({
      id: "q3",
      correct: ["a"],
      options: [
        { id: "a", text: "One plausible reading" },
        { id: "b", text: "Another plausible reading" },
      ],
    }),
  ];

  const metrics = buildBankMetrics(singleDomainManifest, questions);
  const baseline = metrics.baselines.eliminateAbsoluteQualifiers;

  assert.equal(baseline.sampleSize, 3);
  assert.equal(baseline.uniqueIdentifyCount, 1);
  assert.equal(baseline.expectedScore, (1 + 0 + 0.5) / 3);
});

test("position-bias guard fails above the sample minimum when one position dominates", () => {
  // 20 of 24 answer in position 0, above the 50% ceiling.
  const questions = bankOfSize(24, (index) =>
    question({
      id: `test-cert-domain-one-${String(index).padStart(3, "0")}`,
      correct: [index < 20 ? "a" : "b"],
    }),
  );

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.guards.positionBias.status, "FAIL");
  assert.equal(metrics.guards.positionBias.sampleSize, 24);
});

test("length-bias-mean-delta guard fails above the sample minimum when keys run systematically longer", () => {
  const questions = bankOfSize(24, (index) =>
    question({
      id: `test-cert-domain-one-${String(index).padStart(3, "0")}`,
      correct: ["a"],
      options: [
        { id: "a", text: "A".repeat(80) },
        { id: "b", text: "Short" },
      ],
    }),
  );

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.guards.lengthBiasMeanDelta.status, "FAIL");
});

test("guards report PASS above the sample minimum when the bank is clean", () => {
  const questions = bankOfSize(24, (index) => {
    const positions = ["a", "b", "c", "d"];
    const key = positions[index % positions.length];
    return question({
      id: `test-cert-domain-one-${String(index).padStart(3, "0")}`,
      correct: [key],
      // Every option is exactly the same length regardless of correctness,
      // so neither the mean-delta nor the longest-option-is-key guard has
      // anything to catch.
      options: positions.map((id) => ({
        id,
        text: `Option ${id.repeat(5)}`,
      })),
    });
  });

  assert.doesNotThrow(() => questionBankSchema.parse(questions));

  const metrics = buildBankMetrics(singleDomainManifest, questions);

  assert.equal(metrics.guards.positionBias.status, "PASS");
  assert.equal(metrics.guards.lengthBiasMeanDelta.status, "PASS");
  assert.equal(metrics.guards.longestOptionIsKey.status, "PASS");
});

test("reproduces az-900's hand-computed review numbers against the real bank", async () => {
  const { readCertQuestions, readJson } =
    await import("../scripts/lib/read-certs.mjs");
  const certUrl = new URL("../certs/az-900/", import.meta.url);
  const certPath = fileURLToPath(certUrl);

  const [manifestData, questions] = await Promise.all([
    readJson(join(certPath, "manifest.json")),
    readCertQuestions(certPath),
  ]);

  const metrics = buildBankMetrics(manifestData, questions);

  assert.equal(metrics.questionCount, 18);
  assert.ok(Math.abs(metrics.lengthBias.meanDelta - 4.3) < 0.05);
  assert.equal(metrics.longestOptionIsKey.count, 4);
  assert.equal(metrics.longestOptionIsKey.sampleSize, 12);
  assert.equal(metrics.positionDistribution.maxCount, 4);
  assert.equal(metrics.positionDistribution.total, 12);
});

test("reproduces aws-clf-c02's review numbers against the real bank", async () => {
  const { readCertQuestions, readJson } =
    await import("../scripts/lib/read-certs.mjs");
  const certUrl = new URL("../certs/aws-clf-c02/", import.meta.url);
  const certPath = fileURLToPath(certUrl);

  const [manifestData, questions] = await Promise.all([
    readJson(join(certPath, "manifest.json")),
    readCertQuestions(certPath),
  ]);

  const metrics = buildBankMetrics(manifestData, questions);

  assert.equal(metrics.questionCount, 130);
  assert.ok(Math.abs(metrics.lengthBias.meanDelta - -1.02) < 0.01);
  assert.equal(metrics.longestOptionIsKey.count, 20);
  assert.equal(metrics.longestOptionIsKey.sampleSize, 107);
  assert.deepEqual(
    metrics.positionDistribution.entries.map((e) => e.count),
    [28, 27, 26, 26],
  );
});

test("scores eliminate-absolutes at nothing when nothing can be eliminated", () => {
  // Every option carries an absolute, so no pool survives to guess from.
  // Reproducing ccdv-f's published 30% depends on this case scoring zero
  // rather than degrading to a guess among the original options.
  const manifest = {
    cert: "demo",
    domains: [{ slug: "d", name: "D", weight: 100 }],
  };
  const questions = [
    {
      id: "demo-d-001",
      cert: "demo",
      type: "single",
      domain: "d",
      difficulty: "medium",
      status: "draft",
      stem: "S",
      options: [
        { id: "a", text: "This always holds" },
        { id: "b", text: "This never holds" },
        { id: "c", text: "Only this holds" },
        { id: "d", text: "Every case holds" },
      ],
      correct: ["c"],
      explanation: "E",
      sourceUrl: "https://example.com/p",
      sourceNote: "N",
      sourceCheckedAt: "2026-01-01",
    },
  ];

  const metrics = buildBankMetrics(manifest, questions);

  assert.equal(metrics.baselines.eliminateAbsoluteQualifiers.expectedScore, 0);
  assert.equal(
    metrics.baselines.eliminateAbsoluteQualifiers.uniqueIdentifyCount,
    0,
  );
});

test("reproduces ccdv-f's hand-computed adversarial baselines", async () => {
  const { readCertQuestions, readJson } =
    await import("../scripts/lib/read-certs.mjs");
  const certUrl = new URL("../certs/ccdv-f/", import.meta.url);
  const certPath = fileURLToPath(certUrl);

  const [manifestData, questions] = await Promise.all([
    readJson(join(certPath, "manifest.json")),
    readCertQuestions(certPath),
  ]);

  const metrics = buildBankMetrics(manifestData, questions);

  // review-progress.md § "Other pattern tells": the absolutes strategy "scores
  // an expected 25% against a 25% baseline, and uniquely identifies the key in
  // 0 of 67 single-select items".
  //
  // The numbers moved when the seven decisive items were rewritten (30% and
  // 7 before), and again when the 149→106 pruning pass shrank the single-select
  // pool from 97 to 67 (shifting absolutes from 26% to ~25% and the longest-option
  // tell from 19% to ~22%). They are pinned here so the pair cannot drift apart
  // silently: the review file is a hand-written record, and a figure nothing
  // re-derives is a figure that quietly stops being true. Editing one without
  // the other is what this assertion exists to catch — so if it fails, check
  // which of the two is actually wrong before touching either.
  const absolutes = metrics.baselines.eliminateAbsoluteQualifiers;
  assert.equal(absolutes.sampleSize, 67);
  assert.ok(Math.abs(absolutes.expectedScore - 0.25) < 0.005);
  assert.equal(absolutes.uniqueIdentifyCount, 0);

  // Same file records the longest-option tell at 22% post-pruning (19% after
  // the rewrite pass).
  assert.equal(metrics.longestOptionIsKey.sampleSize, 67);
  assert.ok(Math.abs(metrics.longestOptionIsKey.share - 0.22) < 0.005);
});

test("buildRepositoryMetrics reports every bank when no slug is given", async () => {
  const { buildRepositoryMetrics } =
    await import("../scripts/bank-metrics.mjs");
  const root = fileURLToPath(new URL("../", import.meta.url));

  const reports = await buildRepositoryMetrics(root);

  assert.deepEqual(reports.map((report) => report.cert).sort(), [
    "aws-clf-c02",
    "az-900",
    "ccar-f",
    "ccar-p",
    "ccdv-f",
  ]);
});

test("buildRepositoryMetrics reports only the requested banks, in order", async () => {
  const { buildRepositoryMetrics } =
    await import("../scripts/bank-metrics.mjs");
  const root = fileURLToPath(new URL("../", import.meta.url));

  const reports = await buildRepositoryMetrics(root, {
    slugs: ["ccdv-f", "az-900"],
  });

  assert.deepEqual(
    reports.map((report) => report.cert),
    ["ccdv-f", "az-900"],
  );
});

test("buildRepositoryMetrics names every unknown slug in one error", async () => {
  const { buildRepositoryMetrics, BankMetricsError } =
    await import("../scripts/bank-metrics.mjs");
  const root = fileURLToPath(new URL("../", import.meta.url));

  await assert.rejects(
    buildRepositoryMetrics(root, { slugs: ["nope-900", "az-900", "also-bad"] }),
    (error) => {
      assert.ok(error instanceof BankMetricsError);
      assert.equal(error.messages.length, 2);
      assert.match(error.message, /"nope-900" has no matching/);
      assert.match(error.message, /"also-bad" has no matching/);
      return true;
    },
  );
});

test("counts questions per skill within their own domain", () => {
  // Two domains legitimately declaring the same skill slug: domainSchema only
  // enforces uniqueness within a domain, so these must not be pooled.
  const manifest = {
    cert: "demo",
    domains: [
      {
        slug: "first",
        name: "First",
        weight: 50,
        skills: [{ slug: "overview", name: "Overview", weight: 50 }],
      },
      {
        slug: "second",
        name: "Second",
        weight: 50,
        skills: [{ slug: "overview", name: "Overview", weight: 50 }],
      },
    ],
  };
  const base = {
    cert: "demo",
    type: "single",
    difficulty: "medium",
    status: "draft",
    stem: "S",
    options: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
    ],
    correct: ["a"],
    explanation: "E",
    sourceUrl: "https://example.com/p",
    sourceNote: "N",
    sourceCheckedAt: "2026-01-01",
  };
  const questions = [
    { ...base, id: "demo-1", domain: "first", subdomain: "overview" },
    { ...base, id: "demo-2", domain: "first", subdomain: "overview" },
    { ...base, id: "demo-3", domain: "second", subdomain: "overview" },
  ];

  const metrics = buildBankMetrics(manifest, questions);

  assert.deepEqual(
    metrics.skills.map((skill) => [skill.domain, skill.actual]),
    [
      ["first", 2],
      ["second", 1],
    ],
  );
});

test("parseCliArgs rejects conflicting --json and --markdown flags", () => {
  assert.throws(
    () => parseCliArgs(["--json", "--markdown"]),
    /--json and --markdown cannot be used together/,
  );
});

test("parseCliArgs rejects unknown flags", () => {
  assert.throws(
    () => parseCliArgs(["--unknown-flag"]),
    /Unknown flag\(s\): --unknown-flag/,
  );
});

test("parseCliArgs parses valid flags and slugs", () => {
  assert.deepEqual(parseCliArgs(["--json", "cert-1", "cert-2"]), {
    json: true,
    markdown: false,
    slugs: ["cert-1", "cert-2"],
  });
  assert.deepEqual(parseCliArgs(["--markdown"]), {
    json: false,
    markdown: true,
    slugs: [],
  });
});

test("buildBankMetrics computes 2x target and domain deltas when examQuestionCount is present", () => {
  const manifestWithExam = {
    ...singleDomainManifest,
    examQuestionCount: 50,
  };
  const metrics = buildBankMetrics(manifestWithExam, [question()], {
    today: new Date("2026-09-09T00:00:00.000Z"),
  });
  assert.equal(metrics.examQuestionCount, 50);
  assert.equal(metrics.targetQuestionCount, 100);
  assert.equal(metrics.questionCountDelta, -99);
  assert.equal(metrics.domains[0].target, 100);
  assert.equal(metrics.domains[0].delta, -99);
});
