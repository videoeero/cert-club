import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertContent } from "../lib/content";
import {
  answerCountLabel,
  calculateQuizResults,
  scoreAnswer,
  selectQuestions,
  QuizSelectionError,
} from "../lib/quiz";
import {
  getBookmarkedQuestionIds,
  recordMissedQuestionIds,
  saveAttempt,
  setBookmarkedQuestionIds as persistBookmarkedQuestionIds,
} from "../lib/storage";
import type {
  AttemptRecord,
  Question,
  QuestionSelectionMode,
  QuizConfig,
  RevealMode,
} from "../types";

interface ActiveSession {
  questions: Question[];
  config: QuizConfig;
  startedAt: string;
}

const DEFAULT_SELECTION_MODE: QuestionSelectionMode = "random";
const DEFAULT_QUESTION_COUNT = "10";
const DEFAULT_REVEAL_MODE: RevealMode = "immediate";

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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState<QuestionSelectionMode>(
    DEFAULT_SELECTION_MODE,
  );
  const [selectionDomain, setSelectionDomain] = useState("");
  const [selectionCount, setSelectionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [revealMode, setRevealMode] = useState<RevealMode>(DEFAULT_REVEAL_MODE);
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
    setSessionError(null);
    setFinishError(null);

    if (!certSlug) {
      setBookmarkedQuestionIds(new Set());
      return;
    }

    try {
      setBookmarkedQuestionIds(new Set(getBookmarkedQuestionIds(certSlug)));
      setStorageError(null);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }, [certSlug, retryKey]);

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
  const questionCountByDomain = new Map(
    manifest.domains.map((domain) => [
      domain.slug,
      questions.filter((question) => question.domain === domain.slug).length,
    ]),
  );
  const countLimit =
    selectionMode === "domain" ? domainQuestionCount : questions.length;

  function handleStart(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSessionError(null);

    const count = selectionMode === "all" ? undefined : Number(selectionCount);
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
    };

    try {
      const selectedQuestions = selectQuestions(
        questions,
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

  if (!activeSession) {
    return (
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{manifest.name}</p>
            <h1>Set up practice</h1>
          </div>
          <Link className="text-link" to="/">
            Change certification
          </Link>
        </div>

        <article className="setup-card">
          <form onSubmit={handleStart}>
            <fieldset className="setup-fieldset">
              <legend>Question set</legend>
              <label className="form-field">
                <span>Selection mode</span>
                <select
                  value={selectionMode}
                  onChange={(event) =>
                    setSelectionMode(
                      event.target.value as QuestionSelectionMode,
                    )
                  }
                >
                  <option value="random">Random subset</option>
                  <option value="weighted">Weighted by blueprint</option>
                  <option value="domain">By domain</option>
                  <option value="all">All questions</option>
                </select>
              </label>

              {selectionMode === "domain" && (
                <label className="form-field">
                  <span>Domain</span>
                  <select
                    required
                    value={selectedDomain}
                    onChange={(event) => setSelectionDomain(event.target.value)}
                  >
                    {manifest.domains.map((domain) => (
                      <option key={domain.slug} value={domain.slug}>
                        {`${domain.name} (${
                          questionCountByDomain.get(domain.slug) ?? 0
                        } available)`}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectionMode !== "all" && (
                <label className="form-field">
                  <span>Number of questions</span>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, countLimit)}
                    value={selectionCount}
                    onChange={(event) => setSelectionCount(event.target.value)}
                    required
                  />
                  <small>
                    Up to {countLimit} question{countLimit === 1 ? "" : "s"}{" "}
                    available for this selection.
                  </small>
                </label>
              )}
            </fieldset>

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
                  <small>See the explanation as soon as you submit.</small>
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
              Start session
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </article>
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
      if (session.config.revealMode === "immediate") {
        markCurrentQuestionRevealed();
      }
      return;
    }

    setAnswers((current) => {
      const selected = current[question.id] ?? [];
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
      question.type === "multi" &&
      session.config.revealMode === "immediate" &&
      selectedOptionIds.length > 0
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
          <p className="eyebrow">{manifest.name}</p>
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
        <div className="progress-label">
          <span>
            Question <strong>{questionIndex + 1}</strong> of{" "}
            {sessionQuestions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article className="question-card">
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
            onClick={handleToggleBookmark}
          >
            {bookmarkedQuestionIds.has(question.id) ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
        <h2>{question.stem}</h2>
        <p className="question-instruction">
          Select {answerCountLabel(question.correct.length)} answer
          {question.correct.length === 1 ? "" : "s"}.
          {session.config.revealMode === "end" &&
            " Answers and explanations appear after you finish."}
        </p>
        <fieldset
          className="answer-option-list"
          disabled={isRevealed}
          aria-label="Answer options"
        >
          <legend className="sr-only">Answer options</legend>
          {question.options.map((option) => {
            const selected = selectedOptionIds.includes(option.id);
            const correct = isRevealed && question.correct.includes(option.id);
            const incorrect = isRevealed && selected && !correct;
            return (
              <label
                className={[
                  "answer-option",
                  selected ? "is-selected" : "",
                  correct ? "is-correct" : "",
                  incorrect ? "is-incorrect" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={option.id}
                htmlFor={`${question.id}-${option.id}`}
              >
                <input
                  id={`${question.id}-${option.id}`}
                  type={question.type === "multi" ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.id}
                  checked={selected}
                  onChange={() => handleOptionChange(option.id)}
                />
                <span className="option-id">{option.id.toUpperCase()}</span>
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
        {question.type === "multi" &&
          session.config.revealMode === "immediate" &&
          !isRevealed && (
            <button
              className="button button-secondary"
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOptionIds.length === 0}
            >
              Check answer
            </button>
          )}
        {isLastQuestion ? (
          <button
            className="button button-primary"
            type="button"
            onClick={handleFinish}
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
          >
            Next question
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
