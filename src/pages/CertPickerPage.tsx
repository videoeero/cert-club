import { useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertCatalog } from "../lib/content";
import styles from "./CertPickerPage.module.css";

export function CertPickerPage() {
  const [retryKey, setRetryKey] = useState(0);
  const resource = useAsyncResource(loadCertCatalog, [retryKey]);

  return (
    <section className="page-section">
      <div className="hero">
        <p className="eyebrow">Open certification practice</p>
        <h1>Study from the docs, not from a paywall.</h1>
        <p className="hero-copy">
          Choose a certification to start a focused practice session built from
          original questions and public documentation.
        </p>
      </div>

      {resource.status === "loading" && (
        <LoadingState message="Loading certifications..." />
      )}
      {resource.status === "error" && (
        <ErrorState
          error={resource.error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      )}
      {resource.status === "ready" && (
        <div className={styles.certGrid}>
          {resource.data.map((manifest) => (
            <article className={styles.certCard} key={manifest.cert}>
              <div className={styles.cardHeading}>
                <p className="eyebrow">Certification</p>
                <span className={styles.slugChip}>{manifest.cert}</span>
              </div>
              <h2>{manifest.name}</h2>
              <p>
                Practice questions grouped across {manifest.domains.length} exam
                domains, with source links for every item.
              </p>
              <ul className={styles.domainList} aria-label="Exam domains">
                {manifest.domains.map((domain) => (
                  <li key={domain.slug}>
                    <span>{domain.name}</span>
                    <strong>{domain.weight}%</strong>
                  </li>
                ))}
              </ul>
              <Link
                className="button button-primary"
                to={`/quiz/${manifest.cert}`}
              >
                Start practice
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
