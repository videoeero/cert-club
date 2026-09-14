# Adding a new certification bank

This document is the authoritative guide for adding a certification to
Cert Club — for human contributors and AI agents alike.

## Before you start

Re-read the **source boundary** section in [README.md](../README.md) and the
**question content requirements** in [CONTRIBUTING.md](../CONTRIBUTING.md).
The single rule that cannot be bent: every question must cite a public URL that
anyone can open without an account or paid subscription.

## File layout

A cert bank is a `manifest.json` plus one questions file per domain, in a new
subfolder of `certs/`:

```
certs/
  <slug>/
    manifest.json
    questions/
      domain-one.json
      domain-two.json
```

`<slug>` must be a lowercase, hyphen-separated identifier (e.g. `az-900`,
`aws-clf-c02`). It must match `manifest.cert` and be the prefix of every
question ID in that bank.

Each file under `questions/` is named after a `domains[*].slug` declared in
`manifest.json` and holds a JSON array of every question in that domain.
Every declared domain needs a matching file, even if it only holds one
question so far — the app fetches one file per manifest domain.

## Step 1 — Register in the catalog

Add the slug to the `certs` array in [`certs/catalog.json`](./catalog.json).
The validator requires every folder to be listed and every listed slug to have a
folder.

```json
{
  "schemaVersion": 1,
  "certs": ["ccdv-f", "az-900", "aws-clf-c02", "<your-slug>"]
}
```

Then add a row to the Certifications table in the [root README](../README.md).
Keep it to the certification name, slug, bank status, and a link to your review
record — exam facts and domain weights belong in `manifest.json`, which the app
reads directly, and must not be restated in the README.

## Step 2 — Write `manifest.json`

```json
{
  "schemaVersion": 1,
  "cert": "<slug>",
  "name": "Full certification name",
  "status": "draft",
  "updatedAt": "2026-09-11",
  "examUrl": "https://example.com/public-exam-guide.pdf",
  "contentLicense": "CC-BY-SA-4.0",
  "examQuestionCount": 50,
  "examDurationMinutes": 90,
  "domains": [
    { "slug": "domain-one", "name": "Domain One", "weight": 40 },
    { "slug": "domain-two", "name": "Domain Two", "weight": 60 }
  ]
}
```

**Rules enforced by the validator:**

- `cert` must equal the folder name.
- `status` must be `"draft"` or `"stable"` — see below. It is required, so a
  new bank cannot ship as stable by leaving the field out.
- `updatedAt` must be a valid calendar date in `YYYY-MM-DD` format and cannot be
  older than any question's `sourceCheckedAt` in that bank.
- `examUrl` must be a public HTTP/HTTPS URL.
- `examQuestionCount` (optional) must be a positive integer matching the official exam question count.
- `examDurationMinutes` (optional) must be a positive integer matching the official exam time limit in minutes.
- `domains[*].slug` must be unique within the manifest.
- `domains[*].weight` values must sum to exactly 100 (±0.001). When the
  official guide gives ranges, normalise their midpoints using the
  largest-remainder method.

### Bank status: start at `draft`

`status` is about the bank's **coverage of the blueprint**, which is a
different question from whether its individual questions are any good. That
one is `status` on each question object (`draft` | `reviewed`), and the two are
independent: a bank can hold nothing but `reviewed` questions and still be a
`draft` bank because it only covers a slice of the exam.

- **`draft`** — the bank is published and usable, but its coverage is partial.
  A new bank starts here. The app shows a "Draft" badge on the cert picker and
  a notice on the setup and results screens saying a score is practice rather
  than a readiness signal.
- **`stable`** — coverage across the blueprint is there, so a session is a
  fair rehearsal of the exam and a score means something. A complete bank
  targets **2× the official exam question count** (`2 * manifest.examQuestionCount`),
  ensuring learners can complete two full non-overlapping mock exam sessions.

There is no mechanical threshold for the promotion, deliberately. Question
count alone is the wrong test: a bank could reach the live exam's question
count while leaving a domain barely touched. Judge it per domain against the
weights in the manifest, record the reasoning in the cert's
`review-progress.md`, and flip the field in the same commit.

### Optional: declare the skill breakdown

Many exam guides publish weights one level below the domain. If yours does,
record them — the app then samples weighted sessions per skill instead of per
domain, so the mix _inside_ a domain tracks the blueprint too:

```json
{
  "slug": "domain-one",
  "name": "Domain One",
  "weight": 40,
  "skills": [
    { "slug": "skill-one", "name": "Skill One", "weight": 25 },
    { "slug": "skill-two", "name": "Skill Two", "weight": 15 }
  ]
}
```

Skill weights are shares of the **whole exam**, not of their domain, so they
must total their own domain's weight. Once a domain declares `skills`, every
question in that domain must set `subdomain` to one of them.

Check the result at any time:

```sh
npm run balance                # measure the shape of the bank as it stands
npm run balance -- --2x        # measure against the 2x exam baseline
npm run balance -- --target 150   # measure it against an authoring goal
```

## Step 3 — Write `questions/<domain-slug>.json`

Each file is a JSON array of question objects belonging to that domain. The
full schema is in [`schemas/question-bank.mjs`](../schemas/question-bank.mjs).
A minimal single-select example:

```json
[
  {
    "id": "<slug>-domain-one-001",
    "cert": "<slug>",
    "schemaVersion": 1,
    "type": "single",
    "domain": "domain-one",
    "difficulty": "medium",
    "status": "draft",
    "scope": "core",
    "stem": "A team observes X and wants Y. What explains it?",
    "options": [
      { "id": "opt-a", "text": "First option" },
      { "id": "opt-b", "text": "Second option" },
      { "id": "opt-c", "text": "Third option" },
      { "id": "opt-d", "text": "Fourth option" }
    ],
    "correct": ["opt-c"],
    "explanation": "opt-c is correct because … opt-a is wrong because …",
    "distractorNotes": {
      "opt-a": "Plausible because …, but wrong because …"
    },
    "sourceUrl": "https://docs.example.com/relevant-page",
    "sourceNote": "Section heading or topic that supports the answer",
    "sourceCheckedAt": "2026-09-03"
  }
]
```

**Key field rules:**

| Field | Constraint |
|---|---|
| `id` | Must start with `<slug>-`; conventionally `<slug>-<domain-slug>-NNN`; unique across the entire repository |
| `cert` | Must equal `manifest.cert` |
| `schemaVersion` | Must be `1` |
| `type` | `"single"` or `"multi"` |
| `domain` | Must match a slug declared in `manifest.domains` |
| `subdomain` | Optional, but required if the domain declares `skills` — must match one |
| `difficulty` | `"easy"`, `"medium"`, or `"hard"` |
| `status` | `"draft"` or `"reviewed"` |
| `scope` | Required. `"core"` or `"deep"` — see [How deep should a question go?](#how-deep-should-a-question-go) below |
| `correct` | Exactly one entry for `single`; two or more for `multi` |
| `sourceUrl` | Public HTTP/HTTPS URL, no paywalled or gated links |
| `sourceNote` | Section heading or topic that supports the answer; single line, max 140 characters |
| `sourceCheckedAt` | `YYYY-MM-DD` format |

**Per-question structural rules:**

- Option IDs must be unique within a question, and so must option **texts** —
  compared case- and whitespace-insensitively, since two options a candidate
  reads as identical are one option however they differ in bytes. A repeated
  option is not a distractor: it removes one, and if the repeat is the key the
  item has two correct answers.
- `correct` entries must reference IDs that exist in `options`.
- For `multi` questions: the correct set must not be exactly the leading
  run of options in listed order (e.g. `["opt-a", "opt-b"]` when options
  are listed a/b/c/d) — this is guessable from position alone.
- `distractorNotes` keys must reference distractor IDs, not correct ones.

**Bank-level bias guards** (enforced once the bank reaches 20 questions):

- No single answer position may hold more than 50% of single-select answers.
- Mean correct-option length may not exceed mean distractor length by more
  than 10 characters in either direction.
- The correct option may be the single longest option in at most 45% of
  single-select questions.

Write stems as situations, not definition prompts. "What is X?" discriminates
poorly. "A team observes X and needs Y — what explains it?" discriminates well.

## How deep should a question go?

The hardest judgement in bank authoring is depth. A question can cite official
documentation, state a true fact, and still be a bad exam question, because the
exam does not test at that resolution. Three public anchors settle it, in
priority order:

1. **Scope — the blueprint objective sentence.** If the guide's own description
   of the skill does not cover the fact, the question is out of scope, however
   well documented the fact is.
2. **Cognitive level — the guide's sample questions.** Most guides include a
   handful, labelled as representative. They are the calibration set. Match how
   they discriminate, not just what they cover.
3. **Tiebreak — the candidate profile.** Guides describe who should pass, in
   years of experience and months of hands-on use. Ask whether that person
   would know this, or would merely look it up.

Anchor 2 is the one that gets missed, and it reduces to a single testable rule:

> Named flags, parameters and constants may appear as supporting detail inside
> the correct option, but the **discrimination between options must be
> conceptual**. If the candidate can only answer by recalling an exact string or
> number, the question is too deep — regardless of how prominently the docs
> state it.

### Worked example

`ccdv-f-claude-code-005` asks which two flags to add to a `claude -p` invocation in CI. It
passes anchor 1 cleanly: its domain names headless mode outright, and both flags
are explicit recommendations in the official headless-mode documentation, not
buried trivia. It fails anchor 2. Answering means separating five flags on their
exact semantics, in a skill worth about one and a half items on the real exam.
A conceptual version of the same objective would ask what property a CI
invocation needs — non-interactive, machine-parseable, reproducible — and let
the flag names ride along inside the correct option.

### When the bank is already too deep

Depth problems are usually **allocation** problems. If a skill worth 3% of the
exam holds 7% of the bank, its author ran out of blueprint-level facts and
started mining detail to fill the quota. Fix the allocation and the depth
problem largely dissolves. `npm run balance` is how you see it.

### Tagging instead of deleting

Questions that overshoot need not be lost. `scope` is a **required** field on
every question — there is no default, so a new question cannot enter the bank
without a decision — plus one optional field that goes with it:

| Field | Purpose |
| --- | --- |
| `scope` | Required. `"core"` or `"deep"` |
| `scopeNote` | Required when `scope` is `"deep"`; forbidden (the schema rejects it) when `scope` is `"core"`. Justifies the call against the blueprint |

- **`core`** — traceable to a blueprint objective and pitched at the exam's
  cognitive level.
- **`deep`** — anything sound and sourced but not exam-aligned. Usually the
  topic is a real blueprint objective whose discrimination sits above the
  sample questions' level: still worth studying for mastery, and a candidate
  for rewriting down to conceptual discrimination later. Since the taxonomy
  collapsed to two values, `deep` also carries the off-objective case — a
  question testing something no objective covers. `scopeNote` is where you say
  which of the two you mean; `certs/ccdv-f/review-progress.md` has worked
  examples of both.

An earlier third value, `"out-of-scope"`, was dropped: it and `deep` were
treated identically everywhere that read the field, so the third bucket bought
nothing while letting a question sit unclassified by default. See
`certs/ccdv-f/review-progress.md` for the full reasoning. An off-objective
question therefore goes in as `deep` with the reason in its `scopeNote` — or
does not go in at all, which is usually the better answer.

Learners choose their appetite in the quiz setup form; the default excludes
`deep`. Every question — old or new — must set `scope` explicitly; there is no
untagged state.

## Step 4 — Validate

```sh
npm run check
```

This runs the content validator, the balance check, the schema tests, the
linter, and the formatter check. All must pass before opening a pull request.

The balance check only constrains banks whose manifest declares `skills`. A
bank without them is reported as aligned by definition, so existing banks are
unaffected.

### Supporting npm tasks

Three tasks generate and audit content along the steps above; use them as the
supported route through the work rather than hand-rolling it.

- `npm run scaffold` — generates the `manifest.json` / `questions/*.json` /
  `review-progress.md` file set for Step 1–2 from `--slug`, `--name`,
  `--exam-url` and repeated `--domain` (and `--skill`) flags, optionally
  appending the catalog entry (`--register`) or previewing with no writes
  (`--dry-run`). Its `--normalize` sub-mode does the midpoint-and-largest-
  remainder weight arithmetic described in Step 2 for you — pass `--target`
  to allocate a question count across weights instead of allocating to 100.
- `npm run metrics` — reports the composition and bias figures
  (`review-progress.md`'s Composition table, the position/length/scope bias
  guards, source-age buckets) for one or more cert slugs, as text, `--json`,
  or `--markdown`.
- `npm run check-sources` — reports citation staleness
  (`sourceCheckedAt` age against a threshold, `--max-age-days`) and, unless
  run with `--offline`, liveness (fetches every cited URL; tune with
  `--concurrency` and `--timeout-ms`); `--strict` / `--strict-network` turn
  its findings into a non-zero exit.
- `npm run check-claims` — checks quotes, backticked identifiers, and figures
  in the provenance surface against cited documentation pages (.md-serving
  hosts; tune with `--concurrency` and `--timeout-ms`); `--strict` turns
  hard-check findings into a non-zero exit.

None of the four is part of `npm run check`: `check-sources` and `check-claims`
hit the network by default, and the gate must stay runnable offline and
deterministic in CI. `scaffold` and `metrics` are excluded alongside them for
the same reason they aren't validators — they generate and report, they don't
gate.

## Content license

Original question text, option text, explanations, and metadata in
`questions/*.json` are licensed under **CC BY-SA 4.0** — see
[`LICENSE-CONTENT`](../LICENSE-CONTENT). By submitting a new bank you agree to
that license for your content contributions.

`manifest.json` is not content: it is MIT-licensed like the rest of the
repository, because its substance is the vendor's published blueprint data
rather than original authorship.
