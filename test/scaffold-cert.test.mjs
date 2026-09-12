import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";

import { catalogSchema, manifestSchema } from "../schemas/question-bank.mjs";
import {
  ScaffoldError,
  applyScaffold,
  buildCatalog,
  buildManifest,
  normalizeWeights,
  parseSpec,
  planScaffold,
  renderReviewProgress,
} from "../scripts/scaffold-cert.mjs";

const TEMPLATE = await readFile(
  new URL("../scripts/templates/review-progress.md", import.meta.url),
  "utf8",
);

function baseSpec(overrides = {}) {
  return {
    mode: "scaffold",
    slug: "sc-900",
    name: "Microsoft Certified: Security Compliance and Identity Fundamentals",
    examUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/",
    domains: [
      { slug: "concepts", name: "Describe Concepts", weight: 28, skills: [] },
      { slug: "identity", name: "Describe Identity", weight: 72, skills: [] },
    ],
    register: false,
    dryRun: false,
    today: "2026-09-09",
    template: TEMPLATE,
    ...overrides,
  };
}

// az-900's review file records this exact hand computation: Microsoft
// publishes 25-30/35-40/30-35, midpoint + scale-to-100 + floor + largest
// remainder produces 28/39/33.
test("normalizeWeights reproduces az-900's published range computation", () => {
  assert.deepEqual(normalizeWeights("25-30,35-40,30-35"), [28, 39, 33]);
});

test("distributes a question count across weights the way clf-c02 recorded", () => {
  // aws-clf-c02/review-progress.md: "The 4/6/6/2 allocation is the
  // largest-remainder distribution of 18 questions" over 24/30/34/12.
  assert.deepEqual(normalizeWeights("24,30,34,12", 18), [4, 6, 6, 2]);
});

test("rejects a target that is not a positive integer", () => {
  assert.throws(
    () => normalizeWeights("50,50", 0),
    /target must be a positive/,
  );
  assert.throws(
    () => normalizeWeights("50,50", 2.5),
    /target must be a positive/,
  );
});

// AWS CLF-C02's review-progress.md does NOT document source ranges the way
// az-900's does (grepped for "range": zero matches in the CLF-C02 review file
// or manifest). Its manifest already carries flat, already-integral weights
// (24/30/34/12) that sum to 100 outright. So the "published computation" for
// this bank is not a midpoint-normalization at all -- it is a pass-through.
// This locks the pass-through behaviour against the actual shipped weights,
// and the discrepancy (no ranges to lock a midpoint computation against) is
// reported back separately rather than silently assumed away.
test("normalizeWeights passes AWS CLF-C02's already-integral published weights through unchanged", () => {
  assert.deepEqual(normalizeWeights("24,30,34,12"), [24, 30, 34, 12]);
});

test("normalizeWeights passes through already-integral weights that sum to 100", () => {
  assert.deepEqual(normalizeWeights("10,20,30,40"), [10, 20, 30, 40]);
});

test("normalizeWeights accepts bare integers mixed with ranges", () => {
  const result = normalizeWeights("50,25-30,20");
  assert.equal(
    result.reduce((sum, value) => sum + value, 0),
    100,
  );
  assert.equal(result.length, 3);
});

test("normalizeWeights rejects an unparsable entry", () => {
  assert.throws(() => normalizeWeights("25-30,not-a-number"), ScaffoldError);
});

test("normalizeWeights rejects an empty list", () => {
  assert.throws(() => normalizeWeights(""), ScaffoldError);
});

test("buildManifest output parses clean under manifestSchema", () => {
  const manifest = buildManifest(baseSpec());
  assert.doesNotThrow(() => manifestSchema.parse(manifest));
  assert.equal(manifest.status, "draft");
  assert.equal(manifest.updatedAt, "2026-09-09");
});

test("buildManifest defaults updatedAt to today's date when spec.today is omitted", () => {
  const spec = baseSpec();
  delete spec.today;
  const before = new Date().toISOString().slice(0, 10);
  const manifest = buildManifest(spec);
  const after = new Date().toISOString().slice(0, 10);
  assert.match(manifest.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(
    manifest.updatedAt === before || manifest.updatedAt === after,
    `expected ${manifest.updatedAt} to match ${before} or ${after}`,
  );
});

test("buildManifest always sets status to draft even if a spec tries otherwise", () => {
  const manifest = buildManifest(baseSpec({ status: "stable" }));
  assert.equal(manifest.status, "draft");
});

test("buildManifest round-trips a skill breakdown that totals its domain weight", () => {
  const spec = baseSpec({
    domains: [
      {
        slug: "concepts",
        name: "Describe Concepts",
        weight: 28,
        skills: [
          { slug: "cloud-computing", name: "Cloud Computing", weight: 16 },
          {
            slug: "economies-of-scale",
            name: "Economies of Scale",
            weight: 12,
          },
        ],
      },
      { slug: "identity", name: "Describe Identity", weight: 72, skills: [] },
    ],
  });

  const manifest = buildManifest(spec);
  const result = manifestSchema.safeParse(manifest);
  assert.ok(result.success);
  assert.deepEqual(
    manifest.domains[0].skills.map((skill) => skill.weight),
    [16, 12],
  );
});

test("buildManifest reports a duplicate domain slug and a bad weight total as one error", () => {
  const spec = baseSpec({
    domains: [
      { slug: "concepts", name: "Describe Concepts", weight: 28, skills: [] },
      { slug: "concepts", name: "Duplicate", weight: 30, skills: [] },
    ],
  });

  assert.throws(
    () => buildManifest(spec),
    (error) => {
      assert.ok(error instanceof ScaffoldError);
      assert.match(error.message, /duplicate domain slug "concepts"/);
      assert.match(error.message, /domain weights must total 100, received 58/);
      return true;
    },
  );
});

test("buildManifest rejects a skill breakdown that does not total its domain weight", () => {
  const spec = baseSpec({
    domains: [
      {
        slug: "concepts",
        name: "Describe Concepts",
        weight: 28,
        skills: [
          { slug: "cloud-computing", name: "Cloud Computing", weight: 10 },
        ],
      },
      { slug: "identity", name: "Describe Identity", weight: 72, skills: [] },
    ],
  });

  assert.throws(
    () => buildManifest(spec),
    /skill weights must total the domain weight 28, received 10/,
  );
});

test("parseSpec reads --normalize as its own sub-mode", () => {
  const spec = parseSpec(["--normalize", "25-30,35-40,30-35"]);
  assert.deepEqual(spec, { mode: "normalize", ranges: "25-30,35-40,30-35" });
});

test("parseSpec assembles domains, skills and flags from repeated arguments", () => {
  const spec = parseSpec([
    "--slug",
    "sc-900",
    "--name",
    "Security, Compliance, and Identity Fundamentals",
    "--exam-url",
    "https://example.com/sc-900",
    "--exam-questions",
    "60",
    "--exam-minutes",
    "45",
    "--domain",
    "concepts:Describe Concepts:28",
    "--domain",
    "identity:Describe Identity:72",
    "--skill",
    "concepts/cloud-computing:Cloud Computing:16",
    "--register",
    "--dry-run",
  ]);

  assert.equal(spec.mode, "scaffold");
  assert.equal(spec.slug, "sc-900");
  assert.equal(spec.examQuestionCount, 60);
  assert.equal(spec.examDurationMinutes, 45);
  assert.equal(spec.register, true);
  assert.equal(spec.dryRun, true);
  assert.equal(spec.domains.length, 2);
  assert.deepEqual(spec.domains[0].skills, [
    { slug: "cloud-computing", name: "Cloud Computing", weight: 16 },
  ]);
});

test("parseSpec rejects a --skill referencing an undeclared domain", () => {
  assert.throws(
    () =>
      parseSpec([
        "--slug",
        "sc-900",
        "--name",
        "Name",
        "--exam-url",
        "https://example.com",
        "--domain",
        "concepts:Describe Concepts:100",
        "--skill",
        "unknown/thing:Thing:10",
      ]),
    /--skill references unknown domain "unknown"/,
  );
});

test("parseSpec collects every missing required field into one error", () => {
  assert.throws(
    () => parseSpec([]),
    (error) => {
      assert.ok(error instanceof ScaffoldError);
      assert.match(error.message, /"--slug" is required/);
      assert.match(error.message, /"--name" is required/);
      assert.match(error.message, /"--exam-url" is required/);
      assert.match(error.message, /at least one --domain is required/);
      return true;
    },
  );
});

test("renderReviewProgress fills the template with the seeded shape", () => {
  const rendered = renderReviewProgress(baseSpec(), TEMPLATE);
  assert.match(rendered, /^# Microsoft Certified: Security Compliance/);
  assert.match(rendered, /## Bank status: `draft`/);
  assert.match(rendered, /## Blueprint normalization/);
  assert.match(rendered, /## Known coverage limits/);
  assert.match(rendered, /Describe Concepts: 28%, Describe Identity: 72%/);
  assert.match(rendered, /\| Describe Concepts \| 28% \| 0 \|/);
});

test("renderReviewProgress renders 1x and 2x target columns when examQuestionCount is specified", () => {
  const spec = baseSpec({ examQuestionCount: 50 });
  const rendered = renderReviewProgress(spec, TEMPLATE);
  assert.match(
    rendered,
    /\| Target \(1x: 50\) \| Target \(2x: 100\) \| Questions \|/,
  );
  assert.match(rendered, /\| Describe Concepts \| 28% \| 14 \| 28 \| 0 \|/);
  assert.match(rendered, /\| Describe Identity \| 72% \| 36 \| 72 \| 0 \|/);
});

test("planScaffold emits a manifest, one questions file per domain, and a review file", () => {
  const plan = planScaffold("/repo", baseSpec());
  const paths = plan.map((entry) => entry.path);

  assert.ok(paths.includes(join("/repo", "certs", "sc-900", "manifest.json")));
  assert.ok(
    paths.includes(
      join("/repo", "certs", "sc-900", "questions", "concepts.json"),
    ),
  );
  assert.ok(
    paths.includes(
      join("/repo", "certs", "sc-900", "questions", "identity.json"),
    ),
  );
  assert.ok(
    paths.includes(join("/repo", "certs", "sc-900", "review-progress.md")),
  );
  assert.equal(plan.length, 4);

  for (const entry of plan) {
    if (
      basename(entry.path).endsWith(".json") &&
      basename(entry.path) !== "manifest.json"
    ) {
      assert.equal(entry.contents, "[]\n");
    }
  }
});

test("planScaffold's manifest.json content is always status draft and parses clean", () => {
  const plan = planScaffold("/repo", baseSpec());
  const manifestEntry = plan.find(
    (entry) => basename(entry.path) === "manifest.json",
  );
  const manifest = JSON.parse(manifestEntry.contents);

  assert.equal(manifest.status, "draft");
  assert.doesNotThrow(() => manifestSchema.parse(manifest));
});

test("planScaffold never emits a path outside certs/<slug>/, even for a hostile slug", () => {
  // The slug schema itself already forbids "/" and "..", so a hostile,
  // hand-typed slug is rejected as a spec error long before any path would
  // be constructed -- this is the defense that actually fires.
  const spec = baseSpec({ slug: "../../etc" });
  assert.throws(() => planScaffold("/repo", spec), ScaffoldError);
});

test("planScaffold requires spec.template since it does no I/O of its own", () => {
  const spec = baseSpec({ template: undefined });
  assert.throws(() => planScaffold("/repo", spec), /requires spec.template/);
});

test("planScaffold with --register appends the updated catalog.json to the plan", () => {
  const spec = baseSpec({
    register: true,
    catalog: { schemaVersion: 1, certs: ["ccdv-f", "az-900", "aws-clf-c02"] },
  });
  const plan = planScaffold("/repo", spec);
  const catalogEntry = plan.find(
    (entry) => basename(entry.path) === "catalog.json",
  );

  assert.ok(catalogEntry);
  const catalog = JSON.parse(catalogEntry.contents);
  assert.deepEqual(catalog.certs, [
    "ccdv-f",
    "az-900",
    "aws-clf-c02",
    "sc-900",
  ]);
  assert.doesNotThrow(() => catalogSchema.parse(catalog));
});

test("planScaffold without --register does not touch catalog.json", () => {
  const plan = planScaffold("/repo", baseSpec());
  assert.ok(!plan.some((entry) => basename(entry.path) === "catalog.json"));
});

test("buildCatalog inserts a slug exactly once", () => {
  const catalog = buildCatalog(
    { schemaVersion: 1, certs: ["ccdv-f"] },
    "az-900",
  );
  assert.deepEqual(catalog.certs, ["ccdv-f", "az-900"]);
  assert.doesNotThrow(() => catalogSchema.parse(catalog));
});

test("buildCatalog is idempotent when the slug is already registered", () => {
  const catalog = buildCatalog(
    { schemaVersion: 1, certs: ["ccdv-f", "az-900"] },
    "az-900",
  );
  assert.deepEqual(catalog.certs, ["ccdv-f", "az-900"]);
});

// applyScaffold touches the filesystem, so this is the one case exercised
// against a real (temporary) directory rather than the pure plan.
test("applyScaffold refuses to overwrite an existing cert folder and writes nothing", async () => {
  const root = await mkdtemp(join(tmpdir(), "scaffold-cert-test-"));
  try {
    const spec = baseSpec();
    const plan = planScaffold(root, spec);

    const firstRun = await applyScaffold(plan);
    assert.equal(firstRun.length, plan.length);

    await assert.rejects(applyScaffold(plan), (error) => {
      assert.ok(error instanceof ScaffoldError);
      assert.match(error.message, /already exists/);
      return true;
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("refusing to overwrite leaves the catalog outside the cert folder untouched", async () => {
  const root = await mkdtemp(join(tmpdir(), "scaffold-cert-test-"));
  try {
    const spec = baseSpec({
      register: true,
      catalog: { schemaVersion: 1, certs: ["ccdv-f"] },
    });
    const plan = planScaffold(root, spec);

    const catalogEntry = plan.find(
      (entry) => basename(entry.path) === "catalog.json",
    );
    assert.ok(catalogEntry, "a --register plan must include catalog.json");

    // The cert folder already exists, so the whole plan must be refused.
    await mkdir(join(root, "certs", spec.slug), { recursive: true });

    await assert.rejects(applyScaffold(plan), /already exists/);

    // Nothing was written, including the file that sits outside the conflict.
    await assert.rejects(
      stat(catalogEntry.path),
      /ENOENT/,
      "catalog.json was written despite the refusal",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("applyScaffold writes every planned file when the cert folder is new", async () => {
  const root = await mkdtemp(join(tmpdir(), "scaffold-cert-test-"));
  try {
    const plan = planScaffold(root, baseSpec());
    const written = await applyScaffold(plan);

    assert.equal(written.length, plan.length);
    for (const entry of plan) {
      assert.equal(await readFile(entry.path, "utf8"), entry.contents);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("accepts published weights written with percent signs", () => {
  // Guides publish "25-30%". A loose parseFloat read that as the low bound 25
  // and computed a midpoint that was silently wrong.
  assert.deepEqual(normalizeWeights("25-30%,35-40%,30-35%"), [28, 39, 33]);
  // Asymmetric ranges are where using the low bound actually diverges.
  assert.deepEqual(normalizeWeights("20-40%,30-35%"), [48, 52]);
});

test("accepts an array of numbers as well as a comma-separated string", () => {
  assert.deepEqual(normalizeWeights([24, 30, 34, 12]), [24, 30, 34, 12]);
});

test("rejects tokens that are not a weight or a range", () => {
  assert.throws(() => normalizeWeights("25abc,75"), /cannot parse "25abc"/);
  assert.throws(() => normalizeWeights("-10,20"), /cannot parse "-10"/);
  assert.throws(() => normalizeWeights("40-20,60"), /runs backwards/);
});

test("rejects a domain or skill weight with trailing junk", () => {
  // parseFloat read "28abc" as 28, turning a typo into a wrong blueprint.
  const args = [
    "--slug",
    "sc-900",
    "--name",
    "N",
    "--exam-url",
    "https://example.test/guide",
  ];
  assert.throws(
    () => parseSpec([...args, "--domain", "a:A:28abc"]),
    /non-numeric weight/,
  );
  assert.throws(
    () => parseSpec([...args, "--domain", "a:A:-5"]),
    /non-numeric weight/,
  );
  // A percent sign is what an author actually pastes from a guide.
  assert.equal(
    parseSpec([...args, "--domain", "a:A:100%"]).domains[0].weight,
    100,
  );
});

test("escapes a pipe in a domain name so the seeded table survives", () => {
  const spec = baseSpec({
    domains: [
      { slug: "concepts", name: "Identity | Access", weight: 100, skills: [] },
    ],
  });

  const rendered = renderReviewProgress(spec, TEMPLATE);

  assert.match(rendered, /\| Identity \\\| Access \|/);
});

test("--normalize takes an optional target for allocating a question count", () => {
  assert.deepEqual(parseSpec(["--normalize", "24,30,34,12"]).target, undefined);
  assert.equal(
    parseSpec(["--normalize", "24,30,34,12", "--target", "18"]).target,
    18,
  );
  assert.throws(
    () => parseSpec(["--normalize", "24,30,34,12", "--target", "0"]),
    /--target must be a positive integer/,
  );
});
