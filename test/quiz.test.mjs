import assert from "node:assert/strict";
import test from "node:test";

import {
  answerCountLabel,
  calculateQuizResults,
  filterQuestionsByScope,
  filterReviewQuestions,
  getUnusedQuizQuestions,
  prepareRetakeSession,
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
    scope: "core",
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

  const selected = selectQuestions(questions, domains, {
    mode: "weighted",
    count: 2,
  });

  assert.equal(selected.length, 2);
  assert.equal(new Set(selected.map((item) => item.id)).size, 2);
  for (const item of selected) {
    assert.ok(
      ["alpha-1", "alpha-2", "beta-1"].includes(item.id),
      `unexpected question ${item.id} in the sample`,
    );
  }
});

test("keeps every domain's count within one of its exact blueprint share, on every run", () => {
  const weightedDomains = [
    { slug: "alpha", name: "Alpha", weight: 70 },
    { slug: "beta", name: "Beta", weight: 30 },
  ];
  const bank = [
    ...Array.from({ length: 10 }, (_, i) => question(`alpha-${i}`, "alpha")),
    ...Array.from({ length: 10 }, (_, i) => question(`beta-${i}`, "beta")),
  ];
  const count = 5;
  // Exact targets: alpha 3.5, beta 1.5 — every run must land on the adjacent
  // integer pair, never on a value that rounds the same way twice over.
  const seenAlphaCounts = new Set();

  for (let seed = 0; seed < 200; seed += 1) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };

    const selected = selectQuestions(
      bank,
      weightedDomains,
      { mode: "weighted", count },
      random,
    );

    assert.equal(selected.length, count);
    assert.equal(new Set(selected.map((q) => q.id)).size, count);

    const alphaCount = selected.filter((q) => q.domain === "alpha").length;
    const betaCount = selected.filter((q) => q.domain === "beta").length;
    assert.ok(
      alphaCount === 3 || alphaCount === 4,
      `alpha count ${alphaCount} fell outside its exact target's adjacent integers`,
    );
    assert.equal(alphaCount + betaCount, count);
    seenAlphaCounts.add(alphaCount);
  }

  // Both integers adjacent to the exact target must actually occur — a
  // deterministic rounding rule would always pick the same one.
  assert.deepEqual([...seenAlphaCounts].sort(), [3, 4]);
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

function scopedQuestion(id, domain, scope = "core", subdomain) {
  const built = question(id, domain);
  built.scope = scope;
  if (scope !== "core") {
    built.scopeNote = "Tagged for test purposes.";
  }
  if (subdomain !== undefined) {
    built.subdomain = subdomain;
  }
  return built;
}

const scopedBank = [
  scopedQuestion("core-1", "alpha"),
  scopedQuestion("core-2", "alpha", "core"),
  scopedQuestion("deep-1", "alpha", "deep"),
  scopedQuestion("deep-2", "beta", "deep"),
];

test("defaults to the exam-aligned slice of the bank", () => {
  assert.deepEqual(
    filterQuestionsByScope(scopedBank).map((q) => q.id),
    ["core-1", "core-2"],
  );
});

test("widens the pool when the scope filter opens up", () => {
  assert.deepEqual(
    filterQuestionsByScope(scopedBank, "core-only").map((q) => q.id),
    ["core-1", "core-2"],
  );
  assert.deepEqual(
    filterQuestionsByScope(scopedBank, "with-deep").map((q) => q.id),
    ["core-1", "core-2", "deep-1", "deep-2"],
  );
});

test("applies the scope filter to every selection mode", () => {
  for (const mode of ["all", "random", "weighted"]) {
    const selected = selectQuestions(scopedBank, domains, {
      mode,
      ...(mode === "all" ? {} : { count: 4 }),
    });
    assert.deepEqual(
      selected.map((q) => q.id).sort(),
      ["core-1", "core-2"],
      `mode ${mode} leaked a tagged question`,
    );
  }

  // beta holds only a deep question, so the default filter empties it.
  assert.throws(
    () =>
      selectQuestions(scopedBank, domains, {
        mode: "domain",
        domain: "beta",
      }),
    /No questions are available for the selected domain "beta"/,
  );
});

test("defaults the scope filter to core-only when unset", () => {
  const selected = selectQuestions(scopedBank, domains, { mode: "all" });
  assert.equal(selected.length, 2);
});

test("reports when the scope filter empties the pool", () => {
  assert.throws(
    () =>
      selectQuestions([scopedQuestion("deep-only", "alpha", "deep")], domains, {
        mode: "all",
      }),
    /No questions match the selected question scope/,
  );
});

test("weights by skill when a domain publishes a skill breakdown", () => {
  const skillDomains = [
    {
      slug: "alpha",
      name: "Alpha",
      weight: 100,
      skills: [
        { slug: "big", name: "Big", weight: 99 },
        { slug: "small", name: "Small", weight: 1 },
      ],
    },
  ];
  const bank = [
    scopedQuestion("big-1", "alpha", undefined, "big"),
    scopedQuestion("big-2", "alpha", undefined, "big"),
    scopedQuestion("small-1", "alpha", undefined, "small"),
    scopedQuestion("small-2", "alpha", undefined, "small"),
  ];

  // Domain-level weighting cannot distinguish these four; skill-level weighting
  // must almost always reach for the 99% skill first.
  let bigFirst = 0;
  for (let seed = 0; seed < 200; seed += 1) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };
    const [first] = selectQuestions(
      bank,
      skillDomains,
      { mode: "weighted", count: 1 },
      random,
    );
    if (first.subdomain === "big") {
      bigFirst += 1;
    }
  }

  assert.ok(
    bigFirst > 180,
    `expected the 99% skill to dominate, picked it ${bigFirst}/200 times`,
  );
});

test("falls back to domain weighting when no skills are declared", () => {
  const bank = [
    scopedQuestion("alpha-1", "alpha"),
    scopedQuestion("beta-1", "beta"),
  ];

  const selected = selectQuestions(bank, domains, {
    mode: "weighted",
    count: 2,
  });
  assert.deepEqual(selected.map((q) => q.id).sort(), ["alpha-1", "beta-1"]);
});

test("redistributes a domain's shortfall to other domains when its pool runs dry", () => {
  const skewedDomains = [
    { slug: "small", name: "Small", weight: 90 },
    { slug: "big", name: "Big", weight: 10 },
  ];
  // "small" is weighted at 90% but only has one question available; "big"
  // must absorb the rest of the quota without exceeding its own pool either.
  const bank = [
    scopedQuestion("small-1", "small"),
    ...Array.from({ length: 9 }, (_, i) => scopedQuestion(`big-${i}`, "big")),
  ];

  for (let seed = 0; seed < 50; seed += 1) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };

    const selected = selectQuestions(
      bank,
      skewedDomains,
      { mode: "weighted", count: 10 },
      random,
    );

    assert.equal(selected.length, 10);
    assert.equal(new Set(selected.map((q) => q.id)).size, 10);
    const smallCount = selected.filter((q) => q.domain === "small").length;
    const bigCount = selected.filter((q) => q.domain === "big").length;
    assert.ok(
      smallCount <= 1,
      `"small" pool only has 1 question but ${smallCount} were drawn`,
    );
    assert.equal(smallCount + bigCount, 10);
  }
});

test("only reaches a question with an undeclared subdomain once every declared skill is exhausted", () => {
  const skillDomains = [
    {
      slug: "alpha",
      name: "Alpha",
      weight: 100,
      skills: [
        { slug: "known-a", name: "Known A", weight: 50 },
        { slug: "known-b", name: "Known B", weight: 50 },
      ],
    },
  ];
  // "unknown" names no declared skill — content validation rejects this in
  // the real bank, so this exercises the defensive fallback bucket only.
  const bank = [
    scopedQuestion("a-1", "alpha", "core", "known-a"),
    scopedQuestion("b-1", "alpha", "core", "known-b"),
    scopedQuestion("orphan-1", "alpha", "core", "unknown"),
  ];

  for (let seed = 0; seed < 50; seed += 1) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };

    // The declared skills alone can satisfy a 2-question draw, so the
    // orphaned question must never be reached.
    const partial = selectQuestions(
      bank,
      skillDomains,
      { mode: "weighted", count: 2 },
      random,
    );
    assert.equal(partial.length, 2);
    assert.ok(
      !partial.some((q) => q.id === "orphan-1"),
      "drew the undeclared-subdomain question while declared skills still had room",
    );

    // Drawing all 3 forces the declared skills' pools to exhaust, so the
    // orphaned question must appear to fill out the quota.
    const full = selectQuestions(
      bank,
      skillDomains,
      { mode: "weighted", count: 3 },
      random,
    );
    assert.deepEqual(full.map((q) => q.id).sort(), ["a-1", "b-1", "orphan-1"]);
  }
});

test("getUnusedQuizQuestions excludes used questions and respects scope/domain", () => {
  const bank = [
    question("q1", "alpha"),
    question("q2", "alpha"),
    question("q3", "beta"),
    { ...question("q4", "beta"), scope: "deep", scopeNote: "Advanced topic" },
  ];

  // Exclude seen questions
  const unused1 = getUnusedQuizQuestions(bank, ["q1"], "core-only");
  assert.deepEqual(
    unused1.map((q) => q.id),
    ["q2", "q3"],
  );

  // Deep questions included when scope is with-deep
  const unused2 = getUnusedQuizQuestions(bank, ["q1"], "with-deep");
  assert.deepEqual(
    unused2.map((q) => q.id),
    ["q2", "q3", "q4"],
  );

  // Domain filter applied
  const unusedDomain = getUnusedQuizQuestions(
    bank,
    ["q1"],
    "core-only",
    "alpha",
  );
  assert.deepEqual(
    unusedDomain.map((q) => q.id),
    ["q2"],
  );

  // All questions used
  const unusedAll = getUnusedQuizQuestions(
    bank,
    ["q1", "q2", "q3"],
    "core-only",
  );
  assert.deepEqual(unusedAll, []);
});

test("prepareRetakeSession: exact retake reproduces questions in order", () => {
  const bank = [
    question("q1", "alpha"),
    question("q2", "alpha"),
    question("q3", "beta"),
  ];
  const attempt = {
    config: {
      mode: "random",
      count: 2,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["q3", "q1"],
  };

  const retake = prepareRetakeSession(bank, domains, attempt, "exact");
  assert.deepEqual(
    retake.questions.map((q) => q.id),
    ["q3", "q1"],
  );
  assert.equal(retake.config.count, 2);
  assert.equal(retake.config.revealMode, "immediate");

  // Handles missing question from bank
  const partialBank = [question("q1", "alpha")];
  const partialRetake = prepareRetakeSession(
    partialBank,
    domains,
    attempt,
    "exact",
  );
  assert.deepEqual(
    partialRetake.questions.map((q) => q.id),
    ["q1"],
  );
  assert.equal(partialRetake.config.count, 1);

  // Throws if no questions available
  assert.throws(
    () => prepareRetakeSession([], domains, attempt, "exact"),
    /The question bank is empty/,
  );
  assert.throws(
    () =>
      prepareRetakeSession(
        [question("other", "alpha")],
        domains,
        attempt,
        "exact",
      ),
    /No questions from the previous attempt are available/,
  );
});

test("prepareRetakeSession: random retake re-runs selection with attempt config", () => {
  const bank = [
    question("q1", "alpha"),
    question("q2", "alpha"),
    question("q3", "beta"),
  ];
  const attempt = {
    config: {
      mode: "random",
      count: 2,
      revealMode: "end",
      scopeFilter: "core-only",
    },
    questionIds: ["q1", "q2"],
  };

  const retake = prepareRetakeSession(bank, domains, attempt, "random");
  assert.equal(retake.questions.length, 2);
  assert.equal(retake.config.mode, "random");
  assert.equal(retake.config.count, 2);
  assert.equal(retake.config.revealMode, "end");

  // Mode "all" is randomized with count set
  const allAttempt = {
    config: { mode: "all", revealMode: "immediate", scopeFilter: "core-only" },
    questionIds: ["q1", "q2", "q3"],
  };
  const allRetake = prepareRetakeSession(bank, domains, allAttempt, "random");
  assert.equal(allRetake.questions.length, 3);
  assert.equal(allRetake.config.mode, "random");
  assert.equal(allRetake.config.count, 3);
});

test("prepareRetakeSession: other retake selects from unseen questions", () => {
  const bank = [
    question("q1", "alpha"),
    question("q2", "alpha"),
    question("q3", "alpha"),
    question("q4", "beta"),
    question("q5", "beta"),
  ];

  // When unused questions >= previous count
  const attempt1 = {
    config: {
      mode: "random",
      count: 2,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["q1", "q2"],
  };
  const retake1 = prepareRetakeSession(bank, domains, attempt1, "other");
  assert.equal(retake1.questions.length, 2);
  assert.ok(retake1.questions.every((q) => q.id !== "q1" && q.id !== "q2"));
  assert.equal(retake1.config.count, 2);

  // When unused questions < previous count
  const attempt2 = {
    config: {
      mode: "random",
      count: 4,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["q1", "q2", "q3", "q4"],
  };
  const retake2 = prepareRetakeSession(bank, domains, attempt2, "other");
  assert.equal(retake2.questions.length, 1);
  assert.equal(retake2.questions[0].id, "q5");
  assert.equal(retake2.config.count, 1);

  // When attempt was domain-specific
  const domainAttempt = {
    config: {
      mode: "domain",
      domain: "alpha",
      count: 1,
      revealMode: "end",
      scopeFilter: "core-only",
    },
    questionIds: ["q1"],
  };
  const domainRetake = prepareRetakeSession(
    bank,
    domains,
    domainAttempt,
    "other",
  );
  assert.equal(domainRetake.questions.length, 1);
  assert.ok(domainRetake.questions[0].domain === "alpha");
  assert.ok(domainRetake.questions[0].id !== "q1");
  assert.equal(domainRetake.config.mode, "domain");
  assert.equal(domainRetake.config.domain, "alpha");

  // Throws when 0 unused questions are available
  const fullAttempt = {
    config: {
      mode: "random",
      count: 5,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["q1", "q2", "q3", "q4", "q5"],
  };
  assert.throws(
    () => prepareRetakeSession(bank, domains, fullAttempt, "other"),
    /No unused questions are available from this certification/,
  );
});

test("prepareRetakeSession: throws on unsupported mode", () => {
  const bank = [question("q1", "alpha")];
  const attempt = {
    config: {
      mode: "random",
      count: 1,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["q1"],
  };
  assert.throws(
    () => prepareRetakeSession(bank, domains, attempt, "invalid-mode"),
    /Unsupported retake mode "invalid-mode"/,
  );
});

test("prepareRetakeSession: review mode retake respects reviewScope and domain in random and other modes", () => {
  const bank = [
    question("m1", "alpha"),
    question("m2", "alpha"),
    question("m3", "beta"),
    question("b1", "alpha"),
    question("clean", "alpha"),
  ];

  const reviewContext = {
    missedQuestionIds: ["m1", "m2", "m3"],
    bookmarkedQuestionIds: ["b1"],
  };

  // 1. "random" retake with review mode
  const reviewAttempt = {
    config: {
      mode: "review",
      reviewScope: "missed",
      count: 2,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["m1", "m2"],
  };

  const randomRetake = prepareRetakeSession(
    bank,
    domains,
    reviewAttempt,
    "random",
    Math.random,
    reviewContext,
  );
  assert.equal(randomRetake.questions.length, 2);
  assert.ok(
    randomRetake.questions.every((q) => ["m1", "m2", "m3"].includes(q.id)),
    "random retake included non-missed question",
  );

  // 2. "random" retake with review mode and domain filter
  const domainReviewAttempt = {
    config: {
      mode: "review",
      reviewScope: "missed",
      domain: "alpha",
      count: 2,
      revealMode: "immediate",
      scopeFilter: "core-only",
    },
    questionIds: ["m1", "m2"],
  };

  const domainRandomRetake = prepareRetakeSession(
    bank,
    domains,
    domainReviewAttempt,
    "random",
    Math.random,
    reviewContext,
  );
  assert.equal(domainRandomRetake.questions.length, 2);
  assert.deepEqual(domainRandomRetake.questions.map((q) => q.id).sort(), [
    "m1",
    "m2",
  ]);

  // 3. "other" retake with review mode
  const otherRetake = prepareRetakeSession(
    bank,
    domains,
    reviewAttempt,
    "other",
    Math.random,
    reviewContext,
  );
  assert.equal(otherRetake.questions.length, 1);
  assert.equal(otherRetake.questions[0].id, "m3");
  assert.equal(otherRetake.config.mode, "review");

  // 4. "other" retake with review mode throws when all review questions were used
  assert.throws(
    () =>
      prepareRetakeSession(
        bank,
        domains,
        {
          config: {
            mode: "review",
            reviewScope: "missed",
            domain: "alpha",
            count: 2,
            revealMode: "immediate",
            scopeFilter: "core-only",
          },
          questionIds: ["m1", "m2"],
        },
        "other",
        Math.random,
        reviewContext,
      ),
    /No unused questions are available from this certification/,
  );
});
