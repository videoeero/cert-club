import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  FIGURE,
  buildClaimsReport,
  extractFigures,
  formatClaimsReport,
  provenanceSurface,
} from "../scripts/check-claims.mjs";
import { readCertQuestions } from "../scripts/lib/read-certs.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function mockQuestion(overrides = {}) {
  return {
    id: "test-bank-001",
    domain: "test-domain",
    difficulty: "medium",
    status: "draft",
    scope: "core",
    stem: "What is the recommended approach?",
    options: [
      { id: "opt-a", text: "Option A" },
      { id: "opt-b", text: "Option B" },
    ],
    correct: ["opt-a"],
    explanation: "Option A is correct.",
    sourceUrl: "https://example.com/docs/page",
    sourceNote: "Documentation page",
    sourceCheckedAt: "2026-01-01",
    ...overrides,
  };
}

test("provenanceSurface includes explanation, sourceNote, distractorNotes, and keyed option text", () => {
  const q = mockQuestion({
    explanation: "Explanation text.",
    sourceNote: "Source note text.",
    distractorNotes: {
      "opt-b": "Distractor note for B.",
    },
    options: [
      { id: "opt-a", text: "Keyed option text." },
      { id: "opt-b", text: "Distractor option text." },
    ],
    correct: ["opt-a"],
  });

  const surface = provenanceSurface(q);
  assert.match(surface, /Explanation text\./);
  assert.match(surface, /Source note text\./);
  assert.match(surface, /Distractor note for B\./);
  assert.match(surface, /Keyed option text\./);
});

test("provenanceSurface deliberately excludes non-keyed option text and stem", () => {
  const q = mockQuestion({
    stem: "Scenario with 100 requests per second.",
    explanation: "Standard explanation.",
    options: [
      { id: "opt-a", text: "Keyed option without figures." },
      { id: "opt-b", text: "Distractor asserting 90% discount." },
    ],
    correct: ["opt-a"],
  });

  const surface = provenanceSurface(q);
  assert.doesNotMatch(surface, /100 requests/);
  assert.doesNotMatch(surface, /90%/);
});

test("provenanceSurface handles missing optional fields gracefully", () => {
  const q = {
    explanation: "Only explanation.",
  };
  const surface = provenanceSurface(q);
  assert.equal(surface.trim(), "Only explanation.");
});

test("FIGURE regex matches currency amounts", () => {
  assert.match("$0", FIGURE);
  assert.match("$5", FIGURE);
  assert.match("$ 10", FIGURE);
  assert.match("$1,500.50", FIGURE);
});

test("FIGURE regex reports currency amounts whole, not just the first digit", () => {
  // `\$\s?\d` alone captured one digit, so every currency figure in the corpus
  // was reported truncated: $500 as $5, $450 as $4, $0.00 as $0. The listing is
  // what a reviewer carries to the cited page, so the extent has to be right.
  const g = () => new RegExp(FIGURE.source, "gi");
  assert.deepEqual("Costs $500 per month".match(g()), ["$500"]);
  assert.deepEqual("$450 and $0.00 inbound".match(g()), ["$450", "$0.00"]);
  assert.deepEqual("a $1,500.50 invoice".match(g()), ["$1,500.50"]);
  assert.deepEqual("the $500. sentence end".match(g()), ["$500"]);
});

test("FIGURE regex keeps the lower bound of a range", () => {
  // "often 1,000-2,000 tokens" reported as "2,000 tokens" dropped half the claim.
  // This is the surface of ccar-p-solution-design-and-architecture-014.
  const g = () => new RegExp(FIGURE.source, "gi");
  assert.deepEqual("often 1,000-2,000 tokens".match(g()), [
    "1,000-2,000 tokens",
  ]);
  assert.deepEqual("30-50 requests".match(g()), ["30-50 requests"]);
  assert.deepEqual("a 30,000-token limit".match(g()), ["30,000-token"]);
});

test("FIGURE regex handles boundary trap 1: % without trailing word boundary", () => {
  // A non-word character followed by \b asserts a word character follows,
  // which silently fails on "85%," and "85% of". The rule must match both.
  assert.match("85%,", FIGURE);
  assert.match("85% of", FIGURE);
  assert.match("improved by 10%", FIGURE);
  assert.match("a 0.1% error rate", FIGURE);
  assert.match("23.15%", FIGURE);
});

test("FIGURE regex handles boundary trap 2: hyphenated duration and unit compounds", () => {
  // Units attach with hyphens as often as spaces in documentation.
  assert.match("24-hour", FIGURE);
  assert.match("5-minute", FIGURE);
  assert.match("30-day", FIGURE);
  assert.match("18-month", FIGURE);
  assert.match("3-year", FIGURE);
  assert.match("2-second", FIGURE);
  assert.match("8,000-token", FIGURE);
  assert.match("150,000-token", FIGURE);
  assert.match("180-day", FIGURE);
});

test("FIGURE regex matches duration, memory, token, and request units", () => {
  assert.match("300ms", FIGURE);
  assert.match("500 milliseconds", FIGURE);
  assert.match("10 sec", FIGURE);
  assert.match("2 seconds", FIGURE);
  assert.match("15 min", FIGURE);
  assert.match("5 minutes", FIGURE);
  assert.match("1 hr", FIGURE);
  assert.match("24 hours", FIGURE);
  assert.match("30 days", FIGURE);
  assert.match("2 weeks", FIGURE);
  assert.match("12 months", FIGURE);
  assert.match("3 years", FIGURE);
  assert.match("10 GB", FIGURE);
  assert.match("128 TiB", FIGURE);
  assert.match("80 TB", FIGURE);
  assert.match("20,000 tokens", FIGURE);
  assert.match("100 requests", FIGURE);
  assert.match("85 percent", FIGURE);
});

test("FIGURE regex does NOT match mechanism phrasing without numerals or plain numbers", () => {
  // b74a91a rewrote "90% read discount" to "a tenth of the input price".
  // With no numeral, it must not flag.
  assert.doesNotMatch("a tenth of the input price", FIGURE);
  assert.doesNotMatch("reduced by half", FIGURE);
  assert.doesNotMatch("Proposal 2", FIGURE);
  assert.doesNotMatch("Option B", FIGURE);
  assert.doesNotMatch("CLF-C02", FIGURE);
  assert.doesNotMatch("AZ-900", FIGURE);
});

test("extractFigures returns matched figures with originating fields", () => {
  const q = mockQuestion({
    explanation: "Costs $500 and takes 5 minutes.",
    sourceNote: "Updated for 30-day trial.",
    distractorNotes: {
      "opt-b": "Distractor with 100 GB limit.",
    },
    options: [
      { id: "opt-a", text: "Keyed answer with 90% savings." },
      { id: "opt-b", text: "Ignored distractor with 50% savings." },
    ],
    correct: ["opt-a"],
  });

  const figures = extractFigures(q);
  assert.deepEqual(figures, [
    { field: "explanation", figure: "$500" },
    { field: "explanation", figure: "5 minutes" },
    { field: "sourceNote", figure: "30-day" },
    { field: "distractorNotes.opt-b", figure: "100 GB" },
    { field: "options.opt-a", figure: "90%" },
  ]);
});

test("buildClaimsReport and formatClaimsReport format cleanly and sort questions by id", () => {
  const manifest = { cert: "test-cert" };
  const questions = [
    mockQuestion({
      id: "test-002",
      explanation: "Offers 24-hour support.",
    }),
    mockQuestion({
      id: "test-001",
      explanation: "Includes 50% discount.",
    }),
    mockQuestion({
      id: "test-003",
      explanation: "No figures here.",
    }),
  ];

  const report = buildClaimsReport(manifest, questions);
  assert.equal(report.cert, "test-cert");
  assert.equal(report.totalQuestions, 3);
  assert.equal(report.figureBearingQuestions.length, 2);
  assert.equal(report.figureBearingQuestions[0].id, "test-001");
  assert.equal(report.figureBearingQuestions[1].id, "test-002");

  const formatted = formatClaimsReport(report);
  assert.equal(
    formatted,
    "test-cert: 2 figure-bearing question(s) of 3\n  test-001\n    explanation: 50%\n  test-002\n    explanation: 24-hour",
  );
});

test("corpus regression: sda-014 reports its token range whole", async () => {
  const questions = await readCertQuestions(
    join(repositoryRoot, "certs", "ccar-p"),
  );
  const q = questions.find(
    (item) => item.id === "ccar-p-solution-design-and-architecture-014",
  );
  assert.ok(q, "sda-014 must exist");
  const figures = extractFigures(q).map((entry) => entry.figure);
  assert.ok(
    figures.some((figure) => /1,000\s*-\s*2,000/.test(figure)),
    `sda-014 must report the full 1,000-2,000 range, got ${JSON.stringify(figures)}`,
  );
});

test("corpus regression: detects the eight figure-bearing items missed by the hand pass", async () => {
  const targets = [
    {
      bank: "ccar-p",
      id: "ccar-p-claude-models-prompting-and-context-engineering-001",
    },
    { bank: "ccar-p", id: "ccar-p-integration-008" },
    {
      bank: "ccar-p",
      id: "ccar-p-solution-design-and-architecture-014",
    },
    { bank: "aws-clf-c02", id: "aws-clf-c02-billing-pricing-and-support-001" },
    { bank: "aws-clf-c02", id: "aws-clf-c02-billing-pricing-and-support-007" },
    { bank: "aws-clf-c02", id: "aws-clf-c02-cloud-concepts-026" },
    {
      bank: "aws-clf-c02",
      id: "aws-clf-c02-cloud-technology-and-services-020",
    },
    { bank: "ccdv-f", id: "ccdv-f-prompt-and-context-engineering-001" },
  ];

  const questionsByBank = new Map();
  for (const { bank, id } of targets) {
    if (!questionsByBank.has(bank)) {
      const bankQuestions = await readCertQuestions(
        join(repositoryRoot, "certs", bank),
      );
      questionsByBank.set(bank, new Map(bankQuestions.map((q) => [q.id, q])));
    }
    const q = questionsByBank.get(bank).get(id);
    assert.ok(q, `Question ${id} must exist in bank ${bank}`);
    const surface = provenanceSurface(q);
    assert.ok(
      FIGURE.test(surface),
      `Question ${id} was missed by the hand pass and must be detected by FIGURE`,
    );
    assert.ok(
      extractFigures(q).length > 0,
      `Question ${id} must yield at least one figure entry in extractFigures`,
    );
  }
});

test("corpus regression: does NOT detect items with figures solely in distractors or mechanism wording", async () => {
  const ccarPQuestions = await readCertQuestions(
    join(repositoryRoot, "certs", "ccar-p"),
  );
  const byId = new Map(ccarPQuestions.map((q) => [q.id, q]));

  // ccar-p-...-014 has "20%" only in non-keyed option text (opt-a); key is opt-c.
  const q014 = byId.get(
    "ccar-p-claude-models-prompting-and-context-engineering-014",
  );
  assert.ok(q014, "Question 014 must exist");
  assert.equal(
    FIGURE.test(provenanceSurface(q014)),
    false,
    "ccar-p-...-014 carries figure only in non-keyed option text and must NOT be detected",
  );
  assert.equal(extractFigures(q014).length, 0);

  // ccar-p-...-003 was rewritten to "a tenth of the input price" with no numeral.
  const q003 = byId.get(
    "ccar-p-stakeholder-communication-and-lifecycle-management-003",
  );
  assert.ok(q003, "Question 003 must exist");
  assert.equal(
    FIGURE.test(provenanceSurface(q003)),
    false,
    "ccar-p-...-003 uses mechanism wording without numerals and must NOT be detected",
  );
  assert.equal(extractFigures(q003).length, 0);
});
