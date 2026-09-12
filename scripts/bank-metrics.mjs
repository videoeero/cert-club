import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { isCoreQuestion } from "./balance-report.mjs";
import { AggregateMessageError } from "./lib/errors.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";
import {
  ABSOLUTE_QUALIFIER_PATTERN,
  LENGTH_BIAS_MAX_LONGEST_SHARE,
  LENGTH_BIAS_MAX_MEAN_DELTA,
  LENGTH_BIAS_MIN_SAMPLE,
  POSITION_BIAS_MAX_SHARE,
  POSITION_BIAS_MIN_SAMPLE,
  SCOPE_MIN_CORE_SHARE,
  SCOPE_MIN_SAMPLE,
  optionLengths,
} from "../schemas/question-bank.mjs";
import { sourcePageUrl } from "./lib/source-url.mjs";
import { skillKey } from "./lib/skills.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class BankMetricsError extends AggregateMessageError {
  constructor(messages = []) {
    super("Bank metrics failed:", messages);
    this.name = "BankMetricsError";
  }
}

const DIFFICULTIES = ["easy", "medium", "hard"];
const TYPES = ["single", "multi"];

// Boundaries are inclusive on their upper edge, so a page checked exactly 30
// days ago lands in "0-30d" rather than spilling into the next bucket.
const AGE_BUCKET_EDGES = [30, 90, 180, 365, Infinity];

function share(count, total) {
  return total === 0 ? 0 : count / total;
}

// Deliberately not the schema's mean, which divides by zero on an empty set.
// A report has to tell "no data" apart from a number, so this returns null.
function mean(values) {
  return values.length === 0
    ? null
    : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function isSingleSelect(question) {
  return question.type === "single" && question.correct.length === 1;
}

function hasKeysAndDistractors(question) {
  const { keys, distractors } = optionLengths(question);
  return keys.length > 0 && distractors.length > 0;
}

// Mirrors the schema guard in questionBankSchema: the key must be strictly
// longer than every distractor (a tie for longest does not count as the key
// being the uniquely longest option). Contrast with scoreAlwaysLongestOption
// below, which splits ties evenly for simulation scoring.
function isLongestOptionKey(question) {
  const key = question.options.find(
    (option) => option.id === question.correct[0],
  );
  return question.options.every(
    (option) => option.id === key.id || option.text.length < key.text.length,
  );
}

function buildScopeSplit(questions) {
  const core = questions.filter(isCoreQuestion);
  const deep = questions.filter((question) => !isCoreQuestion(question));
  return {
    core: { count: core.length, share: share(core.length, questions.length) },
    deep: { count: deep.length, share: share(deep.length, questions.length) },
  };
}

function buildDomainBreakdown(manifest, core) {
  const counts = new Map();
  for (const question of core) {
    counts.set(question.domain, (counts.get(question.domain) ?? 0) + 1);
  }
  return manifest.domains.map((domain) => {
    const actual = counts.get(domain.slug) ?? 0;
    return {
      slug: domain.slug,
      name: domain.name,
      weight: domain.weight,
      actual,
      actualShare: share(actual, core.length),
    };
  });
}

// domainSchema enforces skill-slug uniqueness only within a domain, so two
// domains may legitimately both declare e.g. "overview". Keying counts on the
// subdomain alone would silently pool their questions together and misreport
// both. No shipped manifest collides yet, which is exactly why this is worth
// keying correctly now rather than after a bank does.

function buildSkillBreakdown(manifest, core) {
  const counts = new Map();
  for (const question of core) {
    if (question.subdomain === undefined) {
      continue;
    }
    const key = skillKey(question.domain, question.subdomain);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const skills = [];
  for (const domain of manifest.domains) {
    for (const skill of domain.skills ?? []) {
      const actual = counts.get(skillKey(domain.slug, skill.slug)) ?? 0;
      skills.push({
        domain: domain.slug,
        slug: skill.slug,
        name: skill.name,
        weight: skill.weight,
        actual,
        actualShare: share(actual, core.length),
      });
    }
  }
  return skills;
}

function buildFormatMix(questions) {
  const single = questions.filter((question) => question.type === "single");
  const multi = questions.filter((question) => question.type === "multi");

  const byAnswerCount = new Map();
  for (const question of multi) {
    byAnswerCount.set(
      question.correct.length,
      (byAnswerCount.get(question.correct.length) ?? 0) + 1,
    );
  }

  return {
    single: {
      count: single.length,
      share: share(single.length, questions.length),
    },
    multi: {
      count: multi.length,
      share: share(multi.length, questions.length),
      byAnswerCount: [...byAnswerCount.entries()]
        .sort((left, right) => left[0] - right[0])
        .map(([answerCount, count]) => ({ answerCount, count })),
    },
  };
}

function buildDifficultyFormatMatrix(questions) {
  const matrix = {};
  for (const difficulty of DIFFICULTIES) {
    matrix[difficulty] = {};
    for (const type of TYPES) {
      matrix[difficulty][type] = questions.filter(
        (question) =>
          question.difficulty === difficulty && question.type === type,
      ).length;
    }
  }
  return matrix;
}

function buildPositionDistribution(singles) {
  const counts = new Map();
  for (const question of singles) {
    const position = question.options.findIndex(
      (option) => option.id === question.correct[0],
    );
    if (position >= 0) {
      counts.set(position, (counts.get(position) ?? 0) + 1);
    }
  }

  const total = singles.length;
  // Every position an option could occupy gets a row, including ones no key
  // ever lands on. Listing only observed positions turns "position 2 never
  // holds the answer" — a real tell — into a shorter list nobody reads as a
  // finding.
  const positionCount = singles.reduce(
    (max, question) => Math.max(max, question.options.length),
    0,
  );
  const entries = Array.from({ length: positionCount }, (_unused, position) => {
    const count = counts.get(position) ?? 0;
    return { position, count, share: share(count, total) };
  });
  const maxCount = entries.reduce(
    (max, entry) => Math.max(max, entry.count),
    0,
  );

  return { entries, total, maxCount, maxShare: share(maxCount, total) };
}

function buildDistractorNotesCoverage(questions) {
  let totalDistractors = 0;
  let notedDistractors = 0;
  let questionsWithDistractors = 0;
  let fullyCoveredQuestions = 0;

  for (const question of questions) {
    const correctIds = new Set(question.correct);
    const distractors = question.options.filter(
      (option) => !correctIds.has(option.id),
    );
    if (distractors.length === 0) {
      continue;
    }

    questionsWithDistractors += 1;
    const notes = question.distractorNotes ?? {};
    const covered = distractors.filter(
      (option) => notes[option.id] !== undefined,
    ).length;

    totalDistractors += distractors.length;
    notedDistractors += covered;
    if (covered === distractors.length) {
      fullyCoveredQuestions += 1;
    }
  }

  return {
    optionShare: share(notedDistractors, totalDistractors),
    questionShare: share(fullyCoveredQuestions, questionsWithDistractors),
    questionsWithDistractors,
    fullyCoveredQuestions,
  };
}

function ageInDays(checkedAt, today) {
  const checked = new Date(`${checkedAt}T00:00:00.000Z`);
  const at = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.floor((at - checked.valueOf()) / 86_400_000);
}

function buildSourceAgeDistribution(questions, today) {
  const ages = questions.map((question) =>
    ageInDays(question.sourceCheckedAt, today),
  );

  const buckets = AGE_BUCKET_EDGES.map((max, index) => {
    const min = index === 0 ? 0 : AGE_BUCKET_EDGES[index - 1] + 1;
    const label = max === Infinity ? `>${min - 1}d` : `${min}-${max}d`;
    const count = ages.filter((age) => age >= min && age <= max).length;
    return { label, count };
  });

  return {
    buckets,
    oldestDays: ages.length > 0 ? Math.max(...ages) : null,
    newestDays: ages.length > 0 ? Math.min(...ages) : null,
    sampleSize: ages.length,
  };
}

function scoreAlwaysLongestOption(question) {
  const maxLength = Math.max(
    ...question.options.map((option) => option.text.length),
  );
  const longestOptions = question.options.filter(
    (option) => option.text.length === maxLength,
  );
  return longestOptions.some((option) => option.id === question.correct[0])
    ? 1 / longestOptions.length
    : 0;
}

function buildAlwaysLongestBaseline(singles) {
  if (singles.length === 0) {
    return { expectedScore: null, sampleSize: 0 };
  }
  return {
    expectedScore: mean(singles.map(scoreAlwaysLongestOption)),
    sampleSize: singles.length,
  };
}

function scoreEliminateAbsolutes(question) {
  const remaining = question.options.filter(
    (option) => !ABSOLUTE_QUALIFIER_PATTERN.test(option.text),
  );
  // When every option carries an absolute there is nothing left to eliminate
  // and the strategy is simply inapplicable, so it scores nothing. That is the
  // literal reading of the strategy as ccdv-f/review-progress.md states it,
  // and it is what reproduces that file's published 30% over the 109
  // single-selects — 7 of which have an absolute in every option. Treating the
  // dead end as "guess among the original four" instead yields 31.5%, which is
  // arguably the better model of a real test-taker but breaks comparability
  // with the recorded measurement this metric exists to continue.
  if (remaining.length === 0) {
    return { score: 0, uniquelyIdentifiesKey: false };
  }
  const uniquelyIdentifiesKey =
    remaining.length === 1 && remaining[0].id === question.correct[0];
  const score = remaining.some((option) => option.id === question.correct[0])
    ? 1 / remaining.length
    : 0;
  return { score, uniquelyIdentifiesKey };
}

function buildEliminateAbsolutesBaseline(singles) {
  if (singles.length === 0) {
    return { expectedScore: null, uniqueIdentifyCount: 0, sampleSize: 0 };
  }
  const results = singles.map(scoreEliminateAbsolutes);
  return {
    expectedScore: mean(results.map((result) => result.score)),
    uniqueIdentifyCount: results.filter(
      (result) => result.uniquelyIdentifiesKey,
    ).length,
    sampleSize: singles.length,
  };
}

function guardStatus(sampleSize, minSample, isFailing) {
  if (sampleSize < minSample) {
    return "advisory (below sample minimum)";
  }
  return isFailing ? "FAIL" : "PASS";
}

function buildGuards({
  singles,
  positionDistribution,
  scoredQuestions,
  meanDelta,
  scoredSingles,
  longestIsKeyShare,
  questionCount,
  scopeCoreShare,
}) {
  return {
    positionBias: {
      sampleSize: singles.length,
      minSample: POSITION_BIAS_MIN_SAMPLE,
      status: guardStatus(
        singles.length,
        POSITION_BIAS_MIN_SAMPLE,
        positionDistribution.maxShare > POSITION_BIAS_MAX_SHARE,
      ),
    },
    lengthBiasMeanDelta: {
      sampleSize: scoredQuestions.length,
      minSample: LENGTH_BIAS_MIN_SAMPLE,
      status: guardStatus(
        scoredQuestions.length,
        LENGTH_BIAS_MIN_SAMPLE,
        meanDelta !== null && Math.abs(meanDelta) > LENGTH_BIAS_MAX_MEAN_DELTA,
      ),
    },
    longestOptionIsKey: {
      sampleSize: scoredSingles.length,
      minSample: LENGTH_BIAS_MIN_SAMPLE,
      status: guardStatus(
        scoredSingles.length,
        LENGTH_BIAS_MIN_SAMPLE,
        longestIsKeyShare > LENGTH_BIAS_MAX_LONGEST_SHARE,
      ),
    },
    scopeCoreShare: {
      sampleSize: questionCount,
      minSample: SCOPE_MIN_SAMPLE,
      status: guardStatus(
        questionCount,
        SCOPE_MIN_SAMPLE,
        scopeCoreShare < SCOPE_MIN_CORE_SHARE,
      ),
    },
  };
}

/**
 * Pure: every statistic the certs/*.review-progress.md files hand-compute,
 * derived straight from the JSON. Computed regardless of the guard sample
 * thresholds — the whole point is that ccdv-f can be measured live while
 * az-900 and aws-clf-c02 sit below the guards' 20-question floor and would
 * otherwise be measured by eyeball.
 */
export function buildBankMetrics(manifest, questions, options = {}) {
  const today = options.today ?? new Date();

  const scope = buildScopeSplit(questions);
  const core = questions.filter(isCoreQuestion);
  const domains = buildDomainBreakdown(manifest, core);
  const skills = buildSkillBreakdown(manifest, core);

  const formatMix = buildFormatMix(questions);
  const difficultyFormatMatrix = buildDifficultyFormatMatrix(questions);
  // A "page" is the URL without its fragment: two sourceUrls that differ only
  // by #anchor cite the same document, which ccdv-f/review-progress.md's
  // hand count (65) treats as one page, not two.
  const distinctSourcePages = new Set(
    questions.map((question) => sourcePageUrl(question.sourceUrl)),
  ).size;

  const singles = questions.filter(isSingleSelect);
  const positionDistribution = buildPositionDistribution(singles);

  const scoredQuestions = questions.filter(hasKeysAndDistractors);
  const lengthDeltas = scoredQuestions.map((question) => {
    const { keys, distractors } = optionLengths(question);
    return mean(keys) - mean(distractors);
  });

  // Every single-select question has exactly one key and at least one
  // distractor, so hasKeysAndDistractors never excludes one: scoredSingles is
  // just singles, filtered defensively rather than assumed.
  const scoredSingles = scoredQuestions.filter(isSingleSelect);
  const longestIsKeyCount = scoredSingles.filter(isLongestOptionKey).length;
  const longestIsKeyShare = share(longestIsKeyCount, scoredSingles.length);

  const distractorNotesCoverage = buildDistractorNotesCoverage(questions);
  const sourceAge = buildSourceAgeDistribution(questions, today);

  const baselines = {
    alwaysLongestOption: buildAlwaysLongestBaseline(singles),
    eliminateAbsoluteQualifiers: buildEliminateAbsolutesBaseline(singles),
  };

  const guards = buildGuards({
    singles,
    positionDistribution,
    scoredQuestions,
    meanDelta: mean(lengthDeltas),
    scoredSingles,
    longestIsKeyShare,
    questionCount: questions.length,
    scopeCoreShare: scope.core.share,
  });

  return {
    cert: manifest.cert,
    questionCount: questions.length,
    scope,
    domains,
    skills,
    formatMix,
    difficultyFormatMatrix,
    distinctSourcePages,
    positionDistribution,
    lengthBias: {
      meanDelta: mean(lengthDeltas),
      medianDelta: median(lengthDeltas),
      sampleSize: scoredQuestions.length,
    },
    longestOptionIsKey: {
      count: longestIsKeyCount,
      share: longestIsKeyShare,
      sampleSize: scoredSingles.length,
    },
    distractorNotesCoverage,
    sourceAge,
    baselines,
    guards,
  };
}

export async function buildRepositoryMetrics(
  root = repositoryRoot,
  options = {},
) {
  const certsPath = join(root, "certs");
  const allFolders = await listCertFolders(certsPath);

  const requested = options.slugs ?? [];
  const missing = requested.filter((slug) => !allFolders.includes(slug));
  if (missing.length > 0) {
    throw new BankMetricsError(
      missing.map((slug) => `"${slug}" has no matching certs/ folder`),
    );
  }

  const folders = requested.length > 0 ? requested : allFolders;

  const reports = [];
  for (const folder of folders) {
    const certPath = join(certsPath, folder);
    const [manifest, questions] = await Promise.all([
      readJson(join(certPath, "manifest.json")),
      readCertQuestions(certPath),
    ]);
    reports.push(
      buildBankMetrics(manifest, questions, { today: options.today }),
    );
  }
  return reports;
}

function pct(value) {
  return value === null ? "n/a" : `${Math.round(value * 1000) / 10}%`;
}

function fmt(value) {
  return value === null ? "n/a" : value.toFixed(2);
}

function formatText(report) {
  const lines = [];
  lines.push(
    `${report.cert}: ${report.questionCount} question(s) — core ${report.scope.core.count} (${pct(report.scope.core.share)}), deep ${report.scope.deep.count} (${pct(report.scope.deep.share)})`,
  );

  for (const domain of report.domains) {
    lines.push(
      `  domain ${domain.slug.padEnd(40)} core ${String(domain.actual).padStart(3)}  ${pct(domain.actualShare).padStart(6)}  weight ${domain.weight}%`,
    );
  }
  for (const skill of report.skills) {
    lines.push(
      `    skill ${skill.slug.padEnd(38)} core ${String(skill.actual).padStart(3)}  ${pct(skill.actualShare).padStart(6)}  weight ${skill.weight}%`,
    );
  }

  lines.push(
    `  format: ${report.formatMix.single.count} single, ${report.formatMix.multi.count} multi (${report.formatMix.multi.byAnswerCount.map((b) => `select-${b.answerCount}: ${b.count}`).join(", ") || "none"})`,
  );
  lines.push(`  distinct source pages: ${report.distinctSourcePages}`);
  lines.push(
    report.positionDistribution.total === 0
      ? `  single-select positions: none (no single-select questions)`
      : `  single-select positions: ${report.positionDistribution.entries.map((e) => e.count).join("/")} (n=${report.positionDistribution.total})`,
  );
  lines.push(
    `  option length delta: mean ${fmt(report.lengthBias.meanDelta)}, median ${fmt(report.lengthBias.medianDelta)} chars (n=${report.lengthBias.sampleSize})`,
  );
  lines.push(
    `  longest option is key: ${report.longestOptionIsKey.count}/${report.longestOptionIsKey.sampleSize} (${pct(report.longestOptionIsKey.share)})`,
  );
  lines.push(
    `  distractorNotes coverage: ${pct(report.distractorNotesCoverage.optionShare)} of options, ${report.distractorNotesCoverage.fullyCoveredQuestions}/${report.distractorNotesCoverage.questionsWithDistractors} questions fully noted`,
  );
  lines.push(
    `  source age buckets: ${report.sourceAge.buckets.map((b) => `${b.label}=${b.count}`).join(", ")}`,
  );
  lines.push(
    `  difficulty x format: ${Object.entries(report.difficultyFormatMatrix)
      .map(
        ([difficulty, byType]) =>
          `${difficulty} ${Object.entries(byType)
            .map(([type, count]) => `${type}=${count}`)
            .join("/")}`,
      )
      .join(", ")}`,
  );
  lines.push(
    `  baseline "always longest": ${pct(report.baselines.alwaysLongestOption.expectedScore)} expected (n=${report.baselines.alwaysLongestOption.sampleSize})`,
  );
  lines.push(
    `  baseline "eliminate absolutes then guess": ${pct(report.baselines.eliminateAbsoluteQualifiers.expectedScore)} expected, uniquely solves ${report.baselines.eliminateAbsoluteQualifiers.uniqueIdentifyCount}/${report.baselines.eliminateAbsoluteQualifiers.sampleSize}`,
  );

  for (const [name, guard] of Object.entries(report.guards)) {
    lines.push(
      `  guard ${name.padEnd(20)} ${guard.status.padEnd(28)} (n=${guard.sampleSize}, min=${guard.minSample})`,
    );
  }

  return lines.join("\n");
}

function formatMarkdown(report) {
  const lines = [];
  lines.push(`## ${report.cert}`);
  lines.push("");
  lines.push(`${report.questionCount} questions.`);
  lines.push("");
  lines.push("| Scope | Questions | Share |");
  lines.push("| ------ | --------: | ----: |");
  lines.push(
    `| \`core\` | ${report.scope.core.count} | ${pct(report.scope.core.share)} |`,
  );
  lines.push(
    `| \`deep\` | ${report.scope.deep.count} | ${pct(report.scope.deep.share)} |`,
  );
  lines.push("");

  if (report.domains.length > 0) {
    lines.push("| Domain | Core | Share | Weight |");
    lines.push("| --- | ---: | ---: | ---: |");
    for (const domain of report.domains) {
      lines.push(
        `| ${domain.name} | ${domain.actual} | ${pct(domain.actualShare)} | ${domain.weight}% |`,
      );
    }
    lines.push("");
  }

  if (report.skills.length > 0) {
    lines.push("| Skill | Core | Share | Weight |");
    lines.push("| --- | ---: | ---: | ---: |");
    for (const skill of report.skills) {
      lines.push(
        `| ${skill.name} | ${skill.actual} | ${pct(skill.actualShare)} | ${skill.weight}% |`,
      );
    }
    lines.push("");
  }

  lines.push("### Pattern review");
  lines.push("");
  lines.push(
    `- Format mix: ${report.formatMix.single.count} single-select, ${report.formatMix.multi.count} multi-select (${report.formatMix.multi.byAnswerCount.map((b) => `${b.count} select-${b.answerCount}`).join(", ") || "none"}).`,
  );
  lines.push(`- ${report.distinctSourcePages} distinct source page(s).`);
  lines.push(
    report.positionDistribution.total === 0
      ? `- Single-select answer positions: none — this bank has no single-select questions.`
      : `- Single-select answer positions: ${report.positionDistribution.entries.map((e) => e.count).join(" / ")} across ${report.positionDistribution.entries.length} position(s), ${report.positionDistribution.total} question(s).`,
  );
  lines.push(
    `- Mean correct-option length minus distractor length: ${fmt(report.lengthBias.meanDelta)} characters (median ${fmt(report.lengthBias.medianDelta)}), n=${report.lengthBias.sampleSize}.`,
  );
  lines.push(
    `- Correct answer is the longest option in ${report.longestOptionIsKey.count} of ${report.longestOptionIsKey.sampleSize} single-select questions (${pct(report.longestOptionIsKey.share)}).`,
  );
  lines.push(
    `- \`distractorNotes\` coverage: ${pct(report.distractorNotesCoverage.optionShare)} of distractor options; ${report.distractorNotesCoverage.fullyCoveredQuestions} of ${report.distractorNotesCoverage.questionsWithDistractors} questions fully noted.`,
  );
  lines.push(
    `- "Always pick the longest option" baseline: ${pct(report.baselines.alwaysLongestOption.expectedScore)} expected score (n=${report.baselines.alwaysLongestOption.sampleSize}).`,
  );
  lines.push(
    `- "Eliminate absolute qualifiers, then guess" baseline: ${pct(report.baselines.eliminateAbsoluteQualifiers.expectedScore)} expected score, uniquely identifies the key in ${report.baselines.eliminateAbsoluteQualifiers.uniqueIdentifyCount} of ${report.baselines.eliminateAbsoluteQualifiers.sampleSize}.`,
  );
  lines.push("");

  lines.push("### Guards");
  lines.push("");
  lines.push("| Guard | Status | Sample | Minimum |");
  lines.push("| --- | --- | ---: | ---: |");
  for (const [name, guard] of Object.entries(report.guards)) {
    lines.push(
      `| ${name} | ${guard.status} | ${guard.sampleSize} | ${guard.minSample} |`,
    );
  }

  return lines.join("\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const KNOWN_FLAGS = new Set(["--json", "--markdown"]);
  const unknown = argv.filter(
    (arg) => arg.startsWith("--") && !KNOWN_FLAGS.has(arg),
  );
  if (unknown.length > 0) {
    console.error(`Unknown flag(s): ${unknown.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const json = argv.includes("--json");
  const markdown = argv.includes("--markdown");
  const slugs = argv.filter((arg) => !arg.startsWith("--"));

  let reports;
  try {
    reports = await buildRepositoryMetrics(repositoryRoot, {
      slugs,
      today: new Date(),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (json) {
    console.log(JSON.stringify(reports, null, 2));
  } else if (markdown) {
    console.log(reports.map(formatMarkdown).join("\n\n"));
  } else {
    console.log(reports.map(formatText).join("\n\n"));
  }

  // Always 0: this is a report, not a gate. Sub-threshold guard advisories and
  // even guard FAILs are informational here — npm run check is where a real
  // gate lives, and the two 18-question banks exist to prove the schema
  // generalises below the guard thresholds, not to be blocked by them.
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
