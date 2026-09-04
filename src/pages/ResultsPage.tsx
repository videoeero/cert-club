import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertContent } from "../lib/content";
import { answerCountLabel, scoreAnswer } from "../lib/quiz";
import { getAttempt, getAttempts } from "../lib/storage";
import { formatUsedTime } from "../lib/time";
import type { Question } from "../types";
import styles from "./ResultsPage.module.css";

interface QuestionReviewProps {
  question: Question;
  selectedOptionIds: string[];
  domainName: string;
}

function QuestionReview({
  question,
  selectedOptionIds,
  domainName,
}: QuestionReviewProps) {
  const isCorrect = scoreAnswer(question, selectedOptionIds);
  const selected = new Set(selectedOptionIds);

  return (
    <article
      className={`${styles.reviewCard} ${isCorrect ? styles.isCorrect : styles.isIncorrect}`}
    >
      <div className={styles.questionMeta}>
        <span>{domainName}</span>
        <span>
          Select {answerCountLabel(question.correct.length)} answer
          {question.correct.length === 1 ? "" : "s"}
        </span>
      </div>
      <h3>{question.stem}</h3>
      <ul className={styles.reviewOptionList} role="list">
        {question.options.map((option) => {
          const isSelected = selected.has(option.id);
          const isCorrectOption = question.correct.includes(option.id);
          return (
            <li
              className={[
                styles.reviewOption,
                isSelected ? styles.isSelected : "",
                isCorrectOption ? styles.isCorrect : "",
                isSelected && !isCorrectOption ? styles.isIncorrect : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={option.id}
            >
              <span className={styles.optionId} aria-hidden="true">
                {option.id.toUpperCase()}
              </span>
              <span>{option.text}</span>
            </li>
          );
        })}
      </ul>
      <p className={styles.reviewResult}>
        <strong>{isCorrect ? "Correct" : "Incorrect"}</strong>
        {selectedOptionIds.length === 0
          ? " — no answer selected."
          : ` — you selected ${selectedOptionIds
              .map((optionId) => optionId.toUpperCase())
              .join(", ")}.`}
      </p>
      <p>
        <strong>Correct answer:</strong>{" "}
        {question.correct.map((optionId) => optionId.toUpperCase()).join(", ")}
      </p>
      <p>{question.explanation}</p>
      <p className={styles.sourceNote}>
        <a href={question.sourceUrl} target="_blank" rel="noreferrer">
          Source: {question.sourceNote}
        </a>
      </p>
    </article>
  );
}

export function ResultsPage() {
  const { certSlug } = useParams<{ certSlug: string }>();
  const location = useLocation();
  const attemptId = new URLSearchParams(location.search).get("attempt");
  const [retryKey, setRetryKey] = useState(0);
  const resource = useAsyncResource(async () => {
    if (!certSlug) {
      throw new Error("A certification slug is required.");
    }

    const content = await loadCertContent(certSlug);
    const attempt = attemptId
      ? getAttempt(certSlug, attemptId)
      : getAttempts(certSlug)[0];

    if (!attempt) {
      throw new Error(
        "No completed practice session was found on this device.",
      );
    }

    return { ...content, attempt };
  }, [certSlug, retryKey, attemptId]);

  if (resource.status === "loading") {
    return (
      <section className="page-section">
        <LoadingState message="Loading results..." />
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

  const { manifest, questions, attempt } = resource.data;
  const domainNames = new Map(
    manifest.domains.map((domain) => [domain.slug, domain.name]),
  );
  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const reviewQuestions = attempt.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is Question => question !== undefined);
  const missingQuestionCount =
    attempt.questionIds.length - reviewQuestions.length;

  return (
    <section className="page-section">
      <div className="hero compact-hero">
        <p className="eyebrow">{manifest.name}</p>
        <h1>Session complete.</h1>
        <p className="hero-copy">
          {attempt.correctAnswers} of {attempt.totalQuestions} questions
          correct. Review every answer and its public source below.
        </p>
      </div>

      <article className={styles.resultsCard}>
        <dl className={styles.resultsGrid}>
          <div>
            <dt className={styles.resultsLabel}>Score</dt>
            <dd className={styles.resultsValue}>{attempt.scorePercentage}%</dd>
            <dd className={styles.resultsDetail}>
              {attempt.correctAnswers} correct
            </dd>
          </div>
          <div>
            <dt className={styles.resultsLabel}>Questions answered</dt>
            <dd className={styles.resultsValue}>
              {attempt.answeredQuestions}/{attempt.totalQuestions}
            </dd>
            <dd className={styles.resultsDetail}>
              {attempt.totalQuestions - attempt.answeredQuestions} skipped
            </dd>
          </div>
          <div>
            <dt className={styles.resultsLabel}>Time used</dt>
            <dd className={styles.resultsValue}>
              {formatUsedTime(attempt.startedAt, attempt.completedAt)}
            </dd>
            <dd className={styles.resultsDetail}>
              {manifest.examDurationMinutes
                ? `of ${manifest.examDurationMinutes} min limit`
                : "Total elapsed time"}
            </dd>
          </div>
          <div>
            <dt className={styles.resultsLabel}>Answer reveal</dt>
            <dd className={styles.resultsValue}>
              {attempt.config.revealMode === "immediate"
                ? "Immediate"
                : "At the end"}
            </dd>
            <dd className={styles.resultsDetail}>
              {attempt.config.mode === "weighted"
                ? "Blueprint weighted"
                : `${attempt.config.mode} selection`}
            </dd>
          </div>
        </dl>

        <section
          className={styles.domainBreakdown}
          aria-labelledby="domain-heading"
        >
          <h2 id="domain-heading">Domain breakdown</h2>
          <div className={styles.domainTableWrapper}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Domain</th>
                  <th scope="col">Score</th>
                  <th scope="col">Correct</th>
                </tr>
              </thead>
              <tbody>
                {attempt.domainBreakdown.map((domain) => (
                  <tr key={domain.slug}>
                    <th scope="row">{domain.name}</th>
                    <td>{domain.scorePercentage}%</td>
                    <td>
                      {domain.correctAnswers}/{domain.totalQuestions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {missingQuestionCount > 0 && (
          <p className={styles.storageNote} role="status">
            {missingQuestionCount} question
            {missingQuestionCount === 1 ? "" : "s"} from this attempt is no
            longer in the current question bank.
          </p>
        )}
      </article>

      <div className={`page-heading ${styles.reviewHeading}`}>
        <div>
          <p className="eyebrow">Answer review</p>
          <h2>Explanations and sources</h2>
        </div>
        <Link className="text-link" to={`/quiz/${manifest.cert}`}>
          Start another session
        </Link>
      </div>

      <div className={styles.reviewList}>
        {reviewQuestions.map((question) => (
          <QuestionReview
            key={question.id}
            question={question}
            selectedOptionIds={attempt.answers[question.id] ?? []}
            domainName={domainNames.get(question.domain) ?? question.domain}
          />
        ))}
      </div>

      <div className="button-row">
        <Link className="button button-primary" to={`/quiz/${manifest.cert}`}>
          Start another session
        </Link>
        <Link className="button button-secondary" to="/">
          Choose another certification
        </Link>
      </div>
    </section>
  );
}
