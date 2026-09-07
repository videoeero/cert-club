import type {
  AnswerMap,
  Domain,
  DomainBreakdown,
  Question,
  QuestionResult,
  QuizResults,
  QuizSelectionConfig,
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

/**
 * Restricts the pool to the slice of the bank the user opted into. An absent
 * scope means "core", so banks that predate the field are unaffected.
 */
export function filterQuestionsByScope(
  questions: readonly Question[],
  scopeFilter: ScopeFilter = DEFAULT_SCOPE_FILTER,
): Question[] {
  if (scopeFilter === "everything") {
    return [...questions];
  }
  return questions.filter((question) => {
    const scope = question.scope ?? "core";
    return (
      scope === "core" || (scopeFilter === "with-deep" && scope === "deep")
    );
  });
}

/**
 * Maps each question to the bucket that weighted sampling draws from. When a
 * domain publishes a skill breakdown, buckets are per skill so the mix inside a
 * domain tracks the blueprint too, not just the mix across domains.
 */
function samplingBuckets(domains: readonly Domain[]): {
  keyOf: (question: Question) => string;
  weightOf: (key: string) => number;
} {
  const weights = new Map<string, number>();
  const skillsByDomain = new Map<string, Set<string>>();

  for (const domain of domains) {
    const skills = domain.skills ?? [];
    if (skills.length > 0) {
      skillsByDomain.set(domain.slug, new Set(skills.map((s) => s.slug)));
      for (const skill of skills) {
        weights.set(`${domain.slug}/${skill.slug}`, Math.max(0, skill.weight));
      }
    }
    // A skill-declaring domain's own bucket only catches questions whose
    // subdomain names no declared skill, which content validation rejects.
    // Weight zero deprioritises them without dropping them outright.
    weights.set(
      domain.slug,
      skills.length > 0 ? 0 : Math.max(0, domain.weight),
    );
  }

  return {
    keyOf(question) {
      const skills = skillsByDomain.get(question.domain);
      if (
        skills !== undefined &&
        question.subdomain !== undefined &&
        skills.has(question.subdomain)
      ) {
        return `${question.domain}/${question.subdomain}`;
      }
      return question.domain;
    },
    weightOf(key) {
      return weights.get(key) ?? 0;
    },
  };
}

function weightedSample(
  questions: readonly Question[],
  domains: readonly Domain[],
  count: number,
  random: RandomSource,
): Question[] {
  const { keyOf, weightOf } = samplingBuckets(domains);
  const remaining = new Map<string, Question[]>();
  for (const question of questions) {
    const key = keyOf(question);
    const group = remaining.get(key) ?? [];
    group.push(question);
    remaining.set(key, group);
  }

  const selected: Question[] = [];

  while (selected.length < count) {
    const available = [...remaining.entries()].filter(
      ([, group]) => group.length > 0,
    );
    const weighted = available.filter(([key]) => weightOf(key) > 0);
    const candidates = weighted.length > 0 ? weighted : available;
    const totalWeight = candidates.reduce(
      (total, [key]) => total + (weighted.length > 0 ? weightOf(key) : 1),
      0,
    );
    let cursor = randomValue(random) * totalWeight;
    let selectedKey = candidates[candidates.length - 1][0];

    for (const [key] of candidates) {
      const weight = weighted.length > 0 ? weightOf(key) : 1;
      if (cursor < weight) {
        selectedKey = key;
        break;
      }
      cursor -= weight;
    }

    const group = remaining.get(selectedKey);
    if (!group) {
      throw new QuizSelectionError(
        `No questions remain for the selected group "${selectedKey}".`,
      );
    }
    const questionIndex = Math.floor(randomValue(random) * group.length);
    const [question] = group.splice(questionIndex, 1);
    if (!question) {
      throw new QuizSelectionError("The weighted question sample was empty.");
    }
    selected.push(question);
  }

  return selected;
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
