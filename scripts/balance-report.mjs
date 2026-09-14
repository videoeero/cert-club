import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parsePositiveInteger } from "./lib/cli.mjs";
import { AggregateMessageError } from "./lib/errors.mjs";
import { skillKey } from "./lib/skills.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";
import { normalizeWeights } from "./scaffold-cert.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class BalanceReportError extends AggregateMessageError {
  constructor(messages = []) {
    super("Balance check failed:", messages);
    this.name = "BalanceReportError";
  }
}

// A skill may sit this many questions away from its blueprint share before the
// bank is considered distorted. Absolute rather than proportional, because the
// smallest skills would otherwise never be allowed a second question.
export const BALANCE_TOLERANCE = 2;

// Even a 1%-weight skill needs more than a single question, or every session
// that reaches it asks the same one.
export const MINIMUM_SKILL_TARGET = 2;

export function buildBalanceReport(manifest, questions, options = {}) {
  let target = options.target;
  if (target === undefined) {
    if (options.useExamMultiplier && manifest.examQuestionCount) {
      target = manifest.examQuestionCount * 2;
    } else {
      target = questions.length;
    }
  }

  // Domain balance
  const domainCounts = new Map();
  for (const question of questions) {
    domainCounts.set(
      question.domain,
      (domainCounts.get(question.domain) ?? 0) + 1,
    );
  }
  const domainTargets =
    target > 0
      ? normalizeWeights(
          manifest.domains.map((d) => d.weight),
          target,
        )
      : manifest.domains.map(() => 0);
  const domains = manifest.domains.map((domain, index) => {
    const domainTarget = domainTargets[index];
    const actual = domainCounts.get(domain.slug) ?? 0;
    return {
      slug: domain.slug,
      name: domain.name,
      weight: domain.weight,
      target: domainTarget,
      actual,
      delta: actual - domainTarget,
    };
  });

  // domainSchema enforces skill-slug uniqueness only within a domain, so two
  // domains may both declare e.g. "overview". Keying on the subdomain alone
  // pooled their questions together and misreported both targets. No shipped
  // manifest collides yet, so this changes no current output.
  const counts = new Map();
  for (const question of questions) {
    if (question.subdomain === undefined) {
      continue;
    }
    const key = skillKey(question.domain, question.subdomain);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const skills = [];
  for (const domain of manifest.domains) {
    for (const skill of domain.skills ?? []) {
      const ideal = (skill.weight / 100) * target;
      const skillTarget = Math.max(MINIMUM_SKILL_TARGET, Math.round(ideal));
      const actual = counts.get(skillKey(domain.slug, skill.slug)) ?? 0;
      skills.push({
        domain: domain.slug,
        slug: skill.slug,
        name: skill.name,
        weight: skill.weight,
        target: skillTarget,
        actual,
        delta: actual - skillTarget,
      });
    }
  }

  skills.sort((left, right) => left.delta - right.delta);

  return {
    cert: manifest.cert,
    target,
    questionCount: questions.length,
    domains,
    skills,
    offBalance: skills.filter(
      (skill) => Math.abs(skill.delta) > BALANCE_TOLERANCE,
    ),
  };
}

function formatReport(report) {
  const lines = [];
  lines.push(
    `${report.cert}: ${report.questionCount} question(s), target ${report.target}`,
  );

  if (report.skills.length === 0) {
    if (report.domains && report.domains.length > 0) {
      lines.push("  domain balance (no skill breakdown declared in manifest):");
      const width = Math.max(
        ...report.domains.map((domain) => domain.slug.length),
      );
      for (const domain of report.domains) {
        const delta =
          domain.delta > 0 ? `+${domain.delta}` : String(domain.delta);
        lines.push(
          `  ${domain.slug.padEnd(width)}  ${String(domain.weight).padStart(5)}%  target ${String(domain.target).padStart(3)}  have ${String(domain.actual).padStart(3)}  ${delta.padStart(4)}`,
        );
      }
      const needed = report.domains
        .filter((domain) => domain.delta < 0)
        .reduce((sum, domain) => sum + -domain.delta, 0);
      const surplus = report.domains
        .filter((domain) => domain.delta > 0)
        .reduce((sum, domain) => sum + domain.delta, 0);
      lines.push(
        `  ${needed} question(s) short, ${surplus} surplus against target ${report.target}`,
      );
      return lines.join("\n");
    }
    lines.push(
      "  no skill breakdown declared in the manifest — nothing to check",
    );
    return lines.join("\n");
  }

  const width = Math.max(...report.skills.map((skill) => skill.slug.length));
  for (const skill of report.skills) {
    const flag = Math.abs(skill.delta) > BALANCE_TOLERANCE ? " <-- off" : "";
    const delta = skill.delta > 0 ? `+${skill.delta}` : String(skill.delta);
    lines.push(
      `  ${skill.slug.padEnd(width)}  ${String(skill.weight).padStart(5)}%  target ${String(skill.target).padStart(3)}  have ${String(skill.actual).padStart(3)}  ${delta.padStart(4)}${flag}`,
    );
  }

  const needed = report.skills
    .filter((skill) => skill.delta < 0)
    .reduce((sum, skill) => sum + -skill.delta, 0);
  const surplus = report.skills
    .filter((skill) => skill.delta > 0)
    .reduce((sum, skill) => sum + skill.delta, 0);
  lines.push(
    `  ${report.offBalance.length} skill(s) outside the +/-${BALANCE_TOLERANCE} tolerance; ${needed} question(s) short, ${surplus} surplus`,
  );

  return lines.join("\n");
}

export async function buildRepositoryReports(
  root = repositoryRoot,
  options = {},
) {
  const certsPath = join(root, "certs");
  const allFolders = await listCertFolders(certsPath);
  const requested = options.slugs ?? [];
  const missing = requested.filter((slug) => !allFolders.includes(slug));
  if (missing.length > 0) {
    throw new BalanceReportError(
      missing.map((slug) => `"${slug}" has no matching certs/ folder`),
    );
  }
  const folderNames = requested.length > 0 ? requested : allFolders;

  const reports = [];
  for (const folderName of folderNames) {
    const certPath = join(certsPath, folderName);
    const [manifest, questions] = await Promise.all([
      readJson(join(certPath, "manifest.json")),
      readCertQuestions(certPath),
    ]);
    reports.push(buildBalanceReport(manifest, questions, options));
  }
  return reports;
}

async function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const useExamMultiplier = argv.includes("--2x");
  const targetIndex = argv.indexOf("--target");
  const target =
    targetIndex >= 0 ? parsePositiveInteger(argv[targetIndex + 1]) : undefined;

  if (targetIndex >= 0 && target === null) {
    console.error("--target must be a positive integer");
    process.exitCode = 1;
    return;
  }

  const slugs = argv.filter(
    (arg, index) =>
      !arg.startsWith("--") && (targetIndex < 0 || index !== targetIndex + 1),
  );

  let reports;
  try {
    reports = await buildRepositoryReports(repositoryRoot, {
      target,
      useExamMultiplier,
      slugs,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }
  const withSkills = reports.filter((report) => report.skills.length > 0);
  const toPrint = strict
    ? withSkills
    : reports.filter(
        (report) =>
          report.skills.length > 0 ||
          slugs.length > 0 ||
          useExamMultiplier ||
          target !== undefined,
      );

  for (const report of toPrint) {
    console.log(formatReport(report));
  }

  const offBalance = withSkills.reduce(
    (total, report) => total + report.offBalance.length,
    0,
  );

  if (offBalance > 0 && strict) {
    console.error(
      `\nBalance check failed: ${offBalance} skill(s) outside the +/-${BALANCE_TOLERANCE} tolerance.`,
    );
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
