import type {
  AttemptRecord,
  DomainBreakdown,
  Preferences,
  QuizConfig,
  ReviewScope,
  ScopeFilter,
} from "../types";

export const STORAGE_VERSION = 1;
export const MAX_ATTEMPT_HISTORY = 10;

export const STORAGE_KEYS = {
  attempts: "cert-prep-open.attempts",
  bookmarks: "cert-prep-open.bookmarks",
  missed: "cert-prep-open.missed",
  preferences: "cert-prep-open.preferences",
} as const;

export const DEFAULT_PREFERENCES: Preferences = {
  scopeFilter: "core-only",
};

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StorageError";
  }
}

const CERT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isStringArrayMap(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([key, ids]) => CERT_SLUG_PATTERN.test(key) && isStringArray(ids),
    )
  );
}

function isReviewScope(value: unknown): value is ReviewScope {
  return (
    value === "missed" ||
    value === "bookmarked" ||
    value === "missed-or-bookmarked"
  );
}

function isScopeFilter(value: unknown): value is ScopeFilter {
  return value === "core-only" || value === "with-deep";
}

function isPreferences(value: unknown): value is Preferences {
  return isRecord(value) && isScopeFilter(value.scopeFilter);
}

function isQuizConfig(value: unknown): value is QuizConfig {
  return (
    isRecord(value) &&
    (value.mode === "all" ||
      value.mode === "domain" ||
      value.mode === "random" ||
      value.mode === "weighted" ||
      value.mode === "review") &&
    (value.revealMode === "immediate" || value.revealMode === "end") &&
    (value.count === undefined ||
      (typeof value.count === "number" &&
        Number.isInteger(value.count) &&
        value.count > 0)) &&
    (value.domain === undefined || typeof value.domain === "string") &&
    (value.reviewScope === undefined || isReviewScope(value.reviewScope)) &&
    (value.scopeFilter === undefined || isScopeFilter(value.scopeFilter))
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isDomainBreakdown(value: unknown): value is DomainBreakdown {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    isNonNegativeInteger(value.totalQuestions) &&
    isNonNegativeInteger(value.answeredQuestions) &&
    isNonNegativeInteger(value.correctAnswers) &&
    typeof value.scorePercentage === "number" &&
    Number.isFinite(value.scorePercentage) &&
    value.scorePercentage >= 0 &&
    value.scorePercentage <= 100
  );
}

function isAttemptRecord(value: unknown): value is AttemptRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.cert === "string" &&
    typeof value.startedAt === "string" &&
    typeof value.completedAt === "string" &&
    isQuizConfig(value.config) &&
    isStringArray(value.questionIds) &&
    isStringArrayMap(value.answers) &&
    isNonNegativeInteger(value.totalQuestions) &&
    isNonNegativeInteger(value.answeredQuestions) &&
    isNonNegativeInteger(value.correctAnswers) &&
    typeof value.scorePercentage === "number" &&
    Number.isFinite(value.scorePercentage) &&
    value.scorePercentage >= 0 &&
    value.scorePercentage <= 100 &&
    Array.isArray(value.domainBreakdown) &&
    value.domainBreakdown.every(isDomainBreakdown)
  );
}

function isAttemptArray(value: unknown): value is AttemptRecord[] {
  return Array.isArray(value) && value.every(isAttemptRecord);
}

function resolveStorage(storage?: StorageAdapter): StorageAdapter {
  if (storage) {
    return storage;
  }

  try {
    if (typeof globalThis.localStorage === "undefined") {
      throw new StorageError("Browser localStorage is unavailable.");
    }
    return globalThis.localStorage;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError("Browser localStorage is unavailable.", {
      cause: error,
    });
  }
}

function readValue<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
  storage: StorageAdapter,
): T {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    throw new StorageError(`Could not read ${key} from localStorage.`, {
      cause: error,
    });
  }

  if (raw === null) {
    return fallback;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fallback;
    }
    throw new StorageError(`Could not parse ${key} from localStorage.`, {
      cause: error,
    });
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== STORAGE_VERSION ||
    !isValid(parsed.data)
  ) {
    return fallback;
  }

  return parsed.data;
}

function writeValue(key: string, data: unknown, storage: StorageAdapter): void {
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
  } catch (error) {
    throw new StorageError(`Could not write ${key} to localStorage.`, {
      cause: error,
    });
  }
}

function cloneAttempt(attempt: AttemptRecord): AttemptRecord {
  return {
    ...attempt,
    config: { ...attempt.config },
    questionIds: [...attempt.questionIds],
    answers: Object.fromEntries(
      Object.entries(attempt.answers).map(([questionId, selected]) => [
        questionId,
        [...selected],
      ]),
    ),
    domainBreakdown: attempt.domainBreakdown.map((domain) => ({ ...domain })),
  };
}

function readAttempts(storage: StorageAdapter): AttemptRecord[] {
  return readValue(STORAGE_KEYS.attempts, [], isAttemptArray, storage);
}

function readQuestionIdMap(
  key: string,
  storage: StorageAdapter,
): Record<string, string[]> {
  return readValue(key, {}, isStringArrayMap, storage);
}

export function getAttempts(
  cert?: string,
  storage?: StorageAdapter,
): AttemptRecord[] {
  const attempts = readAttempts(resolveStorage(storage));
  return attempts
    .filter((attempt) => cert === undefined || attempt.cert === cert)
    .map(cloneAttempt);
}

export function getAttempt(
  cert: string,
  attemptId: string,
  storage?: StorageAdapter,
): AttemptRecord | undefined {
  return getAttempts(cert, storage).find((attempt) => attempt.id === attemptId);
}

export function saveAttempt(
  attempt: AttemptRecord,
  storage?: StorageAdapter,
): void {
  if (!isAttemptRecord(attempt)) {
    throw new StorageError("Cannot save an invalid quiz attempt.");
  }

  const resolvedStorage = resolveStorage(storage);
  const attempts = readAttempts(resolvedStorage).filter(
    (existing) => existing.id !== attempt.id,
  );
  writeValue(
    STORAGE_KEYS.attempts,
    [attempt, ...attempts].slice(0, MAX_ATTEMPT_HISTORY),
    resolvedStorage,
  );
}

/**
 * Preferences are app-wide rather than per-cert: the scope filter expresses how
 * the user wants to study, not something about one certification.
 */
export function getPreferences(storage?: StorageAdapter): Preferences {
  return readValue(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
    isPreferences,
    resolveStorage(storage),
  );
}

export function setPreferences(
  preferences: Preferences,
  storage?: StorageAdapter,
): void {
  writeValue(
    STORAGE_KEYS.preferences,
    { ...preferences },
    resolveStorage(storage),
  );
}

export function getBookmarkedQuestionIds(
  cert: string,
  storage?: StorageAdapter,
): string[] {
  const bookmarks = readQuestionIdMap(
    STORAGE_KEYS.bookmarks,
    resolveStorage(storage),
  );
  return [...(bookmarks[cert] ?? [])];
}

export function setBookmarkedQuestionIds(
  cert: string,
  questionIds: readonly string[],
  storage?: StorageAdapter,
): void {
  const resolvedStorage = resolveStorage(storage);
  const bookmarks = readQuestionIdMap(STORAGE_KEYS.bookmarks, resolvedStorage);
  const next = {
    ...bookmarks,
    [cert]: [...new Set(questionIds)],
  };
  writeValue(STORAGE_KEYS.bookmarks, next, resolvedStorage);
}

export function getMissedQuestionIds(
  cert: string,
  storage?: StorageAdapter,
): string[] {
  const missed = readQuestionIdMap(
    STORAGE_KEYS.missed,
    resolveStorage(storage),
  );
  return [...(missed[cert] ?? [])];
}

export function recordMissedQuestionIds(
  cert: string,
  questionIds: readonly string[],
  storage?: StorageAdapter,
): void {
  if (questionIds.length === 0) {
    return;
  }

  const resolvedStorage = resolveStorage(storage);
  const missed = readQuestionIdMap(STORAGE_KEYS.missed, resolvedStorage);
  const next = {
    ...missed,
    [cert]: [...new Set([...(missed[cert] ?? []), ...questionIds])],
  };
  writeValue(STORAGE_KEYS.missed, next, resolvedStorage);
}

/**
 * Removes question ids from the persisted "missed" set for a certification,
 * e.g. once they have been answered correctly on a later attempt.
 */
export function clearMissedQuestionIds(
  cert: string,
  questionIds: readonly string[],
  storage?: StorageAdapter,
): void {
  if (questionIds.length === 0) {
    return;
  }

  const resolvedStorage = resolveStorage(storage);
  const missed = readQuestionIdMap(STORAGE_KEYS.missed, resolvedStorage);
  const toRemove = new Set(questionIds);
  const next = {
    ...missed,
    [cert]: (missed[cert] ?? []).filter(
      (questionId) => !toRemove.has(questionId),
    ),
  };
  writeValue(STORAGE_KEYS.missed, next, resolvedStorage);
}
