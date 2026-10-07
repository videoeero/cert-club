import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  DraftNotice,
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
  applyOptionOrder,
  calculateQuizResults,
  prepareRetakeSession,
  selectQuizOption,
  toggleStrikethroughOption,
} from "../lib/quiz";
import {
  clearMissedQuestionIds,
  clearPausedSession,
  getAttempt,
  getBookmarkedQuestionIds,
  getMissedQuestionIds,
  getPausedSession,
  recordMissedQuestionIds,
  saveAttempt,
  savePausedSession,
  setBookmarkedQuestionIds as persistBookmarkedQuestionIds,
} from "../lib/storage";
import { formatCalendarDate, formatRemainingTime } from "../lib/time";
import type {
  PausedSession,
  Question,
  QuizConfig,
  RetakeNavigationState,
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
  const [hintRevealedQuestionIds, setHintRevealedQuestionIds] = useState(
    new Set<string>(),
  );
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState(
    new Set<string>(),
  );
  const [missedQuestionIds, setMissedQuestionIds] = useState(new Set<string>());
  const [isPaused, setIsPaused] = useState(false);
  const [savedPausedSession, setSavedPausedSession] =
    useState<PausedSession | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
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
    setIsPaused(false);
    setSavedPausedSession(null);
    setAnswers({});
    setStrikethroughs({});
    setRevealedQuestionIds(new Set());
    setHintRevealedQuestionIds(new Set());
    setFinishError(null);
    setStorageError(null);
    setRetakeError(null);
    setResumeError(null);
    if (!certSlug) {
      setBookmarkedQuestionIds(new Set());
      setMissedQuestionIds(new Set());
      return;
    }
    try {
      setBookmarkedQuestionIds(new Set(getBookmarkedQuestionIds(certSlug)));
      setMissedQuestionIds(new Set(getMissedQuestionIds(certSlug)));
      setSavedPausedSession(getPausedSession(certSlug));
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }, [certSlug, retryKey]);

  useEffect(() => {
    if (!activeSession || isPaused) return;
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession, isPaused]);

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
      try {
        clearPausedSession(certSlug);
      } catch {
        // Non-blocking
      }
      setSavedPausedSession(null);
      setIsPaused(false);
      setActiveSession({
        questions: session.questions,
        config: session.config,
        startedAt: new Date().toISOString(),
      });
      setAnswers({});
      setStrikethroughs({});
      setRevealedQuestionIds(new Set());
      setHintRevealedQuestionIds(new Set());
      setQuestionIndex(0);
      setFinishError(null);
      setRetakeError(null);
      setResumeError(null);
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
    const optionOrders = Object.fromEntries(
      qs.map((q) => [q.id, q.options.map((opt) => opt.id)]),
    );
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
      optionOrders,
    });
    const missed: string[] = [];
    const correct: string[] = [];
    for (const r of results.questionResults) {
      (r.isCorrect ? correct : missed).push(r.questionId);
    }
    recordMissedQuestionIds(manifest.cert, missed);
    clearMissedQuestionIds(manifest.cert, correct);
    try {
      clearPausedSession(manifest.cert);
    } catch {
      // Non-blocking
    }
    setSavedPausedSession(null);
    void navigate(`/results/${manifest.cert}?attempt=${id}`);
  }

  function handlePause(): void {
    if (!activeSession || !certSlug) return;
    const elapsedSeconds = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000,
      ),
    );
    const optionOrders = Object.fromEntries(
      activeSession.questions.map((q) => [
        q.id,
        q.options.map((opt) => opt.id),
      ]),
    );
    const sessionToSave: PausedSession = {
      cert: certSlug,
      startedAt: activeSession.startedAt,
      pausedAt: new Date().toISOString(),
      elapsedSeconds,
      config: activeSession.config,
      questionIds: activeSession.questions.map((q) => q.id),
      questionIndex,
      answers,
      strikethroughs,
      revealedQuestionIds: [...revealedQuestionIds],
      hintRevealedQuestionIds: [...hintRevealedQuestionIds],
      optionOrders,
    };
    try {
      savePausedSession(certSlug, sessionToSave);
      setSavedPausedSession(sessionToSave);
      setIsPaused(true);
      setStorageError(null);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }

  function handleResumeActive(): void {
    if (!activeSession) return;
    const elapsedSeconds =
      savedPausedSession?.elapsedSeconds ??
      Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000,
        ),
      );
    const adjustedStartedAt = new Date(
      Date.now() - elapsedSeconds * 1000,
    ).toISOString();
    setActiveSession((prev) =>
      prev ? { ...prev, startedAt: adjustedStartedAt } : null,
    );
    setCurrentTime(Date.now());
    setIsPaused(false);
  }

  function handleResumeSaved(sessionToResume: PausedSession): void {
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const matchedQuestions = sessionToResume.questionIds
      .map((id) => {
        const q = questionMap.get(id);
        if (!q) return undefined;
        const order = sessionToResume.optionOrders?.[id];
        return order ? applyOptionOrder(q, order) : q;
      })
      .filter((q): q is Question => q !== undefined);

    if (matchedQuestions.length === 0) {
      setResumeError(
        "Questions from this paused session are no longer available in the question bank.",
      );
      return;
    }

    const matchedIds = new Set(matchedQuestions.map((q) => q.id));
    const filteredAnswers = Object.fromEntries(
      Object.entries(sessionToResume.answers).filter(([qid]) =>
        matchedIds.has(qid),
      ),
    );
    const filteredStrikethroughs = Object.fromEntries(
      Object.entries(sessionToResume.strikethroughs).filter(([qid]) =>
        matchedIds.has(qid),
      ),
    );
    const filteredRevealed = sessionToResume.revealedQuestionIds.filter((qid) =>
      matchedIds.has(qid),
    );
    const filteredHints = sessionToResume.hintRevealedQuestionIds.filter(
      (qid) => matchedIds.has(qid),
    );

    const adjustedStartedAt = new Date(
      Date.now() - sessionToResume.elapsedSeconds * 1000,
    ).toISOString();
    setActiveSession({
      questions: matchedQuestions,
      config: sessionToResume.config,
      startedAt: adjustedStartedAt,
    });
    setAnswers(filteredAnswers);
    setStrikethroughs(filteredStrikethroughs);
    setRevealedQuestionIds(new Set(filteredRevealed));
    setHintRevealedQuestionIds(new Set(filteredHints));
    setQuestionIndex(
      Math.min(sessionToResume.questionIndex, matchedQuestions.length - 1),
    );
    setIsPaused(false);
    setCurrentTime(Date.now());
    setResumeError(null);

    if (certSlug) {
      try {
        clearPausedSession(certSlug);
      } catch {
        // Non-blocking
      }
    }
    setSavedPausedSession(null);
  }

  function handleDiscardPausedSession(): void {
    if (!certSlug) return;
    try {
      clearPausedSession(certSlug);
      setSavedPausedSession(null);
      setActiveSession(null);
      setIsPaused(false);
      setStorageError(null);
      setResumeError(null);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
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
        {manifest.status === "draft" && <DraftNotice />}
        {retakeError && (
          <p
            id="retake-session-error"
            className={styles.formError}
            role="alert"
          >
            Failed to start retake session: {retakeError}
          </p>
        )}
        {savedPausedSession && (
          <div className={styles.pausedCard}>
            <div className={styles.pausedHeader}>
              <span className={styles.pausedChip}>Paused session</span>
            </div>
            <h2 className={styles.pausedTitle}>Resume your practice session</h2>
            <p className={styles.pausedDetails}>
              You have an in-progress session paused on this device
              {savedPausedSession.pausedAt
                ? ` from ${formatCalendarDate(savedPausedSession.pausedAt.slice(0, 10))}`
                : ""}
              .
            </p>
            <dl className={styles.pausedMetaList}>
              <div className={styles.pausedMetaItem}>
                <dt>Progress</dt>
                <dd>
                  Question {savedPausedSession.questionIndex + 1} of{" "}
                  {savedPausedSession.questionIds.length}
                </dd>
              </div>
              <div className={styles.pausedMetaItem}>
                <dt>Answered</dt>
                <dd>
                  {
                    Object.values(savedPausedSession.answers).filter(
                      (s) => s.length > 0,
                    ).length
                  }{" "}
                  of {savedPausedSession.questionIds.length}
                </dd>
              </div>
              <div className={styles.pausedMetaItem}>
                <dt>Active time used</dt>
                <dd>
                  {formatRemainingTime(savedPausedSession.elapsedSeconds)}
                </dd>
              </div>
            </dl>
            {resumeError && (
              <p className={styles.formError} role="alert">
                {resumeError}
              </p>
            )}
            <div className={styles.pausedActions}>
              <button
                className="button button-primary"
                type="button"
                onClick={() => handleResumeSaved(savedPausedSession)}
              >
                Resume session
                <span aria-hidden="true">→</span>
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={handleDiscardPausedSession}
              >
                Discard and start new
              </button>
            </div>
          </div>
        )}
        <QuizSetupForm
          manifest={manifest}
          questions={questions}
          certSlug={certSlug ?? ""}
          bookmarkedQuestionIds={bookmarkedQuestionIds}
          missedQuestionIds={missedQuestionIds}
          storageError={storageError}
          onStartSession={(qs, config) => {
            if (certSlug) {
              try {
                clearPausedSession(certSlug);
              } catch {
                // Non-blocking
              }
              setSavedPausedSession(null);
            }
            setActiveSession({
              questions: qs,
              config,
              startedAt: new Date().toISOString(),
            });
            setIsPaused(false);
            setAnswers({});
            setStrikethroughs({});
            setRevealedQuestionIds(new Set());
            setHintRevealedQuestionIds(new Set());
            setQuestionIndex(0);
            setFinishError(null);
            setRetakeError(null);
            setResumeError(null);
          }}
          onCompleteAttempt={(config, qs, ans) =>
            completeAttempt(config, qs, ans, new Date().toISOString())
          }
        />
      </section>
    );
  }

  if (activeSession && isPaused) {
    const answeredCount = Object.values(answers).filter(
      (selected) => selected.length > 0,
    ).length;
    const elapsedSeconds = savedPausedSession?.elapsedSeconds ?? 0;
    const totalExamSeconds = (manifest.examDurationMinutes ?? 0) * 60;
    const remainingSeconds = Math.max(0, totalExamSeconds - elapsedSeconds);

    return (
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{certEyebrow}</p>
            <h1>Practice paused</h1>
          </div>
          <Link className="text-link" to="/">
            Change certification
          </Link>
        </div>

        <div className={styles.pausedCard}>
          <div className={styles.pausedHeader}>
            <span className={styles.pausedChip}>Paused</span>
            {manifest.status === "draft" && <DraftNotice />}
          </div>
          <h2 className={styles.pausedTitle}>Practice session paused</h2>
          <p className={styles.pausedDetails}>
            Your progress is saved on this device. You can safely close your
            browser or take a break and resume whenever you are ready.
          </p>

          <dl className={styles.pausedMetaList}>
            <div className={styles.pausedMetaItem}>
              <dt>Current position</dt>
              <dd>
                Question {questionIndex + 1} of {activeSession.questions.length}
              </dd>
            </div>
            <div className={styles.pausedMetaItem}>
              <dt>Answered</dt>
              <dd>
                {answeredCount} of {activeSession.questions.length}
              </dd>
            </div>
            <div className={styles.pausedMetaItem}>
              <dt>Active time</dt>
              <dd>{formatRemainingTime(elapsedSeconds)}</dd>
            </div>
            {manifest.examDurationMinutes ? (
              <div className={styles.pausedMetaItem}>
                <dt>Time remaining</dt>
                <dd>{formatRemainingTime(remainingSeconds)}</dd>
              </div>
            ) : null}
          </dl>

          <div className={styles.pausedActions}>
            <button
              className="button button-primary"
              type="button"
              onClick={handleResumeActive}
            >
              Resume session
              <span aria-hidden="true">→</span>
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleDiscardPausedSession}
            >
              Discard session
            </button>
            <Link className="button button-secondary" to="/">
              Back to certifications
            </Link>
          </div>
        </div>
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

  function handleToggleHint(): void {
    setHintRevealedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
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
        isHintRevealed={hintRevealedQuestionIds.has(question.id)}
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
        onToggleHint={handleToggleHint}
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
        onPause={handlePause}
      />
    </section>
  );
}
