import type {
  AnswerMap,
  AttemptRecord,
  Domain,
  DomainBreakdown,
  Question,
  QuestionResult,
  QuizConfig,
  QuizResults,
  QuizSelectionConfig,
  RetakeMode,
  RetakeReviewContext,
  ReviewScope,
  ScopeFilter,
  SimulationPreset,
} from "../types";

type RandomSource = () => number;

export class QuizSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizSelectionError";
  }
}

export function answerCountLabel(count: number): string {
  const labels = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE"];
  return labels[count] ?? String(count);
}

function randomValue(random: RandomSource): number {
  const value = random();
  if (!Number.isFinite(value)) {
    throw new QuizSelectionError(
      "The question selection random source is invalid.",
    );
  }
  return Math.min(Math.max(value, 0), 1 - Number.EPSILON);
}

function selectionCount(count: number | undefined, available: number): number {
  if (count === undefined) {
    return available;
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new QuizSelectionError("Question count must be a positive integer.");
  }
  return Math.min(count, available);
}

function randomSample(
  questions: readonly Question[],
  count: number,
  random: RandomSource,
): Question[] {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomValue(random) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled.slice(0, count);
}

export const DEFAULT_SCOPE_FILTER: ScopeFilter = "core-only";

/** Restricts the pool to the slice of the bank the user opted into. */
export function filterQuestionsByScope(
  questions: readonly Question[],
  scopeFilter: ScopeFilter = DEFAULT_SCOPE_FILTER,
): Question[] {
  if (scopeFilter === "with-deep") {
    return [...questions];
  }
  return questions.filter((question) => question.scope === "core");
}

/**
 * Splits `count` units across `weights` so the allocation sums to exactly
 * `count` while each item's expected share equals its weight's proportion.
 * Uses Madow systematic sampling to resolve the fractional remainder: this is
 * the same rounding problem largest-remainder solves, but largest-remainder
 * always breaks ties the same way run after run, which reproduces a fixed
 * bias (e.g. the item whose remainder happens to rank highest gets rounded up
 * on every single quiz). Resolving the remainder by weighted lottery instead
 * keeps every run's counts within one of the exact target while making the
 * long-run average exact too.
 */
function quotaAllocate(
  weights: readonly number[],
  count: number,
  random: RandomSource,
): number[] {
  if (weights.length === 0 || count <= 0) {
    return weights.map(() => 0);
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    // No weighting signal among these items (e.g. every remaining bucket has
    // weight zero) — split as evenly as possible rather than favour none.
    return quotaAllocate(
      weights.map(() => 1),
      count,
      random,
    );
  }

  const exact = weights.map((weight) => (weight / totalWeight) * count);
  const base = exact.map((value) => Math.floor(value));
  const remainder = count - base.reduce((sum, value) => sum + value, 0);
  const fraction = exact.map((value, index) => value - base[index]);

  const order = fraction.map((_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomValue(random) * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  const extra = weights.map(() => 0);
  const totalFraction = order.reduce((sum, index) => sum + fraction[index], 0);
  let taken = 0;
  if (totalFraction > 0) {
    const cursor = randomValue(random);
    let cumulative = 0;
    for (const index of order) {
      const previous = cumulative;
      cumulative += fraction[index];
      const hits =
        Math.floor(cumulative - cursor) - Math.floor(previous - cursor);
      if (hits > 0 && taken < remainder) {
        extra[index] = 1;
        taken += 1;
      }
    }
  }
  // Floating-point safety net: the fractions can sum to `remainder` with a
  // sliver of error, occasionally leaving the lottery one short.
  for (const index of order) {
    if (taken >= remainder) break;
    if (fraction[index] > 0 && extra[index] === 0) {
      extra[index] = 1;
      taken += 1;
    }
  }
  // Last-resort net: `remainder` is always < weights.length by construction
  // (each fraction is < 1 and they sum to `remainder`), so there is always
  // room to reach it even if float cancellation zeroed out every fraction.
  for (const index of order) {
    if (taken >= remainder) break;
    if (extra[index] === 0) {
      extra[index] = 1;
      taken += 1;
    }
  }

  return base.map((value, index) => value + extra[index]);
}

/**
 * Caps `quotaAllocate`'s output at each item's available pool, redistributing
 * any shortfall among the items that still have room. Repeats until every
 * unit lands somewhere; each round either finishes or saturates at least one
 * more item, so it terminates within `items.length` rounds.
 */
function allocateWithCapacity(
  items: readonly { key: string; weight: number; capacity: number }[],
  count: number,
  random: RandomSource,
): Map<string, number> {
  const quotas = new Map(items.map((item) => [item.key, 0]));
  let open = items.map((item) => ({ ...item, remaining: item.capacity }));
  let toAllocate = count;

  while (toAllocate > 0) {
    const eligible = open.filter((item) => item.remaining > 0);
    if (eligible.length === 0) {
      throw new QuizSelectionError(
        "Not enough questions are available to fill the requested quota.",
      );
    }

    const allocations = quotaAllocate(
      eligible.map((item) => item.weight),
      toAllocate,
      random,
    );

    const stillOpen: typeof open = [];
    let allocatedThisRound = 0;
    eligible.forEach((item, index) => {
      const granted = Math.min(allocations[index], item.remaining);
      quotas.set(item.key, (quotas.get(item.key) ?? 0) + granted);
      allocatedThisRound += granted;
      const remaining = item.remaining - granted;
      if (remaining > 0) {
        stillOpen.push({ ...item, remaining });
      }
    });

    if (allocatedThisRound === 0) {
      throw new QuizSelectionError(
        "Failed to allocate the requested question quota.",
      );
    }
    open = stillOpen;
    toAllocate -= allocatedThisRound;
  }

  return quotas;
}

const UNCLASSIFIED_SKILL_KEY = "__unclassified__";

/**
 * Allocates `count` questions across domains, then within each domain across
 * its published skills, so every run's per-domain (and per-skill) counts sit
 * within one of the exact blueprint target — not merely correct on average
 * over many runs. A domain or skill with no available questions is simply
 * excluded from its round, and its share is redistributed proportionally
 * among the rest rather than left empty. A question whose subdomain names no
 * declared skill (content validation rejects this today, so it is a defensive
 * fallback, not a live case) is pooled separately per domain and only reached
 * once every declared skill's pool is exhausted.
 */
function weightedSample(
  questions: readonly Question[],
  domains: readonly Domain[],
  count: number,
  random: RandomSource,
): Question[] {
  const domainPools = new Map<string, Question[]>();
  for (const question of questions) {
    const group = domainPools.get(question.domain) ?? [];
    group.push(question);
    domainPools.set(question.domain, group);
  }

  const domainQuotas = allocateWithCapacity(
    domains.map((domain) => ({
      key: domain.slug,
      weight: domain.weight,
      capacity: (domainPools.get(domain.slug) ?? []).length,
    })),
    count,
    random,
  );

  const selected: Question[] = [];

  for (const domain of domains) {
    const domainQuota = domainQuotas.get(domain.slug) ?? 0;
    if (domainQuota === 0) continue;
    const domainQuestions = domainPools.get(domain.slug) ?? [];
    const skills = domain.skills ?? [];

    if (skills.length === 0) {
      selected.push(...randomSample(domainQuestions, domainQuota, random));
      continue;
    }

    const skillSlugs = new Set(skills.map((skill) => skill.slug));
    const skillPools = new Map<string, Question[]>();
    for (const question of domainQuestions) {
      const key =
        question.subdomain !== undefined && skillSlugs.has(question.subdomain)
          ? question.subdomain
          : UNCLASSIFIED_SKILL_KEY;
      const group = skillPools.get(key) ?? [];
      group.push(question);
      skillPools.set(key, group);
    }

    const unclassified = skillPools.get(UNCLASSIFIED_SKILL_KEY) ?? [];
    const skillItems = skills.map((skill) => ({
      key: skill.slug,
      weight: skill.weight,
      capacity: (skillPools.get(skill.slug) ?? []).length,
    }));
    if (unclassified.length > 0) {
      skillItems.push({
        key: UNCLASSIFIED_SKILL_KEY,
        weight: 0,
        capacity: unclassified.length,
      });
    }

    const skillQuotas = allocateWithCapacity(skillItems, domainQuota, random);
    for (const [key, quota] of skillQuotas) {
      if (quota === 0) continue;
      const pool = skillPools.get(key) ?? [];
      selected.push(...randomSample(pool, quota, random));
    }
  }

  // Selection above is grouped by domain then skill; shuffle so quiz order
  // doesn't telegraph the blueprint structure.
  return randomSample(selected, selected.length, random);
}

export function filterReviewQuestions(
  questions: readonly Question[],
  missedQuestionIds: readonly string[],
  bookmarkedQuestionIds: readonly string[],
  scope: ReviewScope,
  domain?: string,
): Question[] {
  const missed = new Set(missedQuestionIds);
  const bookmarked = new Set(bookmarkedQuestionIds);

  return questions.filter((question) => {
    const matchesScope =
      scope === "missed"
        ? missed.has(question.id)
        : scope === "bookmarked"
          ? bookmarked.has(question.id)
          : scope === "missed-or-bookmarked"
            ? missed.has(question.id) || bookmarked.has(question.id)
            : false;

    return matchesScope && (domain === undefined || question.domain === domain);
  });
}

export function selectQuestions(
  questions: readonly Question[],
  domains: readonly Domain[],
  config: QuizSelectionConfig,
  random: RandomSource = Math.random,
): Question[] {
  if (questions.length === 0) {
    throw new QuizSelectionError("The question bank is empty.");
  }

  const scoped = filterQuestionsByScope(questions, config.scopeFilter);
  if (scoped.length === 0) {
    throw new QuizSelectionError(
      "No questions match the selected question scope.",
    );
  }

  if (config.mode === "all") {
    return [...scoped];
  }

  if (config.mode === "domain") {
    if (!config.domain) {
      throw new QuizSelectionError(
        "A domain is required for domain selection.",
      );
    }
    const matchingQuestions = scoped.filter(
      (question) => question.domain === config.domain,
    );
    if (matchingQuestions.length === 0) {
      throw new QuizSelectionError(
        `No questions are available for the selected domain "${config.domain}".`,
      );
    }
    if (config.count === undefined) {
      return matchingQuestions;
    }
    return randomSample(
      matchingQuestions,
      selectionCount(config.count, matchingQuestions.length),
      random,
    );
  }

  if (config.mode === "review") {
    const matchingQuestions = config.domain
      ? scoped.filter((question) => question.domain === config.domain)
      : [...scoped];
    if (matchingQuestions.length === 0) {
      throw new QuizSelectionError(
        "No questions are available for the selected review filters.",
      );
    }
    if (config.count === undefined) {
      return matchingQuestions;
    }
    return randomSample(
      matchingQuestions,
      selectionCount(config.count, matchingQuestions.length),
      random,
    );
  }

  const count = selectionCount(config.count, scoped.length);
  if (config.mode === "random") {
    return randomSample(scoped, count, random);
  }

  if (config.mode === "weighted") {
    return weightedSample(scoped, domains, count, random);
  }

  throw new QuizSelectionError(
    `Unsupported question selection mode "${String(config.mode)}".`,
  );
}

export function scoreAnswer(
  question: Question,
  selectedOptionIds: readonly string[],
): boolean {
  const selected = new Set(selectedOptionIds);
  const correct = new Set(question.correct);

  return (
    selected.size === selectedOptionIds.length &&
    selected.size === correct.size &&
    [...selected].every((optionId) => correct.has(optionId))
  );
}

export function calculateQuizResults(
  questions: readonly Question[],
  answers: Readonly<AnswerMap>,
  domains: readonly Domain[],
): QuizResults {
  const domainNames = new Map(
    domains.map((domain) => [domain.slug, domain.name]),
  );
  const breakdownByDomain = new Map<string, DomainBreakdown>();
  const questionResults: QuestionResult[] = questions.map((question) => {
    const selectedOptionIds = [...(answers[question.id] ?? [])];
    const answered = selectedOptionIds.length > 0;
    const isCorrect = scoreAnswer(question, selectedOptionIds);
    const currentBreakdown = breakdownByDomain.get(question.domain) ?? {
      slug: question.domain,
      name: domainNames.get(question.domain) ?? question.domain,
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      scorePercentage: 0,
    };

    currentBreakdown.totalQuestions += 1;
    if (answered) {
      currentBreakdown.answeredQuestions += 1;
    }
    if (isCorrect) {
      currentBreakdown.correctAnswers += 1;
    }
    currentBreakdown.scorePercentage = Math.round(
      (currentBreakdown.correctAnswers / currentBreakdown.totalQuestions) * 100,
    );
    breakdownByDomain.set(question.domain, currentBreakdown);

    return {
      questionId: question.id,
      domain: question.domain,
      selectedOptionIds,
      answered,
      isCorrect,
    };
  });

  const correctAnswers = questionResults.filter(
    (result) => result.isCorrect,
  ).length;
  const answeredQuestions = questionResults.filter(
    (result) => result.answered,
  ).length;

  return {
    totalQuestions: questions.length,
    answeredQuestions,
    correctAnswers,
    scorePercentage:
      questions.length === 0
        ? 0
        : Math.round((correctAnswers / questions.length) * 100),
    questionResults,
    domainBreakdown: [...breakdownByDomain.values()],
  };
}

function pickIncorrectOptions(
  question: Question,
  random: RandomSource,
): string[] {
  const correctSet = new Set(question.correct);
  const distractors = question.options.filter((opt) => !correctSet.has(opt.id));
  const requiredCount = question.correct.length;

  const shuffledDistractors = [...distractors];
  for (let idx = shuffledDistractors.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(randomValue(random) * (idx + 1));
    [shuffledDistractors[idx], shuffledDistractors[swapIdx]] = [
      shuffledDistractors[swapIdx],
      shuffledDistractors[idx],
    ];
  }

  if (shuffledDistractors.length >= requiredCount) {
    return shuffledDistractors.slice(0, requiredCount).map((opt) => opt.id);
  }

  // Degenerate case: fewer distractors than correct.length (e.g. a multi-answer
  // question with only one wrong option). Return all distractors without padding
  // with correct IDs — scoreAnswer will still return false because the chosen
  // set won't match question.correct exactly.
  return shuffledDistractors.map((opt) => opt.id);
}

export function simulateQuizAnswers(
  questions: readonly Question[],
  preset: SimulationPreset,
  random: RandomSource = Math.random,
): AnswerMap {
  if (questions.length === 0) {
    return {};
  }

  let targetCorrectCount: number;
  switch (preset) {
    case "perfect-pass":
      targetCorrectCount = questions.length;
      break;
    case "complete-fail":
      targetCorrectCount = 0;
      break;
    case "realistic-pass": {
      // Cap at questions.length - 1 to ensure the preset never silently becomes
      // "perfect-pass", including for small question sets (≤ 3).
      const target = Math.round(questions.length * 0.8);
      targetCorrectCount = Math.min(questions.length - 1, Math.max(1, target));
      break;
    }
    case "borderline-fail": {
      // For a single question there are no "borderline" options; 0 correct is
      // the best approximation of a failing score.
      const target = Math.round(questions.length * 0.6);
      targetCorrectCount = Math.min(questions.length - 1, Math.max(0, target));
      break;
    }
    default:
      throw new QuizSelectionError(
        `Unsupported simulation preset "${String(preset)}".`,
      );
  }

  const indices = Array.from({ length: questions.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(randomValue(random) * (i + 1));
    [indices[i], indices[swap]] = [indices[swap], indices[i]];
  }

  const correctIndices = new Set(indices.slice(0, targetCorrectCount));
  const answers: AnswerMap = {};

  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i];
    if (correctIndices.has(i)) {
      answers[question.id] = [...question.correct];
    } else {
      answers[question.id] = pickIncorrectOptions(question, random);
    }
  }

  return answers;
}

export function getUnusedQuizQuestions(
  questions: readonly Question[],
  attemptOrUsedIds:
    Pick<AttemptRecord, "config" | "questionIds"> | readonly string[],
  scopeFilterOrContext?: ScopeFilter | RetakeReviewContext,
  domain?: string,
): Question[] {
  let config: QuizConfig;
  let usedQuestionIds: readonly string[];

  if ("config" in attemptOrUsedIds) {
    usedQuestionIds = attemptOrUsedIds.questionIds;
    config = attemptOrUsedIds.config;
  } else {
    usedQuestionIds = attemptOrUsedIds;
    config = {
      mode: domain ? "domain" : "random",
      revealMode: "immediate",
      scopeFilter:
        typeof scopeFilterOrContext === "string"
          ? scopeFilterOrContext
          : undefined,
      domain,
    };
  }

  const reviewContext: RetakeReviewContext | undefined =
    "config" in attemptOrUsedIds
      ? (scopeFilterOrContext as RetakeReviewContext | undefined)
      : undefined;

  const scoped = filterQuestionsByScope(questions, config.scopeFilter);
  const domainFilter =
    config.mode === "domain" || config.mode === "review"
      ? config.domain
      : undefined;

  let eligible: Question[];
  if (config.mode === "review") {
    const reviewScope = config.reviewScope ?? "missed-or-bookmarked";
    const missed = reviewContext?.missedQuestionIds ?? [];
    const bookmarked = reviewContext?.bookmarkedQuestionIds ?? [];
    eligible = filterReviewQuestions(
      scoped,
      missed,
      bookmarked,
      reviewScope,
      domainFilter,
    );
  } else if (domainFilter) {
    eligible = scoped.filter((question) => question.domain === domainFilter);
  } else {
    eligible = scoped;
  }

  const used = new Set(usedQuestionIds);
  return eligible.filter((question) => !used.has(question.id));
}

export function prepareRetakeSession(
  questions: readonly Question[],
  domains: readonly Domain[],
  attempt: Pick<AttemptRecord, "config" | "questionIds">,
  mode: RetakeMode,
  random: RandomSource = Math.random,
  reviewContext?: RetakeReviewContext,
): { questions: Question[]; config: QuizConfig } {
  if (questions.length === 0) {
    throw new QuizSelectionError("The question bank is empty.");
  }

  if (mode === "exact") {
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const exactQuestions = attempt.questionIds
      .map((id) => questionMap.get(id))
      .filter((q): q is Question => q !== undefined);

    if (exactQuestions.length === 0) {
      throw new QuizSelectionError(
        "No questions from the previous attempt are available.",
      );
    }

    return {
      questions: exactQuestions,
      config: {
        ...attempt.config,
        count: exactQuestions.length,
      },
    };
  }

  if (mode === "random") {
    let pool: Question[];
    if (attempt.config.mode === "review") {
      const scoped = filterQuestionsByScope(
        questions,
        attempt.config.scopeFilter,
      );
      const reviewScope = attempt.config.reviewScope ?? "missed-or-bookmarked";
      const missed = reviewContext?.missedQuestionIds ?? [];
      const bookmarked = reviewContext?.bookmarkedQuestionIds ?? [];
      pool = filterReviewQuestions(
        scoped,
        missed,
        bookmarked,
        reviewScope,
        attempt.config.domain,
      );
    } else {
      pool = filterQuestionsByScope(questions, attempt.config.scopeFilter);
    }

    const configToUse: QuizConfig =
      attempt.config.mode === "all"
        ? {
            ...attempt.config,
            mode: "random",
            count: attempt.questionIds.length,
          }
        : { ...attempt.config };

    const selected = selectQuestions(pool, domains, configToUse, random);

    return {
      questions: selected,
      config: configToUse,
    };
  }

  if (mode === "other") {
    const unused = getUnusedQuizQuestions(questions, attempt, reviewContext);

    if (unused.length === 0) {
      throw new QuizSelectionError(
        "No unused questions are available from this certification.",
      );
    }

    const targetCount = Math.min(
      attempt.config.count ?? attempt.questionIds.length,
      unused.length,
    );

    const selected = randomSample(unused, targetCount, random);
    const newConfig: QuizConfig = {
      ...attempt.config,
      mode:
        attempt.config.mode === "domain"
          ? "domain"
          : attempt.config.mode === "review"
            ? "review"
            : "random",
      count: targetCount,
    };

    return {
      questions: selected,
      config: newConfig,
    };
  }

  throw new QuizSelectionError(`Unsupported retake mode "${String(mode)}".`);
}
