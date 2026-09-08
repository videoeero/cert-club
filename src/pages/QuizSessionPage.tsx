import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ErrorState,
  LoadingState,
  QuizActions,
  QuizProgress,
  QuizQuestion,
  QuizSetupForm,
} from "../components";
import pageStatusStyles from "../components/PageStatus.module.css";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertContent } from "../lib/content";
import styles from "./QuizSessionPage.module.css";
import {
  calculateQuizResults,
  prepareRetakeSession,
  selectQuizOption,
  toggleStrikethroughOption,
} from "../lib/quiz";
import {
  clearMissedQuestionIds,
  getAttempt,
  getBookmarkedQuestionIds,
  getMissedQuestionIds,
  getPreferences,
  recordMissedQuestionIds,
  saveAttempt,
  setBookmarkedQuestionIds as persistBookmarkedQuestionIds,
  setPreferences as persistPreferences,
} from "../lib/storage";
import type {
  Question,
  QuizConfig,
  RetakeNavigationState,
  ScopeFilter,
} from "../types";

interface ActiveSession {
  questions: Question[];
  config: QuizConfig;
  startedAt: string;
}

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

const createAttemptId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function QuizSessionPage() {
  const { certSlug } = useParams<{ certSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const retakeKeyHandledRef = useRef<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [strikethroughs, setStrikethroughs] = useState<
    Record<string, string[]>
  >({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState(
    new Set<string>(),
  );
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState(
    new Set<string>(),
  );
  const [missedQuestionIds, setMissedQuestionIds] = useState(new Set<string>());
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("core-only");
  const [storageError, setStorageError] = useState<string | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);
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
    setStrikethroughs({});
    setRevealedQuestionIds(new Set());
    setFinishError(null);
    setStorageError(null);
    setRetakeError(null);
    if (!certSlug) {
      setBookmarkedQuestionIds(new Set());
      setMissedQuestionIds(new Set());
      return;
    }
    try {
      setBookmarkedQuestionIds(new Set(getBookmarkedQuestionIds(certSlug)));
      setMissedQuestionIds(new Set(getMissedQuestionIds(certSlug)));
      setScopeFilter(getPreferences().scopeFilter);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }, [certSlug, retryKey]);

  useEffect(() => {
    if (!activeSession) return;
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const certContent = resource.status === "ready" ? resource.data : null;

  useEffect(() => {
    if (!certContent || !certSlug) return;
    const state = location.state as RetakeNavigationState | null;

    if (!state?.retake) return;

    const retakeKey = `${state.retake.attemptId}:${state.retake.mode}`;
    if (retakeKeyHandledRef.current === retakeKey) return;
    retakeKeyHandledRef.current = retakeKey;

    try {
      const attempt =
        state.retake.attempt ?? getAttempt(certSlug, state.retake.attemptId);
      if (!attempt) {
        throw new Error("The previous session could not be found.");
      }
      const reviewContext = state.retake.reviewContext ?? {
        missedQuestionIds: [...missedQuestionIds],
        bookmarkedQuestionIds: [...bookmarkedQuestionIds],
      };
      const session = prepareRetakeSession(
        certContent.questions,
        certContent.manifest.domains,
        attempt,
        state.retake.mode,
        Math.random,
        reviewContext,
      );
      setActiveSession({
        questions: session.questions,
        config: session.config,
        startedAt: new Date().toISOString(),
      });
      setAnswers({});
      setStrikethroughs({});
      setRevealedQuestionIds(new Set());
      setQuestionIndex(0);
      setFinishError(null);
      setRetakeError(null);
      void navigate(".", { replace: true, state: null });
    } catch (error) {
      setRetakeError(errorMessage(error));
      void navigate(".", { replace: true, state: null });
    }
  }, [
    certContent,
    certSlug,
    location.state,
    missedQuestionIds,
    bookmarkedQuestionIds,
    navigate,
  ]);

  if (resource.status !== "ready") {
    return (
      <section className="page-section">
        {resource.status === "loading" ? (
          <LoadingState message="Loading the question bank..." />
        ) : (
          <ErrorState
            error={resource.error}
            onRetry={() => setRetryKey((v) => v + 1)}
          />
        )}
      </section>
    );
  }

  const { manifest, questions } = resource.data;
  if (questions.length === 0) {
    return (
      <section className="page-section">
        <div
          className={`${pageStatusStyles.stateCard} ${pageStatusStyles.errorCard}`}
          role="alert"
        >
          <p className="eyebrow">Empty question bank</p>
          <h1>No questions are available yet.</h1>
          <Link className="button button-secondary" to="/">
            Back to certifications
          </Link>
        </div>
      </section>
    );
  }

  const certEyebrow = `${manifest.name}${manifest.examDurationMinutes ? ` · ${manifest.examDurationMinutes} min exam` : ""}`;

  function completeAttempt(
    cfg: QuizConfig,
    qs: Question[],
    ans: Record<string, string[]>,
    startedAt: string,
  ): void {
    const results = calculateQuizResults(qs, ans, manifest.domains);
    const id = createAttemptId();
    saveAttempt({
      id,
      cert: manifest.cert,
      startedAt,
      completedAt: new Date().toISOString(),
      config: cfg,
      questionIds: qs.map((q) => q.id),
      answers: ans,
      totalQuestions: results.totalQuestions,
      answeredQuestions: results.answeredQuestions,
      correctAnswers: results.correctAnswers,
      scorePercentage: results.scorePercentage,
      domainBreakdown: results.domainBreakdown,
    });
    const missed: string[] = [];
    const correct: string[] = [];
    for (const r of results.questionResults) {
      (r.isCorrect ? correct : missed).push(r.questionId);
    }
    recordMissedQuestionIds(manifest.cert, missed);
    clearMissedQuestionIds(manifest.cert, correct);
    void navigate(`/results/${manifest.cert}?attempt=${id}`);
  }

  if (!activeSession) {
    const hasPendingRetake =
      Boolean((location.state as RetakeNavigationState | null)?.retake) &&
      !retakeError &&
      !storageError;
    if (hasPendingRetake) {
      return (
        <section className="page-section">
          <LoadingState message="Starting retake session..." />
        </section>
      );
    }

    return (
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{certEyebrow}</p>
            <h1>Set up practice</h1>
          </div>
          <Link className="text-link" to="/">
            Change certification
          </Link>
        </div>
        {retakeError && (
          <p
            id="retake-session-error"
            className={styles.formError}
            role="alert"
          >
            Failed to start retake session: {retakeError}
          </p>
        )}
        <QuizSetupForm
          manifest={manifest}
          questions={questions}
          certSlug={certSlug ?? ""}
          bookmarkedQuestionIds={bookmarkedQuestionIds}
          missedQuestionIds={missedQuestionIds}
          scopeFilter={scopeFilter}
          onScopeFilterChange={(next) => {
            setScopeFilter(next);
            try {
              persistPreferences({ scopeFilter: next });
            } catch (error) {
              setStorageError(errorMessage(error));
            }
          }}
          storageError={storageError}
          onStartSession={(qs, config) => {
            setActiveSession({
              questions: qs,
              config,
              startedAt: new Date().toISOString(),
            });
            setAnswers({});
            setStrikethroughs({});
            setRevealedQuestionIds(new Set());
            setQuestionIndex(0);
            setFinishError(null);
            setRetakeError(null);
          }}
          onCompleteAttempt={(config, qs, ans) =>
            completeAttempt(config, qs, ans, new Date().toISOString())
          }
        />
      </section>
    );
  }

  const { config, questions: sessionQuestions, startedAt } = activeSession;
  const question = sessionQuestions[questionIndex];
  if (!question) {
    return (
      <section className="page-section">
        <div
          className={`${pageStatusStyles.stateCard} ${pageStatusStyles.errorCard}`}
          role="alert"
        >
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
  const isRevealed =
    config.revealMode === "immediate" && revealedQuestionIds.has(question.id);
  const domain = manifest.domains.find((d) => d.slug === question.domain);
  const canProceed =
    config.revealMode === "immediate" ? isRevealed : hasRequiredSelectionCount;

  const questionStrikethroughs = strikethroughs[question.id] ?? [];

  function handleOptionChange(optionId: string): void {
    if (isRevealed) return;
    const { selectedOptionIds: nextSelected, struckOptionIds: nextStruck } =
      selectQuizOption(
        selectedOptionIds,
        questionStrikethroughs,
        optionId,
        question.type,
        requiredAnswerCount,
      );
    setAnswers((prev) => ({ ...prev, [question.id]: nextSelected }));
    setStrikethroughs((prev) => ({ ...prev, [question.id]: nextStruck }));
  }

  function handleToggleStrikethrough(optionId: string): void {
    if (isRevealed) return;
    const { selectedOptionIds: nextSelected, struckOptionIds: nextStruck } =
      toggleStrikethroughOption(
        selectedOptionIds,
        questionStrikethroughs,
        optionId,
      );
    setAnswers((prev) => ({ ...prev, [question.id]: nextSelected }));
    setStrikethroughs((prev) => ({ ...prev, [question.id]: nextStruck }));
  }

  function handleFinish(): void {
    if (!certSlug) {
      setFinishError("A certification slug is required to save this session.");
      return;
    }
    try {
      completeAttempt(config, sessionQuestions, answers, startedAt);
    } catch (error) {
      setFinishError(errorMessage(error));
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{certEyebrow}</p>
          <h1>Practice session</h1>
        </div>
        <Link className="text-link" to="/">
          Change certification
        </Link>
      </div>

      <QuizProgress
        currentIndex={questionIndex}
        totalQuestions={sessionQuestions.length}
        examDurationMinutes={manifest.examDurationMinutes}
        startedAt={startedAt}
        currentTime={currentTime}
      />

      <QuizQuestion
        question={question}
        questionIndex={questionIndex}
        domainName={domain?.name}
        isBookmarked={bookmarkedQuestionIds.has(question.id)}
        selectedOptionIds={selectedOptionIds}
        struckOptionIds={questionStrikethroughs}
        isRevealed={isRevealed}
        revealMode={config.revealMode}
        onToggleBookmark={() => {
          if (!certSlug) return;
          const next = new Set(bookmarkedQuestionIds);
          if (!next.delete(question.id)) next.add(question.id);
          try {
            persistBookmarkedQuestionIds(certSlug, [...next]);
            setBookmarkedQuestionIds(next);
            setStorageError(null);
          } catch (error) {
            setStorageError(errorMessage(error));
          }
        }}
        onOptionChange={handleOptionChange}
        onToggleStrikethrough={handleToggleStrikethrough}
      />

      {storageError && (
        <p
          id="session-storage-error"
          className={styles.storageNote}
          role="alert"
        >
          Progress cannot be saved: {storageError}
        </p>
      )}
      {finishError && (
        <p id="session-finish-error" className={styles.formError} role="alert">
          {finishError}
        </p>
      )}

      <QuizActions
        isFirstQuestion={questionIndex === 0}
        isLastQuestion={questionIndex === sessionQuestions.length - 1}
        canCheckAnswer={config.revealMode === "immediate" && !isRevealed}
        hasRequiredSelectionCount={hasRequiredSelectionCount}
        canProceed={canProceed}
        finishDescribedById={
          [
            storageError ? "session-storage-error" : "",
            finishError ? "session-finish-error" : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onPrevious={() => setQuestionIndex((v) => Math.max(0, v - 1))}
        onNext={() =>
          setQuestionIndex((v) => Math.min(sessionQuestions.length - 1, v + 1))
        }
        onCheckAnswer={() => {
          if (config.revealMode === "immediate" && hasRequiredSelectionCount) {
            setRevealedQuestionIds((prev) => new Set(prev).add(question.id));
          }
        }}
        onFinish={handleFinish}
      />
    </section>
  );
}
