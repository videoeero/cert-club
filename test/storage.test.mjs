import assert from "node:assert/strict";
import test from "node:test";

import {
  clearMissedQuestionIds,
  clearPausedSession,
  getAttempt,
  getAttempts,
  getBookmarkedQuestionIds,
  getMissedQuestionIds,
  getPausedSession,
  getPausedSessions,
  MAX_ATTEMPT_HISTORY,
  recordMissedQuestionIds,
  saveAttempt,
  savePausedSession,
  setBookmarkedQuestionIds,
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

test("preserves legacy scope filter recorded on a stored attempt", () => {
  const storage = new MemoryStorage();
  const record = attempt("scoped");
  record.config.scopeFilter = "with-deep";

  saveAttempt(record, storage);
  assert.equal(
    getAttempt("test-cert", "scoped", storage).config.scopeFilter,
    "with-deep",
  );
});

test("rejects an attempt carrying an invalid config", () => {
  const storage = new MemoryStorage();
  const record = attempt("bad-config");
  record.config.mode = "invalid-mode";

  assert.throws(
    () => saveAttempt(record, storage),
    /Cannot save an invalid quiz attempt/,
  );
});

function samplePausedSession(cert = "test-cert") {
  return {
    cert,
    startedAt: "2026-09-03T10:00:00.000Z",
    pausedAt: "2026-09-03T10:02:30.000Z",
    elapsedSeconds: 150,
    config: {
      mode: "weighted",
      count: 5,
      revealMode: "immediate",
    },
    questionIds: ["q1", "q2", "q3", "q4", "q5"],
    questionIndex: 2,
    answers: { q1: ["a"], q2: ["b", "c"] },
    strikethroughs: { q2: ["d"] },
    revealedQuestionIds: ["q1"],
    hintRevealedQuestionIds: ["q2"],
  };
}

test("saves, retrieves, and clears a paused session", () => {
  const storage = new MemoryStorage();
  const session = samplePausedSession("test-cert");

  assert.equal(getPausedSession("test-cert", storage), null);
  savePausedSession("test-cert", session, storage);

  const loaded = getPausedSession("test-cert", storage);
  assert.deepEqual(loaded, session);

  // Verifies deep cloning so caller mutations do not leak
  loaded.answers.q1.push("mutated");
  assert.notDeepEqual(getPausedSession("test-cert", storage), loaded);

  clearPausedSession("test-cert", storage);
  assert.equal(getPausedSession("test-cert", storage), null);
});

test("isolates paused sessions across different certifications", () => {
  const storage = new MemoryStorage();
  const sessionA = samplePausedSession("cert-a");
  const sessionB = samplePausedSession("cert-b");

  savePausedSession("cert-a", sessionA, storage);
  savePausedSession("cert-b", sessionB, storage);

  assert.deepEqual(getPausedSession("cert-a", storage), sessionA);
  assert.deepEqual(getPausedSession("cert-b", storage), sessionB);

  const all = getPausedSessions(storage);
  assert.equal(Object.keys(all).length, 2);

  clearPausedSession("cert-a", storage);
  assert.equal(getPausedSession("cert-a", storage), null);
  assert.deepEqual(getPausedSession("cert-b", storage), sessionB);
});

test("rejects saving an invalid paused session", () => {
  const storage = new MemoryStorage();
  const badSession = { ...samplePausedSession(), elapsedSeconds: -5 };

  assert.throws(
    () => savePausedSession("test-cert", badSession, storage),
    StorageError,
  );

  const outOfBoundsSession = {
    ...samplePausedSession(),
    questionIndex: 5,
  };
  assert.throws(
    () => savePausedSession("test-cert", outOfBoundsSession, storage),
    StorageError,
  );

  const mismatchCertSession = samplePausedSession("cert-a");
  assert.throws(
    () => savePausedSession("cert-b", mismatchCertSession, storage),
    StorageError,
  );
});

test("discards corrupted paused sessions on read", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    STORAGE_KEYS.pausedSessions,
    JSON.stringify({ version: 1, data: { "test-cert": { invalid: true } } }),
  );
  assert.equal(getPausedSession("test-cert", storage), null);
  assert.deepEqual(getPausedSessions(storage), {});

  storage.setItem(
    STORAGE_KEYS.pausedSessions,
    JSON.stringify({
      version: 1,
      data: { "cert-a": samplePausedSession("cert-b") },
    }),
  );
  assert.equal(getPausedSession("cert-a", storage), null);
  assert.deepEqual(getPausedSessions(storage), {});

  storage.setItem(
    STORAGE_KEYS.pausedSessions,
    JSON.stringify({
      version: 1,
      data: {
        "test-cert": {
          ...samplePausedSession("test-cert"),
          questionIndex: 10,
        },
      },
    }),
  );
  assert.equal(getPausedSession("test-cert", storage), null);
  assert.deepEqual(getPausedSessions(storage), {});
});

test("saves and retrieves an attempt carrying optionOrders", () => {
  const storage = new MemoryStorage();
  const att = {
    ...attempt("with-option-orders"),
    optionOrders: { q1: ["b", "a"], q2: ["c", "b", "a"] },
  };
  saveAttempt(att, storage);
  const retrieved = getAttempt("test-cert", "with-option-orders", storage);
  assert.deepEqual(retrieved?.optionOrders, {
    q1: ["b", "a"],
    q2: ["c", "b", "a"],
  });
});

test("saves and retrieves a paused session carrying optionOrders", () => {
  const storage = new MemoryStorage();
  const session = {
    ...samplePausedSession("test-cert"),
    optionOrders: { q1: ["b", "a"] },
  };
  savePausedSession("test-cert", session, storage);
  const retrieved = getPausedSession("test-cert", storage);
  assert.deepEqual(retrieved?.optionOrders, { q1: ["b", "a"] });
});

test("defensively copies optionOrders in attempts and paused sessions", () => {
  const storage = new MemoryStorage();
  const optionOrders = { q1: ["b", "a"] };
  const att = {
    ...attempt("defensive-clone"),
    optionOrders,
  };
  saveAttempt(att, storage);
  optionOrders.q1.push("c");
  const retrievedAttempt = getAttempt("test-cert", "defensive-clone", storage);
  assert.deepEqual(retrievedAttempt?.optionOrders, { q1: ["b", "a"] });

  const sessionOptionOrders = { q1: ["b", "a"] };
  const session = {
    ...samplePausedSession("test-cert"),
    optionOrders: sessionOptionOrders,
  };
  savePausedSession("test-cert", session, storage);
  sessionOptionOrders.q1.push("d");
  const retrievedSession = getPausedSession("test-cert", storage);
  assert.deepEqual(retrievedSession?.optionOrders, { q1: ["b", "a"] });
});
