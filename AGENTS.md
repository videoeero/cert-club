# AGENTS.md

Guidance for AI agents working in this repository.

## What this project is

Cert Club is a static React/TypeScript quiz app backed by JSON question
banks. There is no backend. Progress lives in `localStorage`. Code is MIT;
question content is CC BY-SA 4.0.

Stack: Node ≥ 24 · Vite · React 19 · TypeScript · Zod · ESLint · Prettier.

## Non-negotiable content rule

Every question must cite a public source that anyone can open without an
account or subscription. `sourceUrl` is a required field on every question
object and the validator enforces it. Never invent or omit it.

Never source questions from:

- Real exam items (confidential, legally off-limits)
- Any material that requires an account to read. **The test is registration,
  not price** — a course that is free but asks you to register still fails,
  because "free to register" is not "open to read".
- Paywalled or gated course content, including the certification vendor's own
  training — an official course is still gated content, and being official does
  not make it citable

Always source questions from public vendor documentation and official exam
guides/blueprints only.

Two independent tests, and a source must pass both. The first is the gate
above: can anyone open it without an account? The second is **authority**: is
it published by the party that owns the fact? A copy of a vendor's exam guide
in someone's public GitHub repository passes the gate perfectly and fails
authority — it is a mirror that can be stale, partial or edited, and nothing
in this repository would reveal it. Cite the vendor's own copy, always, and
`manifest.examUrl` most of all: every domain name and weight in a bank derives
from it. Third-party material may be read as calibration, never cited; see the
firewall in `certs/ccdv-f/review-progress.md`.

The gate test is about the gate, never about the vendor. A course's **public
landing page** — syllabus, learning objectives, prerequisites — is genuinely
open and may be read, but only as a cross-check on whether a skill is
covered. It is still not a valid `sourceUrl`, because it states what a course
claims to teach rather than a verifiable technical fact. Cite the
documentation that establishes the fact instead.

Both tests are general. What they cannot tell you is which of a _particular_
vendor's hosts are legacy redirects, which keep superseded guide revisions
live, and which properties must never be cited even though they are open and
first-party. That is recorded per vendor in
[`certs/VENDORS.md`](certs/VENDORS.md), and it is not derivable from the banks
— read it before citing a host you have not cited before.

## Dev setup

```sh
npm ci        # install deps — do not edit package-lock.json by hand
npm run dev   # Vite dev server
```

## Mandatory check before every commit

```sh
npm run check
```

This runs, in order: sync manifest dates check → content validation → blueprint balance →
Node test runner → ESLint → Prettier check. All must pass. Do not commit if any
step fails.

`check` covers content and lint only — it does **not** typecheck or bundle. If
you touched anything under `src/`, run the build as well:

```sh
npm run build   # tsc -b, then vite build
```

CI runs both on every pull request, in that order.

To sync manifest dates automatically: `npm run sync-dates`.
To fix formatting automatically: `npm run format`.

## Repository layout

```
certs/                  Question banks (JSON) and the cert catalog
  catalog.json          Lists every cert slug — must stay in sync with folders
  <slug>/
    manifest.json       Cert metadata, bank status, domain weights (sum to 100)
    questions/          One JSON file per domain, named after its domain slug
    review-progress.md  Standing record of how the bank was built and reviewed
  ADDING-A-CERT.md      Step-by-step guide for adding a new cert bank
  ADDING-A-QUESTION-TYPE.md  Gate on answer shapes beyond single/multi select
  VENDORS.md            Per-vendor sourcing profiles — citable and forbidden hosts
schemas/
  question-bank.mjs     Zod schemas — the canonical definition of all formats
scripts/
  validate-content.mjs  Content validation script (called by `npm run validate`)
src/                    React app source
dist/                   Build output — generated, never edit
```

## Two different `status` fields

`manifest.status` (`draft` | `stable`) is about a **bank's coverage** of the
blueprint. A question's own `status` (`draft` | `reviewed`) is about whether
**that item** was reviewed. They are independent — AZ-900 and CLF-C02 are
`draft` banks made entirely of `reviewed` questions — so never derive one from
the other, and never infer bank status from question count. See
[`certs/ADDING-A-CERT.md`](certs/ADDING-A-CERT.md) § Bank status.

## Schema is the source of truth

All JSON structure is defined in [`schemas/question-bank.mjs`](schemas/question-bank.mjs).
When adding or editing questions or manifests, validate against the schema —
never invent fields, and never omit required ones.

## Adding a new certification bank

See [`certs/ADDING-A-CERT.md`](certs/ADDING-A-CERT.md) for the full
step-by-step guide, field rules, and bias-guard constraints.

Summary:

1. Create `certs/<slug>/manifest.json`, then one
   `certs/<slug>/questions/<domain-slug>.json` per domain the manifest declares
2. Add the slug to `certs/catalog.json`
3. Run `npm run check` — fix all errors before committing

## Agent workflows

[`skills/`](skills/) holds the recurring content workflows — recon for a new
cert, authoring a batch, evaluating per-question correctness, hardening domain
difficulty, auditing coverage, auditing citations for drift, and the gate on
new question types. They are **procedural wrappers** over this file,
[`CONTRIBUTING.md`](CONTRIBUTING.md) and
[`certs/ADDING-A-CERT.md`](certs/ADDING-A-CERT.md): they say in what order to
do the work and where the judgement calls are, and they carry no rules of
their own. Where a workflow and one of those documents disagree, the document
wins and the workflow is wrong.

They are plain markdown in the portable [Agent Skills](https://agentskills.io/)
layout, so read one directly at any time. `npx skills@1.5.25 add .` symlinks them
into whichever agent directories you use, which is what makes an agent retrieve
them on its own; those targets are gitignored, since the agent is a
per-developer choice. The version is pinned deliberately, and the CLI has
telemetry worth knowing about — see [`skills/README.md`](skills/README.md).

## Licensing when creating files

- **New `.ts` / `.tsx` / `.mjs` / config files, and `manifest.json`** — MIT
  (no header required)
- **New question content under `questions/`** — CC BY-SA 4.0; implied by
  the `contentLicense` field in the cert's `manifest.json`. Full text in
  [`LICENSE-CONTENT`](LICENSE-CONTENT)

## What not to touch

- `dist/` — generated by `npm run build`; never edit manually
- `package-lock.json` — maintained by npm; run `npm ci` or `npm install`, not
  manual edits
- `node_modules/` — never edit
