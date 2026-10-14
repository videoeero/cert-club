import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import logoUrl from "../assets/logo.svg";
import { ErrorState, LoadingState } from "../components/PageStatus";
import { useAsyncResource } from "../hooks/use-async-resource";
import { loadCertCatalog, loadCertQuestionCounts } from "../lib/content";
import { compileFilterRegex, filterManifests } from "../lib/filter";
import {
  parseSortOption,
  sortManifests,
  toSortOption,
  type SortDirection,
  type SortField,
  type SortOption,
} from "../lib/sort";
import { getPausedSessions, STORAGE_KEYS } from "../lib/storage";
import { formatCalendarDate } from "../lib/time";
import type { Manifest, PausedSession } from "../types";
import styles from "./CertPickerPage.module.css";

function getInitialViewMode(): "cards" | "table" {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.viewMode);
    if (saved === "cards" || saved === "table") {
      return saved;
    }
  } catch {
    // Non-blocking fallback
  }
  return "cards";
}

function getInitialSortOption(): SortOption {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.sort);
    if (
      saved === "name-asc" ||
      saved === "name-desc" ||
      saved === "cert-asc" ||
      saved === "cert-desc" ||
      saved === "updatedAt-desc" ||
      saved === "updatedAt-asc" ||
      saved === "vendor-asc" ||
      saved === "vendor-desc"
    ) {
      return saved;
    }
  } catch {
    // Non-blocking fallback
  }
  return "name-asc";
}

function CertCard({
  manifest,
  pausedSession,
  questionCount,
}: {
  manifest: Manifest;
  pausedSession?: PausedSession;
  questionCount?: number;
}) {
  return (
    <article className={styles.certCard}>
      <div className={styles.cardHeading}>
        <p className="eyebrow">{manifest.vendor}</p>
        <div className={styles.chips}>
          {manifest.status === "draft" && (
            <span className={styles.draftChip}>Draft</span>
          )}
          {pausedSession && <span className={styles.pausedChip}>Paused</span>}
          <span className={styles.slugChip}>{manifest.cert}</span>
        </div>
      </div>
      <h3>{manifest.name}</h3>
      <p>
        {questionCount !== undefined
          ? `${questionCount} practice question${questionCount === 1 ? "" : "s"}`
          : "Practice questions"}{" "}
        grouped across {manifest.domains.length} exam domains, with source links
        for every item.
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
        <Link
          className="button button-primary"
          to={`/quiz/${manifest.cert}`}
          aria-label={`${pausedSession ? "Resume" : "Start"} practice for ${manifest.name}`}
        >
          {pausedSession ? "Resume practice" : "Start practice"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function CertSections({
  certs,
  pausedSessions,
  questionCounts,
  filterQuery,
  onClearFilter,
}: {
  certs: Manifest[];
  pausedSessions: Record<string, PausedSession>;
  questionCounts: Record<string, number>;
  filterQuery?: string;
  onClearFilter?: () => void;
}) {
  const stableCerts = certs.filter((manifest) => manifest.status === "stable");
  const draftCerts = certs.filter((manifest) => manifest.status !== "stable");

  if (certs.length === 0) {
    return (
      <div className={styles.emptyState}>
        {filterQuery ? (
          <>
            <p>No certifications match &ldquo;{filterQuery}&rdquo;.</p>
            {onClearFilter && (
              <button
                type="button"
                className="button button-secondary"
                onClick={onClearFilter}
              >
                Clear filter
              </button>
            )}
          </>
        ) : (
          <p>No certifications available.</p>
        )}
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
              <CertCard
                key={manifest.cert}
                manifest={manifest}
                pausedSession={pausedSessions[manifest.cert]}
                questionCount={questionCounts[manifest.cert]}
              />
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
              <CertCard
                key={manifest.cert}
                manifest={manifest}
                pausedSession={pausedSessions[manifest.cert]}
                questionCount={questionCounts[manifest.cert]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CertTable({
  certs,
  pausedSessions,
  questionCounts,
  sortOption,
  onSortChange,
  filterQuery,
  onClearFilter,
}: {
  certs: Manifest[];
  pausedSessions: Record<string, PausedSession>;
  questionCounts: Record<string, number>;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filterQuery?: string;
  onClearFilter?: () => void;
}) {
  const { field: sortField, direction: sortDirection } =
    parseSortOption(sortOption);

  if (certs.length === 0) {
    return (
      <div className={styles.emptyState}>
        {filterQuery ? (
          <>
            <p>No certifications match &ldquo;{filterQuery}&rdquo;.</p>
            {onClearFilter && (
              <button
                type="button"
                className="button button-secondary"
                onClick={onClearFilter}
              >
                Clear filter
              </button>
            )}
          </>
        ) : (
          <p>No certifications available.</p>
        )}
      </div>
    );
  }

  function handleHeaderClick(field: SortField) {
    const nextDirection: SortDirection =
      field === sortField
        ? sortDirection === "asc"
          ? "desc"
          : "asc"
        : field === "updatedAt"
          ? "desc"
          : "asc";
    onSortChange(toSortOption(field, nextDirection));
  }

  const nameSortAria =
    sortField === "name"
      ? sortDirection === "asc"
        ? "ascending"
        : "descending"
      : "none";

  const codeSortAria =
    sortField === "cert"
      ? sortDirection === "asc"
        ? "ascending"
        : "descending"
      : "none";

  const vendorSortAria =
    sortField === "vendor"
      ? sortDirection === "asc"
        ? "ascending"
        : "descending"
      : "none";

  const dateSortAria =
    sortField === "updatedAt"
      ? sortDirection === "desc"
        ? "descending"
        : "ascending"
      : "none";

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.certTable} aria-label="Available certifications">
        <thead>
          <tr>
            <th scope="col" aria-sort={nameSortAria}>
              <button
                type="button"
                className={styles.sortableHeaderButton}
                onClick={() => handleHeaderClick("name")}
              >
                <span>Certification</span>
                <span className={styles.sortIcon} aria-hidden="true">
                  {sortField === "name"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : "⇅"}
                </span>
              </button>
            </th>
            <th scope="col" aria-sort={codeSortAria}>
              <button
                type="button"
                className={styles.sortableHeaderButton}
                onClick={() => handleHeaderClick("cert")}
              >
                <span>Code</span>
                <span className={styles.sortIcon} aria-hidden="true">
                  {sortField === "cert"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : "⇅"}
                </span>
              </button>
            </th>
            <th scope="col" aria-sort={vendorSortAria}>
              <button
                type="button"
                className={styles.sortableHeaderButton}
                onClick={() => handleHeaderClick("vendor")}
              >
                <span>Vendor</span>
                <span className={styles.sortIcon} aria-hidden="true">
                  {sortField === "vendor"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : "⇅"}
                </span>
              </button>
            </th>
            <th scope="col">Questions</th>
            <th scope="col" aria-sort={dateSortAria}>
              <button
                type="button"
                className={styles.sortableHeaderButton}
                onClick={() => handleHeaderClick("updatedAt")}
              >
                <span>Last updated</span>
                <span className={styles.sortIcon} aria-hidden="true">
                  {sortField === "updatedAt"
                    ? sortDirection === "desc"
                      ? "▼"
                      : "▲"
                    : "⇅"}
                </span>
              </button>
            </th>
            <th scope="col" className={styles.actionCell}>
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {certs.map((manifest) => {
            const pausedSession = pausedSessions[manifest.cert];
            const count = questionCounts[manifest.cert];

            return (
              <tr key={manifest.cert} className={styles.tableRow}>
                <th scope="row">
                  <div className={styles.certInfoCell}>
                    <Link
                      className={styles.certLink}
                      to={`/quiz/${manifest.cert}`}
                    >
                      {manifest.name}
                    </Link>
                    {(manifest.status === "draft" || pausedSession) && (
                      <div className={styles.metaRow}>
                        {manifest.status === "draft" && (
                          <span className={styles.draftChip}>Draft</span>
                        )}
                        {pausedSession && (
                          <span className={styles.pausedChip}>Paused</span>
                        )}
                      </div>
                    )}
                  </div>
                </th>
                <td className={styles.codeCell}>
                  <span className={styles.slugChip}>{manifest.cert}</span>
                </td>
                <td className={styles.vendorCell}>{manifest.vendor}</td>
                <td className={styles.questionCountCell}>
                  {count !== undefined ? (
                    `${count} question${count === 1 ? "" : "s"}`
                  ) : (
                    <span aria-label="Loading question count">…</span>
                  )}
                </td>
                <td className={styles.dateCell}>
                  <time dateTime={manifest.updatedAt}>
                    {formatCalendarDate(manifest.updatedAt)}
                  </time>
                </td>
                <td className={styles.actionCell}>
                  <Link
                    className={`button button-primary ${styles.tableAction}`}
                    to={`/quiz/${manifest.cert}`}
                    aria-label={`${pausedSession ? "Resume" : "Start"} practice for ${manifest.name}`}
                  >
                    {pausedSession ? "Resume practice" : "Start practice"}
                    <span aria-hidden="true">→</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CertPickerPage() {
  const [retryKey, setRetryKey] = useState(0);
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    getInitialViewMode,
  );
  const [sortOption, setSortOption] =
    useState<SortOption>(getInitialSortOption);
  const [filterQuery, setFilterQuery] = useState("");
  const filterInputRef = useRef<HTMLInputElement>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(
    {},
  );
  const [pausedSessions, setPausedSessions] = useState<
    Record<string, PausedSession>
  >({});
  const resource = useAsyncResource(loadCertCatalog, [retryKey]);

  useEffect(() => {
    try {
      setPausedSessions(getPausedSessions());
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    if (resource.status !== "ready") {
      return;
    }
    const manifests = resource.data;
    let cancelled = false;
    void loadCertQuestionCounts(manifests)
      .then((counts) => {
        if (!cancelled) {
          setQuestionCounts(counts);
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => {
      cancelled = true;
    };
  }, [resource]);

  function handleViewModeChange(mode: "cards" | "table") {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.viewMode, mode);
    } catch {
      // Non-blocking fallback
    }
  }

  function handleSortOptionChange(option: SortOption) {
    setSortOption(option);
    try {
      localStorage.setItem(STORAGE_KEYS.sort, option);
    } catch {
      // Non-blocking fallback
    }
  }

  function handleClearFilter() {
    setFilterQuery("");
    filterInputRef.current?.focus();
  }

  const { error: regexError } = useMemo(
    () => compileFilterRegex(filterQuery),
    [filterQuery],
  );

  const { field: sortField, direction: sortDirection } =
    parseSortOption(sortOption);

  const sortedCerts = useMemo(() => {
    if (resource.status !== "ready") {
      return [];
    }
    return sortManifests(resource.data, sortField, sortDirection);
  }, [resource, sortField, sortDirection]);

  const filteredCerts = useMemo(() => {
    return filterManifests(sortedCerts, filterQuery);
  }, [sortedCerts, filterQuery]);

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
      {resource.status === "ready" && (
        <>
          <div className={styles.controlsBar}>
            <div
              className={styles.viewToggle}
              role="group"
              aria-label="View layout"
            >
              <button
                type="button"
                className={`${styles.viewToggleButton} ${
                  viewMode === "cards" ? styles.isActive : ""
                }`}
                aria-pressed={viewMode === "cards"}
                onClick={() => handleViewModeChange("cards")}
              >
                Cards
              </button>
              <button
                type="button"
                className={`${styles.viewToggleButton} ${
                  viewMode === "table" ? styles.isActive : ""
                }`}
                aria-pressed={viewMode === "table"}
                onClick={() => handleViewModeChange("table")}
              >
                <span className={styles.toggleFullLabel}>Compact table</span>
                <span className={styles.toggleShortLabel}>Table</span>
              </button>
            </div>

            <div className={styles.filterControls}>
              <label htmlFor="cert-filter" className={styles.filterLabel}>
                Filter:
              </label>
              <div className={styles.filterInputWrapper}>
                <input
                  ref={filterInputRef}
                  id="cert-filter"
                  type="text"
                  className={`${styles.filterInput} ${
                    regexError ? styles.filterInputInvalid : ""
                  }`}
                  placeholder="Filter by name, code or vendor (/regex/ supported)"
                  aria-label="Filter certifications by name, code or vendor"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && filterQuery) {
                      e.stopPropagation();
                      handleClearFilter();
                    }
                  }}
                  aria-invalid={Boolean(regexError)}
                  aria-describedby={regexError ? "regex-error-hint" : undefined}
                  title={
                    regexError
                      ? `Incomplete regex: ${regexError} (matching as plain text)`
                      : undefined
                  }
                  autoComplete="off"
                  spellCheck="false"
                />
                {filterQuery && (
                  <button
                    type="button"
                    className={styles.clearFilterButton}
                    onClick={handleClearFilter}
                    aria-label="Clear filter"
                    title="Clear filter"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                )}
              </div>
              {regexError && (
                <span id="regex-error-hint" className="sr-only">
                  Incomplete regular expression. Matching as plain text.
                </span>
              )}
            </div>

            <div className={styles.sortControls}>
              <label htmlFor="sort-select" className={styles.sortLabel}>
                Sort by:
              </label>
              <select
                id="sort-select"
                className={styles.sortSelect}
                aria-label="Sort certifications by"
                value={sortOption}
                onChange={(e) =>
                  handleSortOptionChange(e.target.value as SortOption)
                }
              >
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="cert-asc">Code (A–Z)</option>
                <option value="cert-desc">Code (Z–A)</option>
                <option value="vendor-asc">Vendor (A–Z)</option>
                <option value="vendor-desc">Vendor (Z–A)</option>
                <option value="updatedAt-desc">Recently updated</option>
                <option value="updatedAt-asc">Oldest updated</option>
              </select>
            </div>
          </div>

          {viewMode === "cards" ? (
            <CertSections
              certs={filteredCerts}
              pausedSessions={pausedSessions}
              questionCounts={questionCounts}
              filterQuery={filterQuery}
              onClearFilter={handleClearFilter}
            />
          ) : (
            <CertTable
              certs={filteredCerts}
              pausedSessions={pausedSessions}
              questionCounts={questionCounts}
              sortOption={sortOption}
              onSortChange={handleSortOptionChange}
              filterQuery={filterQuery}
              onClearFilter={handleClearFilter}
            />
          )}
        </>
      )}
    </section>
  );
}
