import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertManifest } from "../lib/content";

export function ResultsPage() {
  const { certSlug } = useParams<{ certSlug: string }>();
  const [retryKey, setRetryKey] = useState(0);
  const resource = useAsyncResource(
    () =>
      certSlug
        ? loadCertManifest(certSlug)
        : Promise.reject(new Error("A certification slug is required.")),
    [certSlug, retryKey],
  );

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

  const manifest = resource.data;

  return (
    <section className="page-section">
      <div className="hero compact-hero">
        <p className="eyebrow">{manifest.name}</p>
        <h1>Session complete.</h1>
        <p className="hero-copy">
          The results page is wired and ready for scoring, explanations, and
          domain breakdowns.
        </p>
      </div>

      <article className="results-card">
        <div className="results-grid">
          <div>
            <span className="results-label">Score</span>
            <strong className="results-value">—</strong>
          </div>
          <div>
            <span className="results-label">Questions answered</span>
            <strong className="results-value">—</strong>
          </div>
          <div>
            <span className="results-label">Domain breakdown</span>
            <strong className="results-value">Next phase</strong>
          </div>
        </div>
        <p className="phase-note">
          Scoring, review explanations, and attempt history will be connected in
          the core quiz phase.
        </p>
        <div className="button-row">
          <Link className="button button-primary" to={`/quiz/${manifest.cert}`}>
            Start another session
          </Link>
          <Link className="button button-secondary" to="/">
            Choose another certification
          </Link>
        </div>
      </article>
    </section>
  );
}
