import { useEffect, useRef, useState, type FormEvent } from "react";

import styles from "./QuizSetupForm.module.css";
import {
  filterReviewQuestions,
  selectQuestions,
  simulateQuizAnswers,
  QuizSelectionError,
} from "../lib/quiz";
import type {
  Manifest,
  Question,
  QuestionSelectionMode,
  QuizConfig,
  ReviewScope,
  RevealMode,
  SimulationPreset,
} from "../types";

const DEFAULT_SELECTION_MODE: QuestionSelectionMode = "weighted";
const DEFAULT_QUESTION_COUNT = "10";
const DEFAULT_REVEAL_MODE: RevealMode = "immediate";
const DEFAULT_REVIEW_SCOPE: ReviewScope = "missed-or-bookmarked";

const REVIEW_SCOPE_LABELS: Record<ReviewScope, string> = {
  missed: "Missed questions",
  bookmarked: "Bookmarked questions",
  "missed-or-bookmarked": "Missed or bookmarked",
};

interface QuestionSetFieldsetProps {
  manifest: Manifest;
  selectionMode: QuestionSelectionMode;
  onSelectionModeChange: (mode: QuestionSelectionMode) => void;
  selectionDomain: string;
  onSelectionDomainChange: (domain: string) => void;
  selectedDomain: string;
  onSelectionCountChange: (count: string) => void;
  boundedSelectionCount: string;
  countLimit: number;
  reviewScope: ReviewScope;
  onReviewScopeChange: (scope: ReviewScope) => void;
  reviewQuestionsCount: number;
  reviewQuestionCountByDomain: Map<string, number>;
  questionCountByDomain: Map<string, number>;
}

function QuestionSetFieldset({
  manifest,
  selectionMode,
  onSelectionModeChange,
  selectionDomain,
  onSelectionDomainChange,
  selectedDomain,
  onSelectionCountChange,
  boundedSelectionCount,
  countLimit,
  reviewScope,
  onReviewScopeChange,
  reviewQuestionsCount,
  reviewQuestionCountByDomain,
  questionCountByDomain,
}: QuestionSetFieldsetProps) {
  return (
    <fieldset className={styles.setupFieldset}>
      <legend>Question set</legend>
      <div className={styles.selectionModeGuide}>
        <ul className={styles.selectionModeList}>
          <li>
            <strong>Weighted by blueprint:</strong> Questions sampled
            proportionally according to exam domain weights.
          </li>
          <li>
            <strong>Random subset:</strong> A randomized mix of questions across
            all domains.
          </li>
          <li>
            <strong>By domain:</strong> Practice questions focused on a single
            chosen domain.
          </li>
          <li>
            <strong>Review missed/bookmarked:</strong> Questions you previously
            answered incorrectly or flagged for review.
          </li>
          <li>
            <strong>All questions:</strong> Complete question bank in original
            order.
          </li>
        </ul>
      </div>
      <label className={styles.formField}>
        <span>Selection mode</span>
        <select
          value={selectionMode}
          onChange={(event) =>
            onSelectionModeChange(event.target.value as QuestionSelectionMode)
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
        <label className={styles.formField}>
          <span>Review set</span>
          <select
            value={reviewScope}
            onChange={(event) =>
              onReviewScopeChange(event.target.value as ReviewScope)
            }
          >
            {Object.entries(REVIEW_SCOPE_LABELS).map(([scope, label]) => (
              <option key={scope} value={scope}>
                {label}
              </option>
            ))}
          </select>
          <small
            className={styles.selectionSummary}
            role="status"
            aria-live="polite"
          >
            {reviewQuestionsCount} question
            {reviewQuestionsCount === 1 ? "" : "s"} match this review set.
          </small>
        </label>
      )}

      {(selectionMode === "domain" || selectionMode === "review") && (
        <label className={styles.formField}>
          <span>{selectionMode === "review" ? "Domain filter" : "Domain"}</span>
          <select
            required={selectionMode === "domain"}
            value={
              selectionMode === "review" ? selectionDomain : selectedDomain
            }
            onChange={(event) => onSelectionDomainChange(event.target.value)}
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
        <label className={styles.formField}>
          <span>Number of questions</span>
          <input
            type="number"
            min="1"
            max={countLimit > 0 ? countLimit : undefined}
            value={boundedSelectionCount}
            onChange={(event) => onSelectionCountChange(event.target.value)}
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
}

interface SimulationFormProps {
  questionSetFieldset: React.ReactNode;
  simulationPreset: SimulationPreset;
  onSimulationPresetChange: (preset: SimulationPreset) => void;
  sessionError: string | null;
  storageError: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function SimulationForm({
  questionSetFieldset,
  simulationPreset,
  onSimulationPresetChange,
  sessionError,
  storageError,
  onSubmit,
}: SimulationFormProps) {
  return (
    <form
      id="panel-simulate"
      role="tabpanel"
      aria-labelledby="tab-simulate"
      onSubmit={onSubmit}
    >
      {questionSetFieldset}

      <fieldset className={styles.setupFieldset}>
        <legend>Simulation outcome</legend>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="simulation-preset"
            value="perfect-pass"
            checked={simulationPreset === "perfect-pass"}
            onChange={() => onSimulationPresetChange("perfect-pass")}
          />
          <span>
            <strong>Perfect pass (100%)</strong>
            <small>Answers all questions correctly.</small>
          </span>
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="simulation-preset"
            value="realistic-pass"
            checked={simulationPreset === "realistic-pass"}
            onChange={() => onSimulationPresetChange("realistic-pass")}
          />
          <span>
            <strong>Realistic pass (~80%)</strong>
            <small>
              Simulates a comfortable passing score with a few missed questions.
            </small>
          </span>
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="simulation-preset"
            value="borderline-fail"
            checked={simulationPreset === "borderline-fail"}
            onChange={() => onSimulationPresetChange("borderline-fail")}
          />
          <span>
            <strong>Borderline fail (~60%)</strong>
            <small>
              Simulates a near-passing failing score with mixed answers.
            </small>
          </span>
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="simulation-preset"
            value="complete-fail"
            checked={simulationPreset === "complete-fail"}
            onChange={() => onSimulationPresetChange("complete-fail")}
          />
          <span>
            <strong>Complete fail (0%)</strong>
            <small>Answers all questions incorrectly.</small>
          </span>
        </label>
      </fieldset>

      {sessionError && (
        <p
          id="simulation-session-error"
          className={styles.formError}
          role="alert"
        >
          {sessionError}
        </p>
      )}
      {storageError && (
        <p
          id="simulation-storage-error"
          className={styles.storageNote}
          role="alert"
        >
          Progress cannot be saved: {storageError}
        </p>
      )}
      <button
        className="button button-primary"
        type="submit"
        aria-describedby={
          [
            sessionError ? "simulation-session-error" : "",
            storageError ? "simulation-storage-error" : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        Run simulation
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export interface QuizSetupFormProps {
  manifest: Manifest;
  questions: Question[];
  certSlug: string;
  bookmarkedQuestionIds: Set<string>;
  missedQuestionIds: Set<string>;
  storageError: string | null;
  onStartSession: (selectedQuestions: Question[], config: QuizConfig) => void;
  onCompleteAttempt: (
    config: QuizConfig,
    attemptQuestions: Question[],
    attemptAnswers: Record<string, string[]>,
  ) => void;
}

export function QuizSetupForm({
  manifest,
  questions,
  certSlug,
  bookmarkedQuestionIds,
  missedQuestionIds,
  storageError,
  onStartSession,
  onCompleteAttempt,
}: QuizSetupFormProps) {
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
  const [sessionError, setSessionError] = useState<string | null>(null);

  const hasSetDefaultCount = useRef(false);
  useEffect(() => {
    if (hasSetDefaultCount.current) return;
    hasSetDefaultCount.current = true;
    const defaultCount = manifest.examQuestionCount
      ? Math.min(manifest.examQuestionCount, questions.length)
      : Math.min(Number(DEFAULT_QUESTION_COUNT), questions.length);
    setSelectionCount(String(defaultCount));
  }, [manifest, questions]);

  const selectedDomain = selectionDomain || manifest.domains[0]?.slug || "";
  const domainQuestionCount = questions.filter(
    (q) => q.domain === selectedDomain,
  ).length;
  const reviewQuestions = filterReviewQuestions(
    questions,
    [...missedQuestionIds],
    [...bookmarkedQuestionIds],
    reviewScope,
    selectionDomain || undefined,
  );
  const reviewQuestionCountByDomain = new Map(
    manifest.domains.map((d) => [
      d.slug,
      filterReviewQuestions(
        questions,
        [...missedQuestionIds],
        [...bookmarkedQuestionIds],
        reviewScope,
        d.slug,
      ).length,
    ]),
  );
  const questionCountByDomain = new Map(
    manifest.domains.map((d) => [
      d.slug,
      questions.filter((q) => q.domain === d.slug).length,
    ]),
  );
  const countLimit =
    selectionMode === "domain"
      ? domainQuestionCount
      : selectionMode === "review"
        ? reviewQuestions.length
        : questions.length;
  const parsedCount = Number(selectionCount);
  const boundedSelectionCount =
    countLimit > 0 && Number.isInteger(parsedCount) && parsedCount > countLimit
      ? String(countLimit)
      : selectionCount;

  function buildConfig(customRevealMode: RevealMode): QuizConfig | null {
    if (selectionMode === "review" && reviewQuestions.length === 0) {
      setSessionError(
        "No questions match this review set and domain filter. Answer or bookmark questions first.",
      );
      return null;
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
      return null;
    }
    if (selectionMode === "domain" && !selectedDomain) {
      setSessionError("Choose a domain before starting the session.");
      return null;
    }
    return {
      mode: selectionMode,
      revealMode: customRevealMode,
      ...(count === undefined ? {} : { count }),
      ...(selectionMode === "domain" ? { domain: selectedDomain } : {}),
      ...(selectionMode === "review"
        ? {
            ...(selectionDomain ? { domain: selectionDomain } : {}),
            reviewScope,
          }
        : {}),
    };
  }

  function handleStart(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSessionError(null);
    const config = buildConfig(revealMode);
    if (!config) return;
    try {
      const selected = selectQuestions(
        selectionMode === "review" ? reviewQuestions : questions,
        manifest.domains,
        config,
      );
      onStartSession(selected, config);
    } catch (error) {
      setSessionError(
        error instanceof QuizSelectionError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error),
      );
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
    const config = buildConfig("end");
    if (!config) return;
    try {
      const selected = selectQuestions(
        selectionMode === "review" ? reviewQuestions : questions,
        manifest.domains,
        config,
      );
      const simulatedAnswers = simulateQuizAnswers(selected, simulationPreset);
      onCompleteAttempt(config, selected, simulatedAnswers);
    } catch (error) {
      setSessionError(
        error instanceof QuizSelectionError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error),
      );
    }
  }

  const questionSetFieldset = (
    <QuestionSetFieldset
      manifest={manifest}
      selectionMode={selectionMode}
      onSelectionModeChange={setSelectionMode}
      selectionDomain={selectionDomain}
      onSelectionDomainChange={setSelectionDomain}
      selectedDomain={selectedDomain}
      onSelectionCountChange={setSelectionCount}
      boundedSelectionCount={boundedSelectionCount}
      countLimit={countLimit}
      reviewScope={reviewScope}
      onReviewScopeChange={setReviewScope}
      reviewQuestionsCount={reviewQuestions.length}
      reviewQuestionCountByDomain={reviewQuestionCountByDomain}
      questionCountByDomain={questionCountByDomain}
    />
  );

  return (
    <div className={styles.setupCard}>
      <div
        className={styles.setupTabBar}
        role="tablist"
        aria-label="Practice setup modes"
      >
        <button
          type="button"
          role="tab"
          id="tab-practice"
          aria-selected={activeTab === "practice"}
          aria-controls="panel-practice"
          className={`${styles.setupTab} ${activeTab === "practice" ? styles.isActive : ""}`}
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
          className={`${styles.setupTab} ${activeTab === "simulate" ? styles.isActive : ""}`}
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

          <fieldset className={styles.setupFieldset}>
            <legend>Answer reveal</legend>
            <label className={styles.radioOption}>
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
            <label className={styles.radioOption}>
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
            <p
              id="practice-session-error"
              className={styles.formError}
              role="alert"
            >
              {sessionError}
            </p>
          )}
          {storageError && (
            <p
              id="practice-storage-error"
              className={styles.storageNote}
              role="alert"
            >
              Progress cannot be saved: {storageError}
            </p>
          )}
          <button
            className="button button-primary"
            type="submit"
            aria-describedby={
              [
                sessionError ? "practice-session-error" : "",
                storageError ? "practice-storage-error" : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          >
            {selectionMode === "review" ? "Start review" : "Start session"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <SimulationForm
          questionSetFieldset={questionSetFieldset}
          simulationPreset={simulationPreset}
          onSimulationPresetChange={setSimulationPreset}
          sessionError={sessionError}
          storageError={storageError}
          onSubmit={handleSimulate}
        />
      )}
    </div>
  );
}
