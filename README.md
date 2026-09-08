# Cert Club

> The first rule of Cert Club is you talk about Cert Club, because you're
> stressed about the exam.

Open, non-paywalled practice exams for vendor certifications whose study
material is already public.

Each cert's `manifest.json` declares a bank `status`: `stable` means the bank
covers its blueprint proportionally, `draft` means coverage is still partial —
published to exercise the schema rather than to rehearse that exam. The app
badges the draft ones. See [Certifications](#certifications) for what ships
today.

> **Status: pre-alpha.** The core quiz flow and three certification banks are
> in place; deployment remains. See [`PLAN.md`](./PLAN.md) for the v1 scope,
> question schema, and phase-by-phase build order.

## Why this exists

For entry-level certifications, the vendor documents the material
publicly — but the _practice question_ experience is mostly locked behind
paid bootcamps (K21 Academy, Datrick, CloudThat and similar all
repackage the same public docs commercially).

The docs are free. The questions shouldn't cost $300.

## What this is not

**This project does not reproduce real exam questions or paywalled course
content.** That is not a soft preference; it is the constraint the whole
design serves.

Every question here is original, written against public documentation,
and carries a citation back to the specific doc section it tests. This is
the same model the commercial prep vendors already operate legally.
Copying an actual exam bank is a different thing, and we don't do it.

If you are looking for exam dumps, this is the wrong repository.

### The source boundary

One rule, applied identically to every cert in the repository:

| Source                                             | Usable?                      |
| -------------------------------------------------- | ---------------------------- |
| Official vendor documentation                      | ✅ Primary source            |
| Official exam guide / blueprint (domains, weights) | ✅ Drives question weighting |
| Public course landing pages (syllabus, objectives) | ⚠️ Coverage cross-check only |
| Anything behind a registration wall or paywall     | ❌ Never                     |
| Real exam items                                    | ❌ Never                     |

Questions are written **only** from the primary sources and the exam guide. The
citation requirement (`sourceUrl` on every question) is what makes that
auditable rather than merely claimed.

The boundary is drawn at the **gate — not the vendor, and not the price.** A
course that costs nothing but asks you to register still sits behind a wall, so
it is excluded on the same footing as a paid one. A course's public landing page
is not behind that wall and may be read — but only to ask "is this skill
covered?", never as a citation, and never to calibrate how deep a question
should go. Courses teach you to build; these exams test what to choose.

## Certifications

| Certification                            | Slug          | Bank status | How this bank was built                                 |
| ---------------------------------------- | ------------- | ----------- | ------------------------------------------------------- |
| Claude Certified Developer – Foundations | `ccdv-f`      | stable      | [review record](./certs/ccdv-f/review-progress.md)      |
| Microsoft Certified: Azure Fundamentals  | `az-900`      | draft       | [review record](./certs/az-900/review-progress.md)      |
| AWS Certified Cloud Practitioner         | `aws-clf-c02` | draft       | [review record](./certs/aws-clf-c02/review-progress.md) |

Each cert's `manifest.json` holds the authoritative metadata — official exam
guide URL, question count, duration, and blueprint domain weights — and the app
renders those directly, so they are not restated here. Each
`review-progress.md` records where the questions came from, how the blueprint
was translated into a question distribution, and the judgement calls a future
author should not have to rediscover.

## Design principles

- **No backend.** Static site plus JSON question banks. Progress and
  bookmarks live in your browser's `localStorage`.
- **No accounts, no analytics, no telemetry.** Nothing about your study
  session leaves your machine.
- **Every question cites its source.** Non-negotiable.

## Running locally

Requires Node.js 24 or newer:

```sh
npm ci
npm run dev
```

Vite serves the app at the local URL it prints. The question banks stay as
static JSON files and are loaded at runtime from `certs/<cert-slug>/`.

To produce and preview a production build:

```sh
npm run build
npm run preview
```

## Contributing a new cert bank

See [`certs/ADDING-A-CERT.md`](./certs/ADDING-A-CERT.md) for the step-by-step
guide covering file layout, manifest format, question schema, bias-guard rules,
and the mandatory validation step.

## Licensing

Two licenses, because code and question content are different assets:

- **Question content** — the files under `certs/*/questions/`:
  [CC BY-SA 4.0](./LICENSE-CONTENT). Share or adapt it with attribution, and
  license the adaptation alike.
- **Everything else** — app source, content schemas, validation scripts, cert
  manifests, and documentation: [MIT](./LICENSE).

The boundary sits at the question files themselves. Cert manifests stay under
MIT because their substance is public blueprint data — the domain names and
exam weights published by the certification vendor — which this project
reports rather than authors.

Contributions must meet the provenance requirements in
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Disclaimer

Independent and unofficial. Not affiliated with, endorsed by, or sponsored by
Anthropic, Microsoft, Amazon Web Services, or any certification body.
"Claude", "Anthropic", "AWS", "Amazon Web Services", and all certification
names are the marks of their respective owners.
