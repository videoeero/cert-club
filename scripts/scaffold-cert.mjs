import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  SCHEMA_VERSION,
  catalogSchema,
  manifestSchema,
} from "../schemas/question-bank.mjs";
import { parsePositiveInteger } from "./lib/cli.mjs";
import { AggregateMessageError } from "./lib/errors.mjs";
import { readJson } from "./lib/read-certs.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_CONTENT_LICENSE = "CC-BY-SA-4.0";

/**
 * One error type for every failure this script can produce, so a bad spec, an
 * invalid generated manifest and a duplicate catalog entry are all reported
 * the same way: every problem at once, not one fix-and-rerun cycle per issue.
 */
export class ScaffoldError extends AggregateMessageError {
  constructor(messages = []) {
    super("Scaffold failed:", messages);
    this.name = "ScaffoldError";
  }
}

/**
 * Two existing banks (az-900, aws-clf-c02) document this arithmetic done by
 * hand in their review files: take the midpoint of each published range,
 * scale the midpoints so they sum to exactly 100 (ranges rarely add up to 100
 * on their own), floor every scaled value, then hand out the few points lost
 * to flooring to the entries with the largest fractional remainder. Bare
 * integers are accepted as one-sided "ranges" with a single value.
 *
 * `target` is what the result must sum to. It is 100 for blueprint weights,
 * but the same arithmetic allocates a question count across those weights —
 * aws-clf-c02's review file records distributing 18 questions this way — so
 * the target is a parameter rather than a constant.
 */
export function normalizeWeights(input, target = 100) {
  const tokens = (Array.isArray(input) ? input : String(input).split(","))
    .map((token) => String(token).trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    throw new ScaffoldError([
      "--normalize requires at least one weight or range",
    ]);
  }

  // Guides publish weights as "25-30%", so the percent sign is accepted on
  // either bound. Both patterns are anchored and the bare one is validated
  // before parsing: Number.parseFloat would otherwise read "25-30%" as 25 and
  // "25abc" as 25, miscalculating the midpoint with no error at all.
  const RANGE = /^(\d+(?:\.\d+)?)\s*%?\s*-\s*(\d+(?:\.\d+)?)\s*%?$/;
  const BARE = /^(\d+(?:\.\d+)?)\s*%?$/;

  const midpoints = tokens.map((token) => {
    const rangeMatch = token.match(RANGE);
    if (rangeMatch) {
      const low = Number.parseFloat(rangeMatch[1]);
      const high = Number.parseFloat(rangeMatch[2]);
      if (high < low) {
        throw new ScaffoldError([
          `range "${token}" runs backwards — expected "low-high"`,
        ]);
      }
      return (low + high) / 2;
    }

    const bareMatch = token.match(BARE);
    if (bareMatch === null) {
      throw new ScaffoldError([
        `cannot parse "${token}" as a weight or a "low-high" range`,
      ]);
    }
    return Number.parseFloat(bareMatch[1]);
  });

  const sum = midpoints.reduce((total, value) => total + value, 0);
  if (sum <= 0) {
    throw new ScaffoldError(["weights must sum to a positive number"]);
  }

  if (!Number.isInteger(target) || target < 1) {
    throw new ScaffoldError(["target must be a positive integer"]);
  }

  const scaled = midpoints.map((value) => (value / sum) * target);
  const floored = scaled.map((value) => Math.floor(value));
  const flooredSum = floored.reduce((total, value) => total + value, 0);
  const remainder = Math.round(target - flooredSum);

  const byRemainder = scaled
    .map((value, index) => ({ index, fraction: value - floored[index] }))
    .sort((left, right) => right.fraction - left.fraction);

  const result = [...floored];
  for (let i = 0; i < remainder; i++) {
    result[byRemainder[i].index] += 1;
  }

  return result;
}

function renderTemplate(template, values) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) => {
    if (!(key in values)) {
      throw new ScaffoldError([
        `template placeholder "${key}" has no supplied value`,
      ]);
    }
    return values[key];
  });
}

function formatIssues(label, issues) {
  return issues.map((issue) => {
    const location = issue.path.length > 0 ? `.${issue.path.join(".")}` : "";
    return `${label}${location}: ${issue.message}`;
  });
}

/**
 * Number.parseFloat stops at the first non-numeric character, so "28abc" comes
 * back as 28 and a typo becomes a silently wrong blueprint. Anchor the pattern
 * instead, accepting the percent sign an author is likely to paste.
 */
function parseWeight(raw) {
  const match = String(raw)
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*%?$/);
  return match === null ? Number.NaN : Number.parseFloat(match[1]);
}

function parseDomainSpec(token, errors) {
  // "<slug>:<name>:<weight>" — split on the first and last colon rather than
  // a fixed count, so a domain name is free to contain its own colon.
  const firstColon = token.indexOf(":");
  const lastColon = token.lastIndexOf(":");
  if (firstColon === -1 || firstColon === lastColon) {
    errors.push(
      `--domain "${token}" must have the shape "<slug>:<name>:<weight>"`,
    );
    return undefined;
  }

  const slug = token.slice(0, firstColon);
  const name = token.slice(firstColon + 1, lastColon);
  const weight = parseWeight(token.slice(lastColon + 1));
  if (Number.isNaN(weight)) {
    errors.push(`--domain "${token}" has a non-numeric weight`);
    return undefined;
  }

  return { slug, name, weight, skills: [] };
}

function parseSkillSpec(token, errors) {
  // "<domain-slug>/<skill-slug>:<name>:<weight>"
  const firstColon = token.indexOf(":");
  const lastColon = token.lastIndexOf(":");
  if (firstColon === -1 || firstColon === lastColon) {
    errors.push(
      `--skill "${token}" must have the shape "<domain-slug>/<skill-slug>:<name>:<weight>"`,
    );
    return undefined;
  }

  const path = token.slice(0, firstColon);
  const name = token.slice(firstColon + 1, lastColon);
  const weight = parseWeight(token.slice(lastColon + 1));
  const slashIndex = path.indexOf("/");
  if (slashIndex === -1) {
    errors.push(
      `--skill "${token}" must prefix the skill slug with its domain slug and a "/"`,
    );
    return undefined;
  }
  if (Number.isNaN(weight)) {
    errors.push(`--skill "${token}" has a non-numeric weight`);
    return undefined;
  }

  return {
    domainSlug: path.slice(0, slashIndex),
    slug: path.slice(slashIndex + 1),
    name,
    weight,
  };
}

/**
 * Hand-rolled, space-separated argv parsing, matching the rest of the repo's
 * scripts and adding no dependency. `--normalize` is a disjoint sub-mode: it
 * takes one value and ignores everything else, because it is pure arithmetic
 * with no cert-authoring fields to also validate.
 */
export function parseSpec(argv) {
  const errors = [];

  if (argv.includes("--normalize")) {
    const index = argv.indexOf("--normalize");
    const ranges = argv[index + 1];
    if (ranges === undefined) {
      throw new ScaffoldError([
        '"--normalize" requires a value, e.g. "25-30,35-40,30-35"',
      ]);
    }
    // An optional target exposes the same arithmetic for allocating a question
    // count across weights, which is how aws-clf-c02's 4/6/6/2 was derived.
    const targetIndex = argv.indexOf("--target");
    if (targetIndex < 0) {
      return { mode: "normalize", ranges };
    }

    const target = parsePositiveInteger(argv[targetIndex + 1]);
    if (target === null) {
      throw new ScaffoldError(["--target must be a positive integer"]);
    }
    return { mode: "normalize", ranges, target };
  }

  const spec = {
    mode: "scaffold",
    domains: [],
    register: false,
    dryRun: false,
  };
  const pendingSkills = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--slug":
        spec.slug = argv[++i];
        break;
      case "--name":
        spec.name = argv[++i];
        break;
      case "--exam-url":
        spec.examUrl = argv[++i];
        break;
      case "--exam-questions": {
        const value = parsePositiveInteger(argv[++i]);
        if (value === null) {
          errors.push('"--exam-questions" requires a positive integer value');
        } else {
          spec.examQuestionCount = value;
        }
        break;
      }
      case "--exam-minutes": {
        const value = parsePositiveInteger(argv[++i]);
        if (value === null) {
          errors.push('"--exam-minutes" requires a positive integer value');
        } else {
          spec.examDurationMinutes = value;
        }
        break;
      }
      case "--domain": {
        const domain = parseDomainSpec(argv[++i] ?? "", errors);
        if (domain) {
          spec.domains.push(domain);
        }
        break;
      }
      case "--skill": {
        const skill = parseSkillSpec(argv[++i] ?? "", errors);
        if (skill) {
          pendingSkills.push(skill);
        }
        break;
      }
      case "--register":
        spec.register = true;
        break;
      case "--dry-run":
        spec.dryRun = true;
        break;
      default:
        errors.push(`unrecognized argument "${arg}"`);
    }
  }

  const domainsBySlug = new Map(
    spec.domains.map((domain) => [domain.slug, domain]),
  );
  for (const skill of pendingSkills) {
    const domain = domainsBySlug.get(skill.domainSlug);
    if (!domain) {
      errors.push(`--skill references unknown domain "${skill.domainSlug}"`);
      continue;
    }
    domain.skills.push({
      slug: skill.slug,
      name: skill.name,
      weight: skill.weight,
    });
  }

  if (!spec.slug) {
    errors.push('"--slug" is required');
  }
  if (!spec.name) {
    errors.push('"--name" is required');
  }
  if (!spec.examUrl) {
    errors.push('"--exam-url" is required');
  }
  if (spec.domains.length === 0) {
    errors.push("at least one --domain is required");
  }

  if (errors.length > 0) {
    throw new ScaffoldError(errors);
  }

  return spec;
}

/**
 * Builds the manifest and validates it through the same schema the app and
 * the validator use — a scaffold that emits output its own validator rejects
 * is worse than no scaffold.
 */
export function buildManifest(spec) {
  const today = spec.today ?? new Date().toISOString().slice(0, 10);
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    cert: spec.slug,
    name: spec.name,
    status: "draft",
    updatedAt: today,
    examUrl: spec.examUrl,
    contentLicense: spec.contentLicense ?? DEFAULT_CONTENT_LICENSE,
    domains: spec.domains.map((domain) => ({
      slug: domain.slug,
      name: domain.name,
      weight: domain.weight,
      ...(domain.skills && domain.skills.length > 0
        ? {
            skills: domain.skills.map((skill) => ({
              slug: skill.slug,
              name: skill.name,
              weight: skill.weight,
            })),
          }
        : {}),
    })),
  };

  if (spec.examQuestionCount !== undefined) {
    manifest.examQuestionCount = spec.examQuestionCount;
  }
  if (spec.examDurationMinutes !== undefined) {
    manifest.examDurationMinutes = spec.examDurationMinutes;
  }

  const result = manifestSchema.safeParse(manifest);
  if (!result.success) {
    throw new ScaffoldError(formatIssues("manifest", result.error.issues));
  }
  return result.data;
}

/**
 * Idempotent insert: re-registering an already-listed slug is a no-op rather
 * than an error, so `--register` is safe to repeat.
 */
export function buildCatalog(catalog, slug) {
  const certs = catalog.certs.includes(slug)
    ? catalog.certs
    : [...catalog.certs, slug];
  const updated = { ...catalog, certs };

  const result = catalogSchema.safeParse(updated);
  if (!result.success) {
    throw new ScaffoldError(formatIssues("catalog", result.error.issues));
  }
  return result.data;
}

function escapeTableCell(value) {
  return String(value).replaceAll("|", "\\|");
}

export function renderReviewProgress(spec, template) {
  const today = spec.today ?? new Date().toISOString().slice(0, 10);
  const weightList = spec.domains
    .map((domain) => `${domain.name}: ${domain.weight}%`)
    .join(", ");
  // Rendered as one placeholder for the whole table (header included) rather
  // than substituting into a table skeleton in the template file: prettier
  // reflows markdown tables, and a placeholder sitting inside a table cell
  // gets wrapped onto one line, corrupting the multi-row substitution.
  const distributionTable = [
    "| Domain | Weight | Questions |",
    "| --- | ---: | ---: |",
    ...spec.domains.map(
      (domain) => `| ${escapeTableCell(domain.name)} | ${domain.weight}% | 0 |`,
    ),
  ].join("\n");

  return renderTemplate(template, {
    name: spec.name,
    today,
    weightList,
    distributionTable,
  });
}

/**
 * Pure planning: given a repository root and a spec, decide exactly which
 * files would be written and with what contents, with no filesystem access
 * at all. This is what lets the test suite verify scaffold output without
 * writing anything, mirroring `buildBalanceReport` vs `buildRepositoryReports`
 * in scripts/balance-report.mjs.
 *
 * Any I/O-derived input the plan needs — the review-progress template text,
 * and (for `--register`) the current catalog.json contents — is threaded in
 * on the spec by the caller, so this function itself never touches disk.
 */
export function planScaffold(root, spec) {
  const manifest = buildManifest(spec);

  const certsDir = resolve(root, "certs");
  const certDir = resolve(certsDir, manifest.cert);

  // Defense in depth: the slug schema already forbids "/" and "..", but a
  // hostile hand-typed slug gets one more check before any path is emitted.
  if (
    certDir !== join(certsDir, manifest.cert) ||
    !certDir.startsWith(certsDir + sep)
  ) {
    throw new ScaffoldError([
      `refusing to scaffold outside certs/: "${manifest.cert}"`,
    ]);
  }

  const plan = [
    {
      path: join(certDir, "manifest.json"),
      contents: `${JSON.stringify(manifest, null, 2)}\n`,
    },
  ];

  for (const domain of manifest.domains) {
    plan.push({
      path: join(certDir, "questions", `${domain.slug}.json`),
      contents: "[]\n",
    });
  }

  if (spec.template === undefined) {
    throw new ScaffoldError([
      "planScaffold requires spec.template (the scripts/templates/review-progress.md contents)",
    ]);
  }
  plan.push({
    path: join(certDir, "review-progress.md"),
    contents: renderReviewProgress(spec, spec.template),
  });

  if (spec.register) {
    if (spec.catalog === undefined) {
      throw new ScaffoldError([
        "planScaffold requires spec.catalog (the current certs/catalog.json contents) when --register is set",
      ]);
    }
    const catalog = buildCatalog(spec.catalog, manifest.cert);
    plan.push({
      path: join(certsDir, "catalog.json"),
      contents: `${JSON.stringify(catalog, null, 2)}\n`,
    });
  }

  return plan;
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Refuses to overwrite an existing cert folder: the manifest.json entry in
 * the plan names the folder, and if it already exists on disk this writes
 * nothing at all rather than partially clobbering it.
 */
export async function applyScaffold(plan) {
  const manifestEntry = plan.find(
    (entry) => basename(entry.path) === "manifest.json",
  );
  if (manifestEntry) {
    const certDir = dirname(manifestEntry.path);
    if (await pathExists(certDir)) {
      throw new ScaffoldError([
        `${certDir} already exists — refusing to overwrite`,
      ]);
    }
  }

  const written = [];
  for (const entry of plan) {
    await mkdir(dirname(entry.path), { recursive: true });
    await writeFile(entry.path, entry.contents, "utf8");
    written.push(entry.path);
  }
  return written;
}

async function main() {
  const argv = process.argv.slice(2);

  let spec;
  try {
    spec = parseSpec(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (spec.mode === "normalize") {
    try {
      console.log(normalizeWeights(spec.ranges, spec.target).join(" "));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
    return;
  }

  try {
    spec.template = await readFile(
      join(repositoryRoot, "scripts", "templates", "review-progress.md"),
      "utf8",
    );
    if (spec.register) {
      spec.catalog = await readJson(
        join(repositoryRoot, "certs", "catalog.json"),
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  let plan;
  try {
    plan = planScaffold(repositoryRoot, spec);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (spec.dryRun) {
    console.log("Planned files (dry run, nothing written):");
    for (const entry of plan) {
      console.log(`  ${relative(repositoryRoot, entry.path)}`);
    }
    const manifestEntry = plan.find(
      (entry) => basename(entry.path) === "manifest.json",
    );
    console.log(`\n${manifestEntry.contents}`);
    return;
  }

  let written;
  try {
    written = await applyScaffold(plan);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  // With --register the plan also rewrites the existing catalog.json, so the
  // list is not purely newly-created files.
  console.log(spec.register ? "Created / updated:" : "Created:");
  for (const path of written) {
    console.log(`  ${relative(repositoryRoot, path)}`);
  }
  console.log(
    `\nnpm run check will fail until every domain above has at least one real, sourced question — this is expected, not a bug.` +
      `\nNext: author-questions for "${spec.slug}", one domain at a time, then npm run check.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
