import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// A skill may sit this many questions away from its blueprint share before the
// bank is considered distorted. Absolute rather than proportional, because the
// smallest skills would otherwise never be allowed a second question.
export const BALANCE_TOLERANCE = 2;

// Even a 1%-weight skill needs more than a single question, or every session
// that reaches it asks the same one.
export const MINIMUM_SKILL_TARGET = 2;

/**
 * Core questions are the ones a blueprint-aligned session draws from. Questions
 * tagged "deep" or "out-of-scope" are opt-in extras and are excluded from the
 * balance arithmetic entirely.
 */
export function isCoreQuestion(question) {
  return (question.scope ?? "core") === "core";
}

export function buildBalanceReport(manifest, questions, options = {}) {
  const core = questions.filter(isCoreQuestion);
  const target = options.target ?? core.length;

  const counts = new Map();
  for (const question of core) {
    if (question.subdomain === undefined) {
      continue;
    }
    counts.set(question.subdomain, (counts.get(question.subdomain) ?? 0) + 1);
  }

  const skills = [];
  for (const domain of manifest.domains) {
    for (const skill of domain.skills ?? []) {
      const ideal = (skill.weight / 100) * target;
      const skillTarget = Math.max(MINIMUM_SKILL_TARGET, Math.round(ideal));
      const actual = counts.get(skill.slug) ?? 0;
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
    coreCount: core.length,
    taggedCount: questions.length - core.length,
    skills,
    offBalance: skills.filter(
      (skill) => Math.abs(skill.delta) > BALANCE_TOLERANCE,
    ),
  };
}

function formatReport(report) {
  const lines = [];
  lines.push(
    `${report.cert}: ${report.coreCount} core question(s), ${report.taggedCount} tagged out, target ${report.target}`,
  );

  if (report.skills.length === 0) {
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

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function buildRepositoryReports(root = repositoryRoot, options) {
  const certsPath = join(root, "certs");
  const entries = await readdir(certsPath, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  const reports = [];
  for (const folder of folders) {
    const certPath = join(certsPath, folder.name);
    const [manifest, questions] = await Promise.all([
      readJson(join(certPath, "manifest.json")),
      readJson(join(certPath, "questions.json")),
    ]);
    reports.push(buildBalanceReport(manifest, questions, options));
  }
  return reports;
}

async function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const targetIndex = argv.indexOf("--target");
  const target =
    targetIndex >= 0 ? Number.parseInt(argv[targetIndex + 1], 10) : undefined;

  if (target !== undefined && (!Number.isInteger(target) || target < 1)) {
    console.error("--target must be a positive integer");
    process.exitCode = 1;
    return;
  }

  const reports = await buildRepositoryReports(repositoryRoot, { target });
  const withSkills = reports.filter((report) => report.skills.length > 0);

  for (const report of withSkills) {
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
