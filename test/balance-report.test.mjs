import assert from "node:assert/strict";
import test from "node:test";

import {
  BALANCE_TOLERANCE,
  BalanceReportError,
  buildBalanceReport,
  buildRepositoryReports,
  isCoreQuestion,
} from "../scripts/balance-report.mjs";

const manifest = {
  cert: "ccdv-f",
  domains: [
    {
      slug: "tools-and-mcps",
      name: "Tools and MCPs",
      weight: 100,
      skills: [
        {
          slug: "tool-implementation",
          name: "Tool Implementation",
          weight: 50,
        },
        { slug: "mcp-server-development", name: "MCP Server", weight: 50 },
      ],
    },
  ],
};

function questions(counts, extra = []) {
  const built = [];
  for (const [subdomain, count] of Object.entries(counts)) {
    for (let index = 0; index < count; index += 1) {
      built.push({ domain: "tools-and-mcps", subdomain, scope: "core" });
    }
  }
  return [...built, ...extra];
}

test("counts only questions explicitly scoped core", () => {
  assert.equal(isCoreQuestion({ scope: "core" }), true);
  assert.equal(isCoreQuestion({ scope: "deep" }), false);
  assert.equal(isCoreQuestion({}), false);
});

test("reports an evenly split bank as balanced", () => {
  const report = buildBalanceReport(
    manifest,
    questions({ "tool-implementation": 10, "mcp-server-development": 10 }),
  );

  assert.equal(report.coreCount, 20);
  assert.equal(report.target, 20);
  assert.deepEqual(report.offBalance, []);
  assert.deepEqual(
    report.skills.map((skill) => [skill.slug, skill.target, skill.actual]),
    [
      ["tool-implementation", 10, 10],
      ["mcp-server-development", 10, 10],
    ],
  );
});

test("flags a skill beyond the tolerance and sorts the shortfall first", () => {
  const report = buildBalanceReport(
    manifest,
    questions({ "tool-implementation": 17, "mcp-server-development": 3 }),
  );

  assert.equal(report.skills[0].slug, "mcp-server-development");
  assert.equal(report.skills[0].delta, -7);
  assert.equal(report.skills.at(-1).delta, 7);
  assert.deepEqual(report.offBalance.map((skill) => skill.slug).sort(), [
    "mcp-server-development",
    "tool-implementation",
  ]);
});

test("stays silent inside the tolerance", () => {
  const report = buildBalanceReport(
    manifest,
    questions({
      "tool-implementation": 10 + BALANCE_TOLERANCE,
      "mcp-server-development": 10 - BALANCE_TOLERANCE,
    }),
  );

  assert.deepEqual(report.offBalance, []);
});

test("excludes tagged questions from the core count and the targets", () => {
  const report = buildBalanceReport(
    manifest,
    questions({ "tool-implementation": 10, "mcp-server-development": 10 }, [
      {
        domain: "tools-and-mcps",
        subdomain: "tool-implementation",
        scope: "deep",
        scopeNote: "Above the sample questions' cognitive level.",
      },
      {
        domain: "tools-and-mcps",
        subdomain: "mcp-server-development",
        scope: "deep",
        scopeNote: "Not traceable to a blueprint objective.",
      },
    ]),
  );

  assert.equal(report.coreCount, 20);
  assert.equal(report.taggedCount, 2);
  assert.deepEqual(report.offBalance, []);
});

test("honours an explicit authoring target", () => {
  const report = buildBalanceReport(
    manifest,
    questions({ "tool-implementation": 10, "mcp-server-development": 10 }),
    { target: 30 },
  );

  assert.equal(report.target, 30);
  assert.deepEqual(
    report.skills.map((skill) => [skill.slug, skill.target, skill.delta]),
    [
      ["tool-implementation", 15, -5],
      ["mcp-server-development", 15, -5],
    ],
  );
});

test("gives the smallest skills a floor of two questions", () => {
  const tinyManifest = {
    cert: "ccdv-f",
    domains: [
      {
        slug: "security-and-safety",
        name: "Security and Safety",
        weight: 100,
        skills: [
          { slug: "claude-hooks", name: "Claude Hooks", weight: 1 },
          { slug: "ai-application-security", name: "AI App Sec", weight: 99 },
        ],
      },
    ],
  };

  const report = buildBalanceReport(tinyManifest, [], { target: 100 });
  const hooks = report.skills.find((skill) => skill.slug === "claude-hooks");

  // 1% of 100 rounds to 1, but a single question is not practice.
  assert.equal(hooks.target, 2);
});

test("reports no skills for a manifest without a breakdown", () => {
  const report = buildBalanceReport(
    { cert: "az-900", domains: [{ slug: "d", name: "D", weight: 100 }] },
    [{ domain: "d" }],
  );

  assert.deepEqual(report.skills, []);
  assert.deepEqual(report.offBalance, []);
});

test("useExamMultiplier sets target to twice the examQuestionCount", () => {
  const manifestWithExam = {
    cert: "custom-cert",
    examQuestionCount: 50,
    domains: [{ slug: "d", name: "D", weight: 100 }],
  };
  const report = buildBalanceReport(
    manifestWithExam,
    [{ domain: "d", scope: "core" }],
    { useExamMultiplier: true },
  );
  assert.equal(report.target, 100);
  assert.equal(report.domains[0].target, 100);
  assert.equal(report.domains[0].delta, -99);
});

test("calculates domain balance with correct deltas", () => {
  const report = buildBalanceReport(
    {
      cert: "custom-cert",
      domains: [
        { slug: "d1", name: "D1", weight: 40 },
        { slug: "d2", name: "D2", weight: 60 },
      ],
    },
    [
      { domain: "d1", scope: "core" },
      { domain: "d1", scope: "core" },
      { domain: "d2", scope: "core" },
    ],
    { target: 10 },
  );
  assert.deepEqual(
    report.domains.map((d) => [d.slug, d.target, d.actual, d.delta]),
    [
      ["d1", 4, 2, -2],
      ["d2", 6, 1, -5],
    ],
  );
});

test("useExamMultiplier falls back to core.length when examQuestionCount is missing", () => {
  const manifestWithoutExam = {
    cert: "custom-cert",
    domains: [{ slug: "d", name: "D", weight: 100 }],
  };
  const report = buildBalanceReport(
    manifestWithoutExam,
    [
      { domain: "d", scope: "core" },
      { domain: "d", scope: "core" },
    ],
    { useExamMultiplier: true },
  );
  assert.equal(report.target, 2);
  assert.equal(report.domains[0].target, 2);
  assert.equal(report.domains[0].delta, 0);
});

test("apportions domain targets with largest remainder so sum matches target exactly", () => {
  const report = buildBalanceReport(
    {
      cert: "az-900",
      domains: [
        { slug: "concepts", name: "Concepts", weight: 28 },
        { slug: "arch", name: "Architecture", weight: 39 },
        { slug: "gov", name: "Governance", weight: 33 },
      ],
    },
    [],
    { target: 80 },
  );
  // Math.round gives 22 + 31 + 26 = 79. Apportionment ensures [23, 31, 26] summing to 80.
  assert.deepEqual(
    report.domains.map((d) => d.target),
    [23, 31, 26],
  );
  assert.equal(
    report.domains.reduce((sum, d) => sum + d.target, 0),
    80,
  );
});

test("buildRepositoryReports throws BalanceReportError when requested slug is missing", async () => {
  await assert.rejects(
    () => buildRepositoryReports(undefined, { slugs: ["non-existent-cert"] }),
    (error) => {
      assert.ok(error instanceof BalanceReportError);
      assert.match(
        error.message,
        /"non-existent-cert" has no matching certs\/ folder/,
      );
      return true;
    },
  );
});
