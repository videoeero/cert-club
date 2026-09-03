import type { CertContent, Manifest, Question, QuestionOption } from "../types";

const CERT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_SCHEMA_VERSION = 1;
type JsonFetcher = typeof fetch;

export class ContentLoadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ContentLoadError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOption(value: unknown): value is QuestionOption {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string"
  );
}

function isQuestion(value: unknown): value is Question {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.cert === "string" &&
    value.schemaVersion === CONTENT_SCHEMA_VERSION &&
    (value.type === "single" || value.type === "multi") &&
    typeof value.domain === "string" &&
    (value.subdomain === undefined || typeof value.subdomain === "string") &&
    (value.difficulty === "easy" ||
      value.difficulty === "medium" ||
      value.difficulty === "hard") &&
    (value.status === "draft" || value.status === "reviewed") &&
    typeof value.stem === "string" &&
    Array.isArray(value.options) &&
    value.options.every(isOption) &&
    Array.isArray(value.correct) &&
    value.correct.every(
      (optionId): optionId is string => typeof optionId === "string",
    ) &&
    typeof value.explanation === "string" &&
    (value.distractorNotes === undefined || isRecord(value.distractorNotes)) &&
    typeof value.sourceUrl === "string" &&
    typeof value.sourceNote === "string" &&
    typeof value.sourceCheckedAt === "string"
  );
}

function isManifest(value: unknown): value is Manifest {
  return (
    isRecord(value) &&
    value.schemaVersion === CONTENT_SCHEMA_VERSION &&
    typeof value.cert === "string" &&
    typeof value.name === "string" &&
    typeof value.examUrl === "string" &&
    typeof value.contentLicense === "string" &&
    Array.isArray(value.domains) &&
    value.domains.every(
      (domain) =>
        isRecord(domain) &&
        typeof domain.slug === "string" &&
        typeof domain.name === "string" &&
        typeof domain.weight === "number",
    )
  );
}

function assertCertSlug(certSlug: string): void {
  if (!CERT_SLUG_PATTERN.test(certSlug)) {
    throw new ContentLoadError(`Invalid certification slug "${certSlug}".`);
  }
}

function normalizedBaseUrl(): string {
  return import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
}

function contentUrl(certSlug: string, fileName: string): string {
  assertCertSlug(certSlug);
  return `${normalizedBaseUrl()}certs/${certSlug}/${fileName}`;
}

async function fetchJson<T>(
  fetcher: JsonFetcher,
  url: string,
  description: string,
): Promise<T> {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new ContentLoadError(
      `Unable to load ${description} (${response.status} ${response.statusText}).`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ContentLoadError(`${description} returned invalid JSON.`, {
      cause: error,
    });
  }
}

function parseCatalog(value: unknown): string[] {
  if (
    !isRecord(value) ||
    value.schemaVersion !== CONTENT_SCHEMA_VERSION ||
    !Array.isArray(value.certs) ||
    value.certs.length === 0 ||
    value.certs.some(
      (cert) => typeof cert !== "string" || !CERT_SLUG_PATTERN.test(cert),
    )
  ) {
    throw new ContentLoadError(
      "The certification catalog has an invalid shape.",
    );
  }

  const certs = value.certs as string[];
  if (new Set(certs).size !== certs.length) {
    throw new ContentLoadError(
      "The certification catalog contains duplicate slugs.",
    );
  }
  return certs;
}

export async function loadCertManifest(
  certSlug: string,
  fetcher: JsonFetcher = fetch,
): Promise<Manifest> {
  const value = await fetchJson<unknown>(
    fetcher,
    contentUrl(certSlug, "manifest.json"),
    `the ${certSlug} certification manifest`,
  );

  if (!isManifest(value) || value.cert !== certSlug) {
    throw new ContentLoadError(
      `The ${certSlug} certification manifest does not match the expected schema.`,
    );
  }
  return value;
}

export async function loadCertCatalog(
  fetcher: JsonFetcher = fetch,
): Promise<Manifest[]> {
  const catalog = await fetchJson<unknown>(
    fetcher,
    `${normalizedBaseUrl()}certs/catalog.json`,
    "the certification catalog",
  );
  const certSlugs = parseCatalog(catalog);
  return Promise.all(
    certSlugs.map((certSlug) => loadCertManifest(certSlug, fetcher)),
  );
}

export async function loadCertContent(
  certSlug: string,
  fetcher: JsonFetcher = fetch,
): Promise<CertContent> {
  const [manifest, questionsValue] = await Promise.all([
    loadCertManifest(certSlug, fetcher),
    fetchJson<unknown>(
      fetcher,
      contentUrl(certSlug, "questions.json"),
      `the ${certSlug} question bank`,
    ),
  ]);

  if (!Array.isArray(questionsValue) || !questionsValue.every(isQuestion)) {
    throw new ContentLoadError(
      `The ${certSlug} question bank does not match the expected schema.`,
    );
  }
  return { manifest, questions: questionsValue };
}
