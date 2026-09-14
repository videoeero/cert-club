import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  FIGURE,
  buildClaimsReport,
  checkQuestionClaims,
  extractBackticks,
  extractFigures,
  extractQuotedSpans,
  fetchPageText,
  formatClaimsReport,
  isMdHost,
  normalizeText,
  provenanceSurface,
  stripMarkdown,
  toMdUrl,
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

function createMockFetcher(handlers = {}) {
  return async (url, init = {}) => {
    const handler = handlers[url] || handlers["*"];
    if (!handler) {
      return {
        ok: false,
        status: 404,
        headers: new Headers(),
        text: async () => "Not Found",
        body: { cancel: async () => {} },
      };
    }
    if (handler instanceof Error) {
      throw handler;
    }
    if (typeof handler === "function") {
      return handler(url, init);
    }
    const {
      status = 200,
      text = "",
      headers = { "content-type": "text/markdown" },
    } = handler;
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers(headers),
      text: async () => text,
      body: { cancel: async () => {} },
    };
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
  const g = () => new RegExp(FIGURE.source, "gi");
  assert.deepEqual("Costs $500 per month".match(g()), ["$500"]);
  assert.deepEqual("$450 and $0.00 inbound".match(g()), ["$450", "$0.00"]);
  assert.deepEqual("a $1,500.50 invoice".match(g()), ["$1,500.50"]);
  assert.deepEqual("the $500. sentence end".match(g()), ["$500"]);
});

test("FIGURE regex keeps the lower bound of a range", () => {
  const g = () => new RegExp(FIGURE.source, "gi");
  assert.deepEqual("often 1,000-2,000 tokens".match(g()), [
    "1,000-2,000 tokens",
  ]);
  assert.deepEqual("30-50 requests".match(g()), ["30-50 requests"]);
  assert.deepEqual("a 30,000-token limit".match(g()), ["30,000-token"]);
});

test("FIGURE regex handles boundary trap 1: % without trailing word boundary", () => {
  assert.match("85%,", FIGURE);
  assert.match("85% of", FIGURE);
  assert.match("improved by 10%", FIGURE);
  assert.match("a 0.1% error rate", FIGURE);
  assert.match("23.15%", FIGURE);
});

test("FIGURE regex handles boundary trap 2: hyphenated duration and unit compounds", () => {
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

// ============================================================================
// Stage B Tests: Host routing, Normalisation, Page Fetching, Hard & Advisory Checks
// ============================================================================

test("Stage B: isMdHost and toMdUrl recognize in-scope .md-serving hosts and strip fragments", () => {
  assert.equal(
    isMdHost(
      "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
    ),
    true,
  );
  assert.equal(isMdHost("https://code.claude.com/docs/en/sub-agents.md"), true);
  assert.equal(
    isMdHost(
      "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio",
    ),
    true,
  );

  // Out of scope hosts
  assert.equal(
    isMdHost("https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/"),
    false,
  );
  assert.equal(isMdHost("https://aws.amazon.com/free/"), false);
  assert.equal(
    isMdHost(
      "https://learn.microsoft.com/en-us/azure/reliability/regions-paired",
    ),
    false,
  );
  assert.equal(
    isMdHost(
      "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    ),
    false,
  );

  // toMdUrl conversion
  assert.equal(
    toMdUrl(
      "https://platform.claude.com/docs/en/build-with-claude/prompt-caching#structure-prompts",
    ),
    "https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md",
  );
  assert.equal(
    toMdUrl("https://code.claude.com/docs/en/sub-agents.md"),
    "https://code.claude.com/docs/en/sub-agents.md",
  );
  assert.equal(
    toMdUrl(
      "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html",
    ),
    null,
  );
});

test("Stage B: normalizeText casefolds, collapses whitespace, and straightens curly quotes", () => {
  const input = "  “Curly Double” and \t \n ‘Curly Single’  with  UPPERCASE  ";
  assert.equal(
    normalizeText(input),
    "\"curly double\" and 'curly single' with uppercase",
  );
});

test("Stage B: stripMarkdown removes inline formatting markers while keeping text", () => {
  const input =
    "# Header\n* **Bold text** and _italic_ with [a link](https://example.com) and `code`";
  const stripped = stripMarkdown(input);
  assert.match(stripped, /Bold text/);
  assert.match(stripped, /italic/);
  assert.match(stripped, /a link/);
  assert.match(stripped, /code/);
  assert.doesNotMatch(stripped, /\*\*/);
  assert.doesNotMatch(stripped, /https:\/\/example\.com/);
});

test("Stage B: extractQuotedSpans extracts double and single quoted spans without apostrophe collisions", () => {
  const text = `The doc says "exact match required" and notes 'single quoted term'. But don't break on model's internal contractions.`;
  const spans = extractQuotedSpans(text);
  assert.deepEqual(spans, ["exact match required", "single quoted term"]);
});

test("Stage B: extractBackticks extracts identifiers without whitespace", () => {
  const text =
    "Use `budget_tokens` and `output_config.effort`, but skip `multi word expressions` here.";
  const identifiers = extractBackticks(text);
  assert.deepEqual(identifiers, ["budget_tokens", "output_config.effort"]);
});

test("Stage B: fetchPageText handles .md available, out-of-scope, http errors, thin, and network failures", async () => {
  const fetcher = createMockFetcher({
    "https://platform.claude.com/docs/en/good.md": {
      status: 200,
      text: "# Good Documentation Page\nThis is valid markdown documentation with more than fifty characters to pass the thin check.",
    },
    "https://platform.claude.com/docs/en/thin.md": {
      status: 200,
      text: "short text",
    },
    "https://platform.claude.com/docs/en/html-page.md": {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      text: "<html><body>Not markdown</body></html> with sufficient length to test content type.",
    },
    "https://platform.claude.com/docs/en/not-found.md": {
      status: 404,
      text: "Page Not Found",
    },
    "https://platform.claude.com/docs/en/network-err.md": new Error(
      "Connection refused",
    ),
  });

  // .md available
  const good = await fetchPageText("https://platform.claude.com/docs/en/good", {
    fetcher,
  });
  assert.equal(good.status, "ok");
  assert.ok(good.text.length > 50);

  // Out of scope host
  const outOfScope = await fetchPageText(
    "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/index.html",
    { fetcher },
  );
  assert.equal(outOfScope.status, "inconclusive");
  assert.equal(outOfScope.reason, "out-of-scope host");

  // HTTP error
  const notFound = await fetchPageText(
    "https://platform.claude.com/docs/en/not-found",
    { fetcher },
  );
  assert.equal(notFound.status, "inconclusive");
  assert.equal(notFound.reason, "http-error");

  // Non-.md HTML response
  const htmlResp = await fetchPageText(
    "https://platform.claude.com/docs/en/html-page",
    { fetcher },
  );
  assert.equal(htmlResp.status, "inconclusive");
  assert.equal(htmlResp.reason, "non-md response");

  // Thin page (< 50 chars)
  const thin = await fetchPageText("https://platform.claude.com/docs/en/thin", {
    fetcher,
  });
  assert.equal(thin.status, "inconclusive");
  assert.equal(thin.reason, "thin page");

  // Network failure
  const netErr = await fetchPageText(
    "https://platform.claude.com/docs/en/network-err",
    { fetcher },
  );
  assert.equal(netErr.status, "inconclusive");
  assert.equal(netErr.reason, "network-error");
});

test("Stage B: Check 1 and Check 2 detect matches and mismatches when .md is available", () => {
  const pageResult = {
    status: "ok",
    text: "Claude provides `budget_tokens` and `cache_control` to control costs. The documentation specifies 'exact prefix matching' for caching.",
  };

  // Both match
  const qClean = mockQuestion({
    explanation:
      "Configure `budget_tokens` carefully. Remember that 'exact prefix matching' is enforced.",
    sourceUrl: "https://platform.claude.com/docs/en/caching",
  });
  const checkClean = checkQuestionClaims(qClean, pageResult);
  assert.equal(checkClean.findings.length, 0);
  assert.equal(checkClean.quotes[0].status, "matched");
  assert.equal(checkClean.backticks[0].status, "matched");

  // Quote mismatch
  const qQuoteMismatch = mockQuestion({
    explanation:
      "Documentation claims 'approximate semantic matching' applies.",
    sourceUrl: "https://platform.claude.com/docs/en/caching",
  });
  const checkQuoteMismatch = checkQuestionClaims(qQuoteMismatch, pageResult);
  assert.equal(checkQuoteMismatch.findings.length, 1);
  assert.equal(checkQuoteMismatch.findings[0].type, "quote-mismatch");
  assert.equal(
    checkQuoteMismatch.findings[0].item,
    "approximate semantic matching",
  );

  // Backticked identifier absent
  const qIdentifierMissing = mockQuestion({
    explanation: "Set `output_config.effort` parameter.",
    sourceUrl: "https://platform.claude.com/docs/en/caching",
  });
  const checkIdentifierMissing = checkQuestionClaims(
    qIdentifierMissing,
    pageResult,
  );
  assert.equal(checkIdentifierMissing.findings.length, 1);
  assert.equal(checkIdentifierMissing.findings[0].type, "identifier-missing");
  assert.equal(checkIdentifierMissing.findings[0].item, "output_config.effort");
});

test("Stage B: out-of-scope hosts and failed fetches report INCONCLUSIVE and NEVER produce a finding", () => {
  const qOutOfScope = mockQuestion({
    explanation: "Uses AWS feature 'Dedicated Hosts' with parameter `tenancy`.",
    sourceUrl:
      "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts.html",
  });

  // Out of scope page result
  const outOfScopeResult = {
    status: "inconclusive",
    reason: "out-of-scope host",
  };
  const checkOutOfScope = checkQuestionClaims(qOutOfScope, outOfScopeResult);
  assert.equal(
    checkOutOfScope.findings.length,
    0,
    "Out-of-scope host must never produce a finding",
  );
  assert.equal(checkOutOfScope.quotes[0].status, "inconclusive");
  assert.equal(checkOutOfScope.backticks[0].status, "inconclusive");

  // Network error page result
  const netErrResult = {
    status: "inconclusive",
    reason: "network-error",
  };
  const checkNetErr = checkQuestionClaims(qOutOfScope, netErrResult);
  assert.equal(
    checkNetErr.findings.length,
    0,
    "Network error must never produce a finding",
  );
  assert.equal(checkNetErr.quotes[0].status, "inconclusive");
  assert.equal(checkNetErr.backticks[0].status, "inconclusive");
});

test("Stage B: Check 3 annotates Stage A's figures with page presence without gating", () => {
  const pageResult = {
    status: "ok",
    text: "The operation takes 5 minutes and consumes 20,000 tokens.",
  };
  const q = mockQuestion({
    explanation:
      "Takes 5 minutes, costs $500, and uses 20,000 tokens with 90% discount.",
    options: [{ id: "opt-a", text: "Option A" }],
    correct: ["opt-a"],
    sourceUrl: "https://platform.claude.com/docs/en/usage",
  });

  const check = checkQuestionClaims(q, pageResult);
  assert.equal(
    check.findings.length,
    0,
    "Figure check is advisory and never produces hard findings",
  );
  assert.equal(check.figures.length, 4);

  const presenceByFigure = Object.fromEntries(
    check.figures.map((f) => [f.figure, f.presence]),
  );
  assert.equal(presenceByFigure["5 minutes"], "found");
  assert.equal(presenceByFigure["20,000 tokens"], "found");
  assert.equal(presenceByFigure["$500"], "not-found");
  assert.equal(presenceByFigure["90%"], "not-found");
});

test("Stage B: known live test case sda-014 extracts 4 quoted spans and verifies verbatim against page text", async () => {
  const ccarPQuestions = await readCertQuestions(
    join(repositoryRoot, "certs", "ccar-p"),
  );
  const sda014 = ccarPQuestions.find(
    (q) => q.id === "ccar-p-solution-design-and-architecture-014",
  );
  assert.ok(sda014, "ccar-p-solution-design-and-architecture-014 must exist");

  const surface = provenanceSurface(sda014);
  const quotes = extractQuotedSpans(surface);
  assert.equal(
    quotes.length,
    4,
    "sda-014 must have exactly 4 quoted spans in provenance surface",
  );

  // Mock fetcher providing the verbatim document text
  const mockDocText = `
# Effective context engineering for AI agents
Specialized sub-agents handle focused tasks with clean context windows, and each
returns only a condensed, distilled summary of its work (often 1,000-2,000 tokens),
so that the detailed search context remains isolated within sub-agents, while the lead agent
focuses on synthesizing and analyzing the results.
`;

  const pageResult = {
    status: "ok",
    text: mockDocText,
  };

  const check = checkQuestionClaims(sda014, pageResult);
  assert.equal(
    check.findings.length,
    0,
    "All 4 quoted spans in sda-014 must match verbatim",
  );
  assert.ok(check.quotes.every((q) => q.status === "matched"));
});

test("Stage B: buildClaimsReport and formatClaimsReport format hard check findings and page presence", () => {
  const manifest = { cert: "test-cert" };
  const questions = [
    mockQuestion({
      id: "test-001",
      explanation: "Offers 5 minutes turnaround with `param_a`.",
      sourceUrl: "https://platform.claude.com/docs/en/service",
    }),
    mockQuestion({
      id: "test-002",
      explanation:
        "Requires 'strict compliance' and parameter `unsupported_param`.",
      sourceUrl: "https://platform.claude.com/docs/en/service",
    }),
  ];

  const pageResults = new Map([
    [
      "https://platform.claude.com/docs/en/service",
      {
        status: "ok",
        text: "Service provides `param_a` and 5 minutes SLA.",
      },
    ],
  ]);

  const report = buildClaimsReport(manifest, questions, { pageResults });
  assert.equal(report.findings.length, 2);
  assert.equal(report.findings[0].type, "quote-mismatch");
  assert.equal(report.findings[0].item, "strict compliance");
  assert.equal(report.findings[1].type, "identifier-missing");
  assert.equal(report.findings[1].item, "unsupported_param");

  const formatted = formatClaimsReport(report);
  assert.match(formatted, /Hard check findings \(2\):/);
  assert.match(formatted, /quote mismatch "strict compliance"/);
  assert.match(formatted, /missing identifier `unsupported_param`/);
  assert.match(formatted, /explanation: 5 minutes \(found\)/);
});
