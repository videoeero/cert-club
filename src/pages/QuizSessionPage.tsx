import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertContent } from "../lib/content";
import {
  answerCountLabel,
  calculateQuizResults,
  filterReviewQuestions,
  scoreAnswer,
  selectQuestions,
  simulateQuizAnswers,
  QuizSelectionError,
} from "../lib/quiz";
import {
  clearMissedQuestionIds,
  getBookmarkedQuestionIds,
  getMissedQuestionIds,
  recordMissedQuestionIds,
  saveAttempt,
  setBookmarkedQuestionIds as persistBookmarkedQuestionIds,
} from "../lib/storage";
import { formatRemainingTime } from "../lib/time";
import type {
  AttemptRecord,
  Question,
  QuestionSelectionMode,
  QuizConfig,
  ReviewScope,
  RevealMode,
  SimulationPreset,
} from "../types";

interface ActiveSession {
  questions: Question[];
  config: QuizConfig;
  startedAt: string;
}

const DEFAULT_SELECTION_MODE: QuestionSelectionMode = "weighted";
const DEFAULT_QUESTION_COUNT = "10";
const DEFAULT_REVEAL_MODE: RevealMode = "immediate";
const DEFAULT_REVIEW_SCOPE: ReviewScope = "missed-or-bookmarked";

const REVIEW_SCOPE_LABELS: Record<ReviewScope, string> = {
  missed: "Missed questions",
  bookmarked: "Bookmarked questions",
  "missed-or-bookmarked": "Missed or bookmarked",
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function createAttemptId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function QuizSessionPage() {
  const { certSlug } = useParams<{ certSlug: string }>();
  const navigate = useNavigate();
  const [retryKey, setRetryKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState<QuestionSelectionMode>(
    DEFAULT_SELECTION_MODE,
  );
  const [selectionDomain, setSelectionDomain] = useState("");
  const [selectionCount, setSelectionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [revealMode, setRevealMode] = useState<RevealMode>(DEFAULT_REVEAL_MODE);
  const [activeTab, setActiveTab] = useState<"practice" | "simulate">(
    "practice",
  );
  const [simulationPreset, setSimulationPreset] =
    useState<SimulationPreset>("realistic-pass");
  const [reviewScope, setReviewScope] =
    useState<ReviewScope>(DEFAULT_REVIEW_SCOPE);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<
    Set<string>
  >(new Set());
  const [missedQuestionIds, setMissedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const [storageError, setStorageError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const resource = useAsyncResource(
    () =>
      certSlug
        ? loadCertContent(certSlug)
        : Promise.reject(new Error("A certification slug is required.")),
    [certSlug, retryKey],
  );

  useEffect(() => {
    setQuestionIndex(0);
    setActiveSession(null);
    setAnswers({});
    setRevealedQuestionIds(new Set());
    setSelectionDomain("");
    setReviewScope(DEFAULT_REVIEW_SCOPE);
    setActiveTab("practice");
    setSimulationPreset("realistic-pass");
    setSessionError(null);
    setFinishError(null);
    setBookmarkedQuestionIds(new Set());
    setMissedQuestionIds(new Set());
    setStorageError(null);

    if (!certSlug) {
      return;
    }

    try {
      setBookmarkedQuestionIds(new Set(getBookmarkedQuestionIds(certSlug)));
      setMissedQuestionIds(new Set(getMissedQuestionIds(certSlug)));
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }, [certSlug, retryKey]);

  // Track whether we've already seeded selectionCount from the manifest so a
  // re-resolved resource object doesn't overwrite the user's manual edit.
  const hasSetDefaultCount = useRef(false);

  useEffect(() => {
    if (resource.status !== "ready") {
      return;
    }
    if (hasSetDefaultCount.current) {
      return;
    }
    hasSetDefaultCount.current = true;
    const { manifest, questions } = resource.data;
    const defaultCount = manifest.examQuestionCount
      ? Math.min(manifest.examQuestionCount, questions.length)
      : Math.min(Number(DEFAULT_QUESTION_COUNT), questions.length);
    setSelectionCount(String(defaultCount));
  }, [resource]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (resource.status === "loading") {
    return (
      <section className="page-section">
        <LoadingState message="Loading the question bank..." />
      </section>
    );
  }

  if (resource.status === "error") {
    return (
      <section className="page-section">
        <ErrorState
          error={resource.error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </section>
    );
  }

  const { manifest, questions } = resource.data;

  if (questions.length === 0) {
    return (
      <section className="page-section">
        <div className="state-card error-card" role="alert">
          <p className="eyebrow">Empty question bank</p>
          <h1>No questions are available yet.</h1>
          <Link className="button button-secondary" to="/">
            Back to certifications
          </Link>
        </div>
      </section>
    );
  }

  const selectedDomain = selectionDomain || manifest.domains[0]?.slug || "";
  const domainQuestionCount = questions.filter(
    (question) => question.domain === selectedDomain,
  ).length;
  const reviewQuestions = filterReviewQuestions(
    questions,
    [...missedQuestionIds],
    [...bookmarkedQuestionIds],
    reviewScope,
    selectionDomain || undefined,
  );
  const reviewQuestionCountByDomain = new Map(
    manifest.domains.map((domain) => [
      domain.slug,
      filterReviewQuestions(
        questions,
        [...missedQuestionIds],
        [...bookmarkedQuestionIds],
        reviewScope,
        domain.slug,
      ).length,
    ]),
  );
  const questionCountByDomain = new Map(
    manifest.domains.map((domain) => [
      domain.slug,
      questions.filter((question) => question.domain === domain.slug).length,
    ]),
  );
  const countLimit =
    selectionMode === "domain"
      ? domainQuestionCount
      : selectionMode === "review"
        ? reviewQuestions.length
        : questions.length;
  const parsedSelectionCount = Number(selectionCount);
  const boundedSelectionCount =
    countLimit > 0 &&
    Number.isInteger(parsedSelectionCount) &&
    parsedSelectionCount > countLimit
      ? String(countLimit)
      : selectionCount;

  function handleStart(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSessionError(null);

    if (selectionMode === "review" && reviewQuestions.length === 0) {
      setSessionError(
        "No questions match this review set and domain filter. Answer or bookmark questions first.",
      );
      return;
    }

    const count =
      selectionMode === "all" ? undefined : Number(boundedSelectionCount);
    if (
      count !== undefined &&
      (!Number.isInteger(count) || count < 1 || countLimit < 1)
    ) {
      setSessionError(
        "Enter a question count between 1 and the available total.",
      );
      return;
    }
    if (selectionMode === "domain" && !selectedDomain) {
      setSessionError("Choose a domain before starting the session.");
      return;
    }

    const config: QuizConfig = {
      mode: selectionMode,
      revealMode,
      ...(count === undefined ? {} : { count }),
      ...(selectionMode === "domain" ? { domain: selectedDomain } : {}),
      ...(selectionMode === "review"
        ? {
            ...(selectionDomain ? { domain: selectionDomain } : {}),
            reviewScope,
          }
        : {}),
    };

    try {
      const selectedQuestions = selectQuestions(
        selectionMode === "review" ? reviewQuestions : questions,
        manifest.domains,
        config,
      );
      setActiveSession({
        questions: selectedQuestions,
        config,
        startedAt: new Date().toISOString(),
      });
      setAnswers({});
      setRevealedQuestionIds(new Set());
      setQuestionIndex(0);
      setFinishError(null);
    } catch (error) {
      if (error instanceof QuizSelectionError) {
        setSessionError(error.message);
        return;
      }
      setSessionError(errorMessage(error));
    }
  }

  function handleSimulate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSessionError(null);

    if (!certSlug) {
      setSessionError(
        "A certification slug is required to simulate a session.",
      );
      return;
    }

    if (selectionMode === "review" && reviewQuestions.length === 0) {
      setSessionError(
        "No questions match this review set and domain filter. Answer or bookmark questions first.",
      );
      return;
    }

    const count =
      selectionMode === "all" ? undefined : Number(boundedSelectionCount);
    if (count !== undefined && countLimit < 1) {
      setSessionError("No questions are available for this selection.");
      return;
    }
    if (count !== undefined && (!Number.isInteger(count) || count < 1)) {
      setSessionError(
        "Enter a question count between 1 and the available total.",
      );
      return;
    }
    if (selectionMode === "domain" && !selectedDomain) {
      setSessionError("Choose a domain before starting the simulation.");
      return;
    }

    const config: QuizConfig = {
      mode: selectionMode,
      revealMode: "end",
      ...(count === undefined ? {} : { count }),
      ...(selectionMode === "domain" ? { domain: selectedDomain } : {}),
      ...(selectionMode === "review"
        ? {
            ...(selectionDomain ? { domain: selectionDomain } : {}),
            reviewScope,
          }
        : {}),
    };

    try {
      const startedAt = new Date().toISOString();
      const selectedQuestions = selectQuestions(
        selectionMode === "review" ? reviewQuestions : questions,
        manifest.domains,
        config,
      );
      const simulatedAnswers = simulateQuizAnswers(
        selectedQuestions,
        simulationPreset,
      );
      const results = calculateQuizResults(
        selectedQuestions,
        simulatedAnswers,
        manifest.domains,
      );
      const attempt: AttemptRecord = {
        id: createAttemptId(),
        cert: manifest.cert,
        startedAt,
        completedAt: new Date().toISOString(),
        config,
        questionIds: selectedQuestions.map((q) => q.id),
        answers: simulatedAnswers,
        totalQuestions: results.totalQuestions,
        answeredQuestions: results.answeredQuestions,
        correctAnswers: results.correctAnswers,
        scorePercentage: results.scorePercentage,
        domainBreakdown: results.domainBreakdown,
      };

      saveAttempt(attempt);
      recordMissedQuestionIds(
        manifest.cert,
        results.questionResults
          .filter((result) => !result.isCorrect)
          .map((result) => result.questionId),
      );
      clearMissedQuestionIds(
        manifest.cert,
        results.questionResults
          .filter((result) => result.isCorrect)
          .map((result) => result.questionId),
      );
      const query = new URLSearchParams({ attempt: attempt.id });
      void navigate(`/results/${manifest.cert}?${query.toString()}`);
    } catch (error) {
      if (error instanceof QuizSelectionError) {
        setSessionError(error.message);
        return;
      }
      setSessionError(errorMessage(error));
    }
  }

  if (!activeSession) {
    const questionSetFieldset = (
      <fieldset className="setup-fieldset">
        <legend>Question set</legend>
        <div className="selection-mode-guide">
          <ul className="selection-mode-list">
            <li>
              <strong>Weighted by blueprint:</strong> Questions sampled
              proportionally according to exam domain weights.
            </li>
            <li>
              <strong>Random subset:</strong> A randomized mix of questions
              across all domains.
            </li>
            <li>
              <strong>By domain:</strong> Practice questions focused on a single
              chosen domain.
            </li>
            <li>
              <strong>Review missed/bookmarked:</strong> Questions you
              previously answered incorrectly or flagged for review.
            </li>
            <li>
              <strong>All questions:</strong> Complete question bank in original
              order.
            </li>
          </ul>
        </div>
        <label className="form-field">
          <span>Selection mode</span>
          <select
            value={selectionMode}
            onChange={(event) =>
              setSelectionMode(event.target.value as QuestionSelectionMode)
            }
          >
            <option value="weighted">Weighted by blueprint</option>
            <option value="random">Random subset</option>
            <option value="domain">By domain</option>
            <option value="review">Review missed/bookmarked</option>
            <option value="all">All questions</option>
          </select>
        </label>

        {selectionMode === "review" && (
          <label className="form-field">
            <span>Review set</span>
            <select
              value={reviewScope}
              onChange={(event) =>
                setReviewScope(event.target.value as ReviewScope)
              }
            >
              {Object.entries(REVIEW_SCOPE_LABELS).map(([scope, label]) => (
                <option key={scope} value={scope}>
                  {label}
                </option>
              ))}
            </select>
            <small
              className="selection-summary"
              role="status"
              aria-live="polite"
            >
              {reviewQuestions.length} question
              {reviewQuestions.length === 1 ? "" : "s"} match this review set.
            </small>
          </label>
        )}

        {(selectionMode === "domain" || selectionMode === "review") && (
          <label className="form-field">
            <span>
              {selectionMode === "review" ? "Domain filter" : "Domain"}
            </span>
            <select
              required={selectionMode === "domain"}
              value={
                selectionMode === "review" ? selectionDomain : selectedDomain
              }
              onChange={(event) => setSelectionDomain(event.target.value)}
            >
              {selectionMode === "review" && (
                <option value="">All domains</option>
              )}
              {manifest.domains.map((domain) => (
                <option key={domain.slug} value={domain.slug}>
                  {`${domain.name} — ${domain.weight}% blueprint (${
                    selectionMode === "review"
                      ? (reviewQuestionCountByDomain.get(domain.slug) ?? 0)
                      : (questionCountByDomain.get(domain.slug) ?? 0)
                  } available)`}
                </option>
              ))}
            </select>
            <small>
              {selectionMode === "review"
                ? "Filter the review set by an exam domain."
                : "The domain's percentage matches the official exam blueprint."}
            </small>
          </label>
        )}

        {selectionMode !== "all" && (
          <label className="form-field">
            <span>Number of questions</span>
            <input
              type="number"
              min="1"
              max={countLimit > 0 ? countLimit : undefined}
              value={boundedSelectionCount}
              onChange={(event) => setSelectionCount(event.target.value)}
              required
            />
            <small>
              Up to {countLimit} question{countLimit === 1 ? "" : "s"} available
              for this selection
              {manifest.examQuestionCount
                ? ` (official exam has ${manifest.examQuestionCount} questions${
                    manifest.examDurationMinutes
                      ? `, ${manifest.examDurationMinutes} min`
                      : ""
                  }).`
                : "."}
            </small>
          </label>
        )}
      </fieldset>
    );

    return (
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {manifest.name}
              {manifest.examDurationMinutes
                ? ` · ${manifest.examDurationMinutes} min exam`
                : ""}
            </p>
            <h1>Set up practice</h1>
          </div>
          <Link className="text-link" to="/">
            Change certification
          </Link>
        </div>

        <div className="setup-card">
          <div
            className="setup-tab-bar"
            role="tablist"
            aria-label="Practice setup modes"
          >
            <button
              type="button"
              role="tab"
              id="tab-practice"
              aria-selected={activeTab === "practice"}
              aria-controls="panel-practice"
              className={`setup-tab ${activeTab === "practice" ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab("practice");
                setSessionError(null);
              }}
            >
              Practice
            </button>
            <button
              type="button"
              role="tab"
              id="tab-simulate"
              aria-selected={activeTab === "simulate"}
              aria-controls="panel-simulate"
              className={`setup-tab ${activeTab === "simulate" ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab("simulate");
                setSessionError(null);
              }}
            >
              Simulate
            </button>
          </div>

          {activeTab === "practice" ? (
            <form
              id="panel-practice"
              role="tabpanel"
              aria-labelledby="tab-practice"
              onSubmit={handleStart}
            >
              {questionSetFieldset}

              <fieldset className="setup-fieldset">
                <legend>Answer reveal</legend>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="reveal-mode"
                    value="immediate"
                    checked={revealMode === "immediate"}
                    onChange={() => setRevealMode("immediate")}
                  />
                  <span>
                    <strong>After each answer</strong>
                    <small>
                      See the explanation before you proceed to next question.
                    </small>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="reveal-mode"
                    value="end"
                    checked={revealMode === "end"}
                    onChange={() => setRevealMode("end")}
                  />
                  <span>
                    <strong>At the end</strong>
                    <small>
                      Review answers and explanations on the results page.
                    </small>
                  </span>
                </label>
              </fieldset>

              {sessionError && (
                <p className="form-error" role="alert">
                  {sessionError}
                </p>
              )}
              {storageError && (
                <p className="storage-note" role="alert">
                  Progress cannot be saved: {storageError}
                </p>
              )}
              <button className="button button-primary" type="submit">
                {selectionMode === "review" ? "Start review" : "Start session"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <form
              id="panel-simulate"
              role="tabpanel"
              aria-labelledby="tab-simulate"
              onSubmit={handleSimulate}
            >
              {questionSetFieldset}

              <fieldset className="setup-fieldset">
                <legend>Simulation outcome</legend>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="simulation-preset"
                    value="perfect-pass"
                    checked={simulationPreset === "perfect-pass"}
                    onChange={() => setSimulationPreset("perfect-pass")}
                  />
                  <span>
                    <strong>Perfect pass (100%)</strong>
                    <small>Answers all questions correctly.</small>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="simulation-preset"
                    value="realistic-pass"
                    checked={simulationPreset === "realistic-pass"}
                    onChange={() => setSimulationPreset("realistic-pass")}
                  />
                  <span>
                    <strong>Realistic pass (~80%)</strong>
                    <small>
                      Simulates a comfortable passing score with a few missed
                      questions.
                    </small>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="simulation-preset"
                    value="borderline-fail"
                    checked={simulationPreset === "borderline-fail"}
                    onChange={() => setSimulationPreset("borderline-fail")}
                  />
                  <span>
                    <strong>Borderline fail (~60%)</strong>
                    <small>
                      Simulates a near-passing failing score with mixed answers.
                    </small>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="simulation-preset"
                    value="complete-fail"
                    checked={simulationPreset === "complete-fail"}
                    onChange={() => setSimulationPreset("complete-fail")}
                  />
                  <span>
                    <strong>Complete fail (0%)</strong>
                    <small>Answers all questions incorrectly.</small>
                  </span>
                </label>
              </fieldset>

              {sessionError && (
                <p className="form-error" role="alert">
                  {sessionError}
                </p>
              )}
              {storageError && (
                <p className="storage-note" role="alert">
                  Progress cannot be saved: {storageError}
                </p>
              )}
              <button className="button button-primary" type="submit">
                Run simulation
                <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  const session = activeSession;
  const sessionQuestions = session.questions;
  const question = sessionQuestions[questionIndex];

  if (!question) {
    return (
      <section className="page-section">
        <div className="state-card error-card" role="alert">
          <p className="eyebrow">Session unavailable</p>
          <h1>The selected question is no longer available.</h1>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setActiveSession(null)}
          >
            Set up a new session
          </button>
        </div>
      </section>
    );
  }

  const selectedOptionIds = answers[question.id] ?? [];
  const requiredAnswerCount = question.correct.length;
  const hasRequiredSelectionCount =
    selectedOptionIds.length === requiredAnswerCount;
  const isSelectionLimitReached =
    question.type === "multi" &&
    selectedOptionIds.length >= requiredAnswerCount;
  const isRevealed =
    session.config.revealMode === "immediate" &&
    revealedQuestionIds.has(question.id);
  const isCorrect = isRevealed
    ? scoreAnswer(question, selectedOptionIds)
    : false;
  const domain = manifest.domains.find(
    (candidate) => candidate.slug === question.domain,
  );
  const isLastQuestion = questionIndex === sessionQuestions.length - 1;
  const progress = ((questionIndex + 1) / sessionQuestions.length) * 100;
  const totalDurationSeconds = (manifest.examDurationMinutes ?? 0) * 60;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((currentTime - new Date(session.startedAt).getTime()) / 1000),
  );
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const isTimeExpired = totalDurationSeconds > 0 && remainingSeconds === 0;
  const isTimeLow =
    totalDurationSeconds > 0 && remainingSeconds > 0 && remainingSeconds <= 300;
  const questionHeadingId = `question-heading-${question.id}`;
  const questionInstructionId = `question-instruction-${question.id}`;
  const canProceed =
    session.config.revealMode === "immediate"
      ? isRevealed
      : hasRequiredSelectionCount;

  function markCurrentQuestionRevealed(): void {
    setRevealedQuestionIds((current) => {
      const next = new Set(current);
      next.add(question.id);
      return next;
    });
  }

  function handleOptionChange(optionId: string): void {
    if (isRevealed) {
      return;
    }

    if (question.type === "single") {
      setAnswers((current) => ({
        ...current,
        [question.id]: [optionId],
      }));
      return;
    }

    setAnswers((current) => {
      const selected = current[question.id] ?? [];
      if (!selected.includes(optionId) && isSelectionLimitReached) {
        return current;
      }
      const nextSelection = selected.includes(optionId)
        ? selected.filter((selectedId) => selectedId !== optionId)
        : [...selected, optionId];
      return {
        ...current,
        [question.id]: nextSelection,
      };
    });
  }

  function handleCheckAnswer(): void {
    if (
      session.config.revealMode === "immediate" &&
      hasRequiredSelectionCount
    ) {
      markCurrentQuestionRevealed();
    }
  }

  function handleToggleBookmark(): void {
    if (!certSlug) {
      return;
    }

    const next = new Set(bookmarkedQuestionIds);
    if (next.has(question.id)) {
      next.delete(question.id);
    } else {
      next.add(question.id);
    }

    try {
      persistBookmarkedQuestionIds(certSlug, [...next]);
      setBookmarkedQuestionIds(next);
      setStorageError(null);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }

  function handleFinish(): void {
    if (!certSlug) {
      setFinishError("A certification slug is required to save this session.");
      return;
    }

    const results = calculateQuizResults(
      sessionQuestions,
      answers,
      manifest.domains,
    );
    const attempt: AttemptRecord = {
      id: createAttemptId(),
      cert: manifest.cert,
      startedAt: session.startedAt,
      completedAt: new Date().toISOString(),
      config: session.config,
      questionIds: sessionQuestions.map(
        (sessionQuestion) => sessionQuestion.id,
      ),
      answers: Object.fromEntries(
        Object.entries(answers).map(([questionId, selected]) => [
          questionId,
          [...selected],
        ]),
      ),
      totalQuestions: results.totalQuestions,
      answeredQuestions: results.answeredQuestions,
      correctAnswers: results.correctAnswers,
      scorePercentage: results.scorePercentage,
      domainBreakdown: results.domainBreakdown,
    };

    try {
      saveAttempt(attempt);
      recordMissedQuestionIds(
        manifest.cert,
        results.questionResults
          .filter((result) => !result.isCorrect)
          .map((result) => result.questionId),
      );
      clearMissedQuestionIds(
        manifest.cert,
        results.questionResults
          .filter((result) => result.isCorrect)
          .map((result) => result.questionId),
      );
      const query = new URLSearchParams({ attempt: attempt.id });
      void navigate(`/results/${manifest.cert}?${query.toString()}`);
    } catch (error) {
      setFinishError(errorMessage(error));
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {manifest.name}
            {manifest.examDurationMinutes
              ? ` · ${manifest.examDurationMinutes} min exam`
              : ""}
          </p>
          <h1>Practice session</h1>
        </div>
        <Link className="text-link" to="/">
          Change certification
        </Link>
      </div>

      <div
        className="progress-block"
        aria-label={`Question ${questionIndex + 1} of ${sessionQuestions.length}`}
      >
        <div className="progress-label" aria-live="polite">
          <span>
            Question <strong>{questionIndex + 1}</strong> of{" "}
            {sessionQuestions.length}
          </span>
          {manifest.examDurationMinutes ? (
            <span
              className={`timer-badge ${isTimeExpired ? "is-expired" : isTimeLow ? "is-warning" : ""}`}
              role="timer"
              aria-label={`Time remaining: ${formatRemainingTime(remainingSeconds)}`}
            >
              <span aria-hidden="true">⏱</span>
              <span>
                {isTimeExpired ? (
                  <strong>Time expired (00:00)</strong>
                ) : (
                  <>
                    Time left:{" "}
                    <strong>{formatRemainingTime(remainingSeconds)}</strong>
                  </>
                )}
              </span>
            </span>
          ) : null}
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={`Question ${questionIndex + 1} of ${sessionQuestions.length}`}
        >
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article className="question-card" aria-labelledby={questionHeadingId}>
        <div className="question-card-header">
          <div className="question-meta">
            <span>{domain?.name ?? question.domain}</span>
            <span>{question.difficulty}</span>
            <span>
              {question.type === "multi"
                ? "Multiple response"
                : "Single response"}
            </span>
          </div>
          <button
            className="bookmark-button button button-secondary"
            type="button"
            aria-pressed={bookmarkedQuestionIds.has(question.id)}
            aria-label={
              bookmarkedQuestionIds.has(question.id)
                ? `Remove bookmark from question ${questionIndex + 1}`
                : `Bookmark question ${questionIndex + 1}`
            }
            onClick={handleToggleBookmark}
          >
            {bookmarkedQuestionIds.has(question.id) ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
        <fieldset
          className="answer-option-list"
          disabled={isRevealed}
          aria-describedby={questionInstructionId}
        >
          <legend className="question-stem" id={questionHeadingId}>
            {question.stem}
          </legend>
          <p id={questionInstructionId} className="question-instruction">
            Select {answerCountLabel(question.correct.length)} answer
            {question.correct.length === 1 ? "" : "s"}.
            {session.config.revealMode === "end" &&
              " Answers and explanations appear after you finish."}
          </p>
          {question.options.map((option) => {
            const selected = selectedOptionIds.includes(option.id);
            const correct = isRevealed && question.correct.includes(option.id);
            const incorrect = isRevealed && selected && !correct;
            const optionDisabled =
              !isRevealed && !selected && isSelectionLimitReached;
            return (
              <label
                className={[
                  "answer-option",
                  selected ? "is-selected" : "",
                  correct ? "is-correct" : "",
                  incorrect ? "is-incorrect" : "",
                  optionDisabled ? "is-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={option.id}
              >
                <input
                  type={question.type === "multi" ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.id}
                  checked={selected}
                  disabled={optionDisabled}
                  onChange={() => handleOptionChange(option.id)}
                />
                <span className="option-id" aria-hidden="true">
                  {option.id.toUpperCase()}
                </span>
                <span>{option.text}</span>
              </label>
            );
          })}
        </fieldset>

        {isRevealed && (
          <div
            className={`answer-feedback ${
              isCorrect ? "is-correct" : "is-incorrect"
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong>{isCorrect ? "Correct." : "Not quite."}</strong>
            <p>
              <strong>Correct answer:</strong>{" "}
              {question.correct
                .map((optionId) => optionId.toUpperCase())
                .join(", ")}
            </p>
            <p>{question.explanation}</p>
            <p className="source-note">
              <a href={question.sourceUrl} target="_blank" rel="noreferrer">
                Source: {question.sourceNote}
              </a>
            </p>
          </div>
        )}
      </article>

      {storageError && (
        <p className="storage-note" role="alert">
          Progress cannot be saved: {storageError}
        </p>
      )}
      {finishError && (
        <p className="form-error" role="alert">
          {finishError}
        </p>
      )}

      <div className="quiz-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setQuestionIndex((value) => Math.max(0, value - 1))}
          disabled={questionIndex === 0}
        >
          Previous
        </button>
        <div className="quiz-actions-forward">
          {session.config.revealMode === "immediate" && !isRevealed && (
            <button
              className="button button-secondary"
              type="button"
              onClick={handleCheckAnswer}
              disabled={!hasRequiredSelectionCount}
            >
              Check answer
            </button>
          )}
          {isLastQuestion ? (
            <button
              className="button button-primary"
              type="button"
              onClick={handleFinish}
              disabled={!canProceed}
            >
              Finish session
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              className="button button-primary"
              type="button"
              onClick={() =>
                setQuestionIndex((value) =>
                  Math.min(sessionQuestions.length - 1, value + 1),
                )
              }
              disabled={!canProceed}
            >
              Next question
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
