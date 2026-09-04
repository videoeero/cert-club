import assert from "node:assert/strict";
import test from "node:test";

import {
  answerCountLabel,
  calculateQuizResults,
  filterReviewQuestions,
  QuizSelectionError,
  scoreAnswer,
  selectQuestions,
  simulateQuizAnswers,
} from "../src/lib/quiz.ts";

function question(id, domain, type = "single", correct = ["a"]) {
  return {
    id,
    cert: "test-cert",
    schemaVersion: 1,
    type,
    domain,
    difficulty: "medium",
    status: "reviewed",
    stem: `Question ${id}`,
    options: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
      { id: "c", text: "Option C" },
      { id: "d", text: "Option D" },
    ],
    correct,
    explanation: "Explanation",
    sourceUrl: "https://example.com/source",
    sourceNote: "Source section",
    sourceCheckedAt: "2026-09-03",
  };
}

const domains = [
  { slug: "alpha", name: "Alpha", weight: 80 },
  { slug: "beta", name: "Beta", weight: 20 },
];

test("scores single- and multi-response answers exactly", () => {
  const single = question("single", "alpha", "single", ["b"]);
  const multi = question("multi", "alpha", "multi", ["a", "c"]);

  assert.equal(scoreAnswer(single, ["b"]), true);
  assert.equal(scoreAnswer(single, ["a"]), false);
  assert.equal(scoreAnswer(multi, ["c", "a"]), true);
  assert.equal(scoreAnswer(multi, ["a"]), false);
  assert.equal(scoreAnswer(multi, ["a", "b", "c"]), false);
  assert.equal(scoreAnswer(multi, ["a", "a", "c"]), false);
});

test("calculates overall and per-domain results", () => {
  const questions = [
    question("alpha-1", "alpha", "single", ["a"]),
    question("alpha-2", "alpha", "multi", ["b", "c"]),
    question("beta-1", "beta", "single", ["d"]),
  ];

  const results = calculateQuizResults(
    questions,
    {
      "alpha-1": ["a"],
      "alpha-2": ["b"],
      "beta-1": [],
    },
    domains,
  );

  assert.equal(results.totalQuestions, 3);
  assert.equal(results.answeredQuestions, 2);
  assert.equal(results.correctAnswers, 1);
  assert.equal(results.scorePercentage, 33);
  assert.deepEqual(results.domainBreakdown, [
    {
      slug: "alpha",
      name: "Alpha",
      totalQuestions: 2,
      answeredQuestions: 2,
      correctAnswers: 1,
      scorePercentage: 50,
    },
    {
      slug: "beta",
      name: "Beta",
      totalQuestions: 1,
      answeredQuestions: 0,
      correctAnswers: 0,
      scorePercentage: 0,
    },
  ]);
});

test("selects all, domain-filtered, and random question sets", () => {
  const questions = [
    question("alpha-1", "alpha"),
    question("alpha-2", "alpha"),
    question("beta-1", "beta"),
    question("beta-2", "beta"),
  ];

  assert.deepEqual(
    selectQuestions(questions, domains, { mode: "all" }).map(
      (selected) => selected.id,
    ),
    ["alpha-1", "alpha-2", "beta-1", "beta-2"],
  );
  assert.equal(
    selectQuestions(questions, domains, {
      mode: "domain",
      domain: "beta",
    }).length,
    2,
  );
  assert.equal(
    selectQuestions(questions, domains, {
      mode: "random",
      count: 20,
    }).length,
    4,
  );
  assert.equal(
    new Set(
      selectQuestions(
        questions,
        domains,
        { mode: "random", count: 3 },
        () => 0,
      ).map((selected) => selected.id),
    ).size,
    3,
  );
});

test("filters review questions by missed, bookmarked, and domain scope", () => {
  const questions = [
    question("alpha-missed", "alpha"),
    question("alpha-bookmarked", "alpha"),
    question("beta-both", "beta"),
    question("beta-other", "beta"),
  ];

  assert.deepEqual(
    filterReviewQuestions(
      questions,
      ["alpha-missed", "beta-both"],
      ["alpha-bookmarked", "beta-both"],
      "missed",
    ).map((item) => item.id),
    ["alpha-missed", "beta-both"],
  );
  assert.deepEqual(
    filterReviewQuestions(
      questions,
      ["alpha-missed", "beta-both"],
      ["alpha-bookmarked", "beta-both"],
      "bookmarked",
      "beta",
    ).map((item) => item.id),
    ["beta-both"],
  );
  assert.deepEqual(
    filterReviewQuestions(
      questions,
      ["alpha-missed", "beta-both"],
      ["alpha-bookmarked", "beta-both"],
      "missed-or-bookmarked",
    ).map((item) => item.id),
    ["alpha-missed", "alpha-bookmarked", "beta-both"],
  );
  assert.deepEqual(
    filterReviewQuestions(
      questions,
      ["not-in-bank"],
      ["also-not-in-bank"],
      "missed-or-bookmarked",
    ),
    [],
  );
});

test("samples a prefiltered review set without replacement", () => {
  const questions = [
    question("alpha-1", "alpha"),
    question("alpha-2", "alpha"),
    question("beta-1", "beta"),
  ];

  const selected = selectQuestions(
    questions,
    domains,
    { mode: "review", count: 2, reviewScope: "missed-or-bookmarked" },
    () => 0,
  );

  assert.equal(selected.length, 2);
  assert.equal(new Set(selected.map((item) => item.id)).size, 2);
});

test("samples domains according to blueprint weights without replacement", () => {
  const questions = [
    question("alpha-1", "alpha"),
    question("alpha-2", "alpha"),
    question("beta-1", "beta"),
  ];
  const values = [0, 0, 0.95, 0];
  let index = 0;

  const selected = selectQuestions(
    questions,
    domains,
    { mode: "weighted", count: 2 },
    () => values[index++] ?? 0,
  );

  assert.deepEqual(
    selected.map((item) => item.id),
    ["alpha-1", "beta-1"],
  );
  assert.equal(new Set(selected.map((item) => item.id)).size, 2);
});

test("formats answer counts as words with a numeric fallback", () => {
  assert.equal(answerCountLabel(0), "ZERO");
  assert.equal(answerCountLabel(1), "ONE");
  assert.equal(answerCountLabel(5), "FIVE");
  assert.equal(answerCountLabel(6), "6");
});

test("rejects invalid question selection configurations", () => {
  const questions = [question("alpha-1", "alpha"), question("beta-1", "beta")];

  assert.throws(
    () => selectQuestions([], domains, { mode: "all" }),
    QuizSelectionError,
  );
  assert.throws(
    () => selectQuestions(questions, domains, { mode: "domain" }),
    QuizSelectionError,
  );
  assert.throws(
    () =>
      selectQuestions(questions, domains, {
        mode: "domain",
        domain: "gamma",
      }),
    QuizSelectionError,
  );
  assert.throws(
    () => selectQuestions(questions, domains, { mode: "random", count: 0 }),
    QuizSelectionError,
  );
  assert.throws(
    () => selectQuestions(questions, domains, { mode: "random", count: 1.5 }),
    QuizSelectionError,
  );
  assert.throws(
    () => selectQuestions(questions, domains, { mode: "random", count: -1 }),
    QuizSelectionError,
  );
});

test("simulates quiz answers according to presets", () => {
  const questions = [
    question("q1", "alpha", "single", ["a"]),
    question("q2", "alpha", "single", ["b"]),
    question("q3", "alpha", "multi", ["a", "c"]),
    question("q4", "beta", "single", ["c"]),
    question("q5", "beta", "multi", ["b", "d"]),
  ];

  // Use a deterministic random (always returns 0.5) so Fisher-Yates produces a
  // stable shuffle and test results don't depend on Math.random internals.
  const seededRandom = () => 0.5;

  // perfect-pass: all correct
  const perfectAnswers = simulateQuizAnswers(
    questions,
    "perfect-pass",
    seededRandom,
  );
  const perfectResults = calculateQuizResults(
    questions,
    perfectAnswers,
    domains,
  );
  assert.equal(perfectResults.scorePercentage, 100);
  assert.equal(perfectResults.correctAnswers, 5);

  // complete-fail: all wrong; each answer must have the required option count
  const failAnswers = simulateQuizAnswers(
    questions,
    "complete-fail",
    seededRandom,
  );
  const failResults = calculateQuizResults(questions, failAnswers, domains);
  assert.equal(failResults.scorePercentage, 0);
  assert.equal(failResults.correctAnswers, 0);
  for (const q of questions) {
    assert.equal(scoreAnswer(q, failAnswers[q.id]), false);
  }

  // realistic-pass: targets ~80% but capped at questions.length - 1 (≤ 4/5)
  const passAnswers = simulateQuizAnswers(
    questions,
    "realistic-pass",
    seededRandom,
  );
  const passResults = calculateQuizResults(questions, passAnswers, domains);
  assert.ok(
    passResults.correctAnswers >= 1,
    "realistic-pass should have ≥ 1 correct",
  );
  assert.ok(
    passResults.correctAnswers <= questions.length - 1,
    "realistic-pass should not be perfect",
  );

  // borderline-fail: targets ~60% but capped at questions.length - 1
  const borderlineAnswers = simulateQuizAnswers(
    questions,
    "borderline-fail",
    seededRandom,
  );
  const borderlineResults = calculateQuizResults(
    questions,
    borderlineAnswers,
    domains,
  );
  assert.ok(
    borderlineResults.correctAnswers < questions.length,
    "borderline-fail should not be perfect",
  );
});

test("simulateQuizAnswers returns empty map for empty questions", () => {
  assert.deepEqual(simulateQuizAnswers([], "perfect-pass"), {});
  assert.deepEqual(simulateQuizAnswers([], "complete-fail"), {});
});

test("simulateQuizAnswers throws for unsupported preset", () => {
  const q = [question("q1", "alpha")];
  assert.throws(
    // @ts-expect-error intentionally invalid preset
    () => simulateQuizAnswers(q, "unknown-preset"),
    QuizSelectionError,
  );
});

test("simulateQuizAnswers: degenerate question with no distractors", () => {
  // A question where all 4 options are "correct" — no distractors available.
  const degenerateQ = {
    id: "q-degen",
    cert: "test-cert",
    schemaVersion: 1,
    type: "multi",
    domain: "alpha",
    difficulty: "medium",
    status: "reviewed",
    stem: "Degenerate question",
    options: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
    ],
    correct: ["a", "b"],
    sourceUrl: "https://example.com",
  };
  const answers = simulateQuizAnswers([degenerateQ], "complete-fail");
  // With 0 distractors the fallback returns an empty array; scoreAnswer must
  // return false (empty != ["a","b"]).
  assert.equal(scoreAnswer(degenerateQ, answers[degenerateQ.id]), false);
});
