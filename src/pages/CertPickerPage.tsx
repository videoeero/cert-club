import { useState } from "react";
import { Link } from "react-router-dom";

import logoUrl from "../assets/logo.svg";
import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertCatalog } from "../lib/content";
import { formatCalendarDate } from "../lib/time";
import type { Manifest } from "../types";
import styles from "./CertPickerPage.module.css";

function CertCard({ manifest }: { manifest: Manifest }) {
  return (
    <article className={styles.certCard}>
      <div className={styles.cardHeading}>
        <p className="eyebrow">Certification</p>
        <div className={styles.chips}>
          {manifest.status === "draft" && (
            <span className={styles.draftChip}>Draft</span>
          )}
          <span className={styles.slugChip}>{manifest.cert}</span>
        </div>
      </div>
      <h3>{manifest.name}</h3>
      <p>
        Practice questions grouped across {manifest.domains.length} exam
        domains, with source links for every item.
        {manifest.status === "draft" &&
          " Coverage of this blueprint is still partial."}
      </p>
      <ul className={styles.domainList} aria-label="Exam domains">
        {manifest.domains.map((domain) => (
          <li key={domain.slug}>
            <span>{domain.name}</span>
            <strong>{domain.weight}%</strong>
          </li>
        ))}
      </ul>
      <div className={styles.cardFooter}>
        <p className={styles.lastUpdated}>
          Updated{" "}
          <time dateTime={manifest.updatedAt}>
            {formatCalendarDate(manifest.updatedAt)}
          </time>
        </p>
        <Link className="button button-primary" to={`/quiz/${manifest.cert}`}>
          Start practice
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function CertSections({ certs }: { certs: Manifest[] }) {
  const stableCerts = certs.filter((manifest) => manifest.status === "stable");
  const draftCerts = certs.filter((manifest) => manifest.status === "draft");

  if (stableCerts.length === 0 && draftCerts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No certifications available.</p>
      </div>
    );
  }

  return (
    <div className={styles.sectionContainer}>
      {stableCerts.length > 0 && (
        <section
          className={styles.certSection}
          aria-labelledby="stable-exams-heading"
        >
          <div className={styles.sectionHeader}>
            <h2 id="stable-exams-heading">Full Practice Exams</h2>
            <p className={styles.sectionSubtext}>
              Full blueprint coverage for realistic exam rehearsal.
            </p>
          </div>
          <div className={styles.certGrid}>
            {stableCerts.map((manifest) => (
              <CertCard key={manifest.cert} manifest={manifest} />
            ))}
          </div>
        </section>
      )}

      {draftCerts.length > 0 && (
        <section
          className={styles.certSection}
          aria-labelledby="draft-exams-heading"
        >
          <div className={styles.sectionHeader}>
            <h2 id="draft-exams-heading">Draft Practice Exams</h2>
            <p className={styles.sectionSubtext}>
              Question banks with partial blueprint coverage or actively in
              review.
            </p>
          </div>
          <div className={styles.certGrid}>
            {draftCerts.map((manifest) => (
              <CertCard key={manifest.cert} manifest={manifest} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function CertPickerPage() {
  const [retryKey, setRetryKey] = useState(0);
  const resource = useAsyncResource(loadCertCatalog, [retryKey]);

  return (
    <section className="page-section">
      <div className="hero">
        <p className="eyebrow">Open certification practice</p>
        <div className={styles.heroTitle}>
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className={styles.heroLogo}
          />
          <h1>Cert Club</h1>
        </div>
        <p className="hero-rule">
          The first rule of Cert Club is you talk about Cert Club, because
          you&rsquo;re stressed about the exam.
        </p>
        <p className="hero-copy">
          Study from the docs, not from a paywall. Choose a certification to
          start a focused practice session built from original questions and
          public documentation.
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
      {resource.status === "ready" && <CertSections certs={resource.data} />}
    </section>
  );
}
