import assert from "node:assert/strict";
import test from "node:test";

import {
  answerCountLabel,
  calculateQuizResults,
  filterReviewQuestions,
  QuizSelectionError,
  scoreAnswer,
  selectQuestions,
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
