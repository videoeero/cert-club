import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertContent } from "../lib/content";

export function QuizSessionPage() {
  const { certSlug } = useParams<{ certSlug: string }>();
  const [retryKey, setRetryKey] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const resource = useAsyncResource(
    () =>
      certSlug
        ? loadCertContent(certSlug)
        : Promise.reject(new Error("A certification slug is required.")),
    [certSlug, retryKey],
  );

  useEffect(() => {
    setQuestionIndex(0);
  }, [certSlug]);

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
  const question = questions[questionIndex];

  if (!question) {
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

  const domain = manifest.domains.find(
    (candidate) => candidate.slug === question.domain,
  );
  const isLastQuestion = questionIndex === questions.length - 1;
  const progress = ((questionIndex + 1) / questions.length) * 100;

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
        aria-label={`Question ${questionIndex + 1} of ${questions.length}`}
      >
        <div className="progress-label">
          <span>
            Question <strong>{questionIndex + 1}</strong> of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article className="question-card">
        <div className="question-meta">
          <span>{domain?.name ?? question.domain}</span>
          <span>{question.difficulty}</span>
          <span>
            {question.type === "multi"
              ? "Multiple response"
              : "Single response"}
          </span>
        </div>
        <h2>{question.stem}</h2>
        <ol className="option-list" aria-label="Answer options">
          {question.options.map((option) => (
            <li key={option.id}>
              <span className="option-id">{option.id.toUpperCase()}</span>
              <span>{option.text}</span>
            </li>
          ))}
        </ol>
        <p className="phase-note">
          Answer selection and scoring will be connected in the core quiz phase.
        </p>
      </article>

      <div className="quiz-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setQuestionIndex((value) => Math.max(0, value - 1))}
          disabled={questionIndex === 0}
        >
          Previous
        </button>
        {isLastQuestion ? (
          <Link
            className="button button-primary"
            to={`/results/${manifest.cert}`}
          >
            Finish session
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button
            className="button button-primary"
            type="button"
            onClick={() =>
              setQuestionIndex((value) =>
                Math.min(questions.length - 1, value + 1),
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
