import assert from "node:assert/strict";
import test from "node:test";

import {
  clearMissedQuestionIds,
  DEFAULT_PREFERENCES,
  getAttempt,
  getAttempts,
  getBookmarkedQuestionIds,
  getMissedQuestionIds,
  getPreferences,
  MAX_ATTEMPT_HISTORY,
  recordMissedQuestionIds,
  saveAttempt,
  setBookmarkedQuestionIds,
  setPreferences,
  STORAGE_KEYS,
  StorageError,
} from "../src/lib/storage.ts";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  setItem(key, value) {
    this.#values.set(key, value);
  }
}

function attempt(id) {
  return {
    id,
    cert: "test-cert",
    startedAt: "2026-09-03T10:00:00.000Z",
    completedAt: "2026-09-03T10:05:00.000Z",
    config: {
      mode: "random",
      count: 2,
      revealMode: "immediate",
    },
    questionIds: ["q1", "q2"],
    answers: { q1: ["a"], q2: [] },
    totalQuestions: 2,
    answeredQuestions: 1,
    correctAnswers: 1,
    scorePercentage: 50,
    domainBreakdown: [
      {
        slug: "alpha",
        name: "Alpha",
        totalQuestions: 2,
        answeredQuestions: 1,
        correctAnswers: 1,
        scorePercentage: 50,
      },
    ],
  };
}

test("discards unknown, older, and malformed storage envelopes", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    STORAGE_KEYS.attempts,
    JSON.stringify({ version: 0, data: [attempt("old")] }),
  );
  assert.deepEqual(getAttempts(undefined, storage), []);

  storage.setItem(STORAGE_KEYS.attempts, "{not-json");
  assert.deepEqual(getAttempts(undefined, storage), []);

  storage.setItem(
    STORAGE_KEYS.attempts,
    JSON.stringify({ version: 99, data: [attempt("future")] }),
  );
  assert.deepEqual(getAttempts(undefined, storage), []);
});

test("keeps the newest attempt history within the configured limit", () => {
  const storage = new MemoryStorage();

  for (let index = 0; index < MAX_ATTEMPT_HISTORY + 2; index += 1) {
    saveAttempt(attempt(`attempt-${index}`), storage);
  }

  const attempts = getAttempts("test-cert", storage);
  assert.equal(attempts.length, MAX_ATTEMPT_HISTORY);
  assert.equal(attempts[0].id, `attempt-${MAX_ATTEMPT_HISTORY + 1}`);
  assert.equal(attempts.at(-1).id, "attempt-2");
});

test("persists bookmarks and accumulates missed questions per certification", () => {
  const storage = new MemoryStorage();

  setBookmarkedQuestionIds("test-cert", ["q1", "q1", "q2"], storage);
  assert.deepEqual(getBookmarkedQuestionIds("test-cert", storage), [
    "q1",
    "q2",
  ]);

  recordMissedQuestionIds("test-cert", ["q2", "q3"], storage);
  recordMissedQuestionIds("test-cert", ["q1", "q2"], storage);
  assert.deepEqual(getMissedQuestionIds("test-cert", storage), [
    "q2",
    "q3",
    "q1",
  ]);
});

test("clears missed questions once they are answered correctly", () => {
  const storage = new MemoryStorage();

  recordMissedQuestionIds("test-cert", ["q1", "q2", "q3"], storage);
  clearMissedQuestionIds("test-cert", ["q2"], storage);
  assert.deepEqual(getMissedQuestionIds("test-cert", storage), ["q1", "q3"]);

  clearMissedQuestionIds("test-cert", [], storage);
  assert.deepEqual(getMissedQuestionIds("test-cert", storage), ["q1", "q3"]);

  clearMissedQuestionIds("other-cert", ["q1"], storage);
  assert.deepEqual(getMissedQuestionIds("test-cert", storage), ["q1", "q3"]);
});

test("looks up a single attempt by cert and id", () => {
  const storage = new MemoryStorage();
  saveAttempt(attempt("attempt-1"), storage);
  saveAttempt(attempt("attempt-2"), storage);

  assert.equal(getAttempt("test-cert", "attempt-2", storage)?.id, "attempt-2");
  assert.equal(getAttempt("test-cert", "missing", storage), undefined);
  assert.equal(getAttempt("other-cert", "attempt-1", storage), undefined);
});

test("rejects saving an attempt that does not match the expected shape", () => {
  const storage = new MemoryStorage();
  const invalidAttempt = { ...attempt("bad"), scorePercentage: "50%" };

  assert.throws(() => saveAttempt(invalidAttempt, storage), StorageError);
  assert.deepEqual(getAttempts("test-cert", storage), []);
});

test("defaults preferences to exam-aligned questions only", () => {
  const storage = new MemoryStorage();

  assert.deepEqual(getPreferences(storage), DEFAULT_PREFERENCES);
  assert.equal(getPreferences(storage).scopeFilter, "core-only");
});

test("round-trips the scope filter preference", () => {
  const storage = new MemoryStorage();

  setPreferences({ scopeFilter: "with-deep" }, storage);
  assert.equal(getPreferences(storage).scopeFilter, "with-deep");

  setPreferences({ scopeFilter: "everything" }, storage);
  assert.equal(getPreferences(storage).scopeFilter, "everything");
});

test("falls back to the default when stored preferences are unusable", () => {
  const storage = new MemoryStorage();

  storage.setItem(STORAGE_KEYS.preferences, "not json at all");
  assert.deepEqual(getPreferences(storage), DEFAULT_PREFERENCES);

  storage.setItem(
    STORAGE_KEYS.preferences,
    JSON.stringify({ version: 1, data: { scopeFilter: "core-and-deep" } }),
  );
  assert.deepEqual(getPreferences(storage), DEFAULT_PREFERENCES);

  storage.setItem(
    STORAGE_KEYS.preferences,
    JSON.stringify({ version: 99, data: { scopeFilter: "everything" } }),
  );
  assert.deepEqual(getPreferences(storage), DEFAULT_PREFERENCES);
});

test("keeps a scope filter recorded on a stored attempt", () => {
  const storage = new MemoryStorage();
  const record = attempt("scoped");
  record.config.scopeFilter = "with-deep";

  saveAttempt(record, storage);
  assert.equal(
    getAttempt("test-cert", "scoped", storage).config.scopeFilter,
    "with-deep",
  );
});

test("rejects an attempt carrying an unknown scope filter", () => {
  const storage = new MemoryStorage();
  const record = attempt("bad-scope");
  record.config.scopeFilter = "core-and-deep";

  assert.throws(
    () => saveAttempt(record, storage),
    /Cannot save an invalid quiz attempt/,
  );
});
