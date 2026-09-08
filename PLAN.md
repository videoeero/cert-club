# Cert Club — v1 Plan

Scope decision (locked for v1): **static frontend app + JSON question
banks, no backend.** Progress/bookmarks/history live in the browser's
`localStorage` (or `sessionStorage` for anything intentionally
non-persistent, e.g. "resume this attempt only"). No accounts, no server,
no database. If this needs to change later (e.g. cross-device sync,
community contributions via a review queue), that's a v2 problem — the
JSON question format is designed so a backend could be added later without
reshaping the content itself.

Ship **CCDV-F only** end-to-end before touching a second cert.

---

## Conventions

Each phase carries a **Status** line — one of:
`PENDING` (not started) · `IN PROGRESS` · `BLOCKED` (say why) ·
`DONE` (acceptance criteria met, not merely "code written")

| Phase | Status |
|---|---|
| 0 — Repo foundations | DONE |
| 1 — Question schema | DONE |
| 2 — Seed content | DONE |
| 3 — Frontend scaffold | DONE |
| 4 — Core quiz | DONE |
| 5 — Polish | DONE |
| 6 — Second cert | DONE |
| 7 — AWS Cloud Practitioner | DONE |
| 8 — Deploy | PENDING |
| 9 — Stretch | PENDING (deferred) |

*(Summary only — the per-phase `Status:` lines below are canonical. If
they disagree, trust the phase, not the table.)*

---

## Verified exam facts (drive Phases 1–2)

Checked against the public CCDV-F exam guide before locking the schema:

- **The blueprint is public** — 8 domains with published weights:
  Applications & Integration 33.1%, Model Selection & Optimization 16.8%,
  Agents & Workflows 14.7%, Prompt & Context Engineering 11.0%,
  Tools & MCPs 10.6%, Security & Safety 8.1%, Claude Code 3.1%,
  Eval/Testing/Debugging 2.6%.
- **The exam is NOT single-select only.** It mixes single-select
  multiple-choice *and* multiple-response ("Select TWO/THREE") items.
  The schema and quiz engine must support both from day one.
- 53 questions, 120 minutes, 720/1000 to pass, Pearson VUE / OnVUE.

Re-verify these against the official guide before Phase 2 authoring
begins; treat the weights above as provisional until read first-hand.
**Cross-checked** against `Amey-Thakur/CLAUDE-CERTIFICATIONS` (see below),
which reproduces identical domains/weights and hosts the official
`exam-guide.pdf` — two independent sources now agree.

The blueprint also publishes **sub-domain weights** (e.g. within
Applications & Integration: Claude application design 8.6%, Software
engineering foundations 7.4%, Claude API mechanics 6.8%, Configuration
management 4.1%, Understanding requirements 3.4%, Systems life cycle 2.8%).
This is finer-grained than the plan assumed and is worth capturing —
see the `subdomain` field in Phase 1.

---

## Prior art: `Amey-Thakur/CLAUDE-CERTIFICATIONS`

Flagged in the initial research notes as unverified. **Now verified** —
it is real, MIT licensed, actively maintained, and contains 320 questions
across all four Claude certs (80 per cert: 140 practice + 3×60 mock),
plus flashcards, cheat sheets, and the official exam guide PDFs.

What inspecting it actually changes for us:

- **It confirms our blueprint data.** Identical 8 domains, identical
  weights, same 53q/120min/720-pass facts. Our domain *slugs* should map
  1:1 onto these official names (see Phase 1).
- **It independently arrived at options-as-keyed-object** (`{"A": ...}`)
  rather than positional indices — the same conclusion as our stable-ID
  decision, reached by someone who has authored 320 of these.
- **Its rationales explain why each distractor is wrong**, inline. Worth
  copying as a *practice*: our `explanation` should do the same, with
  `distractorNotes` available when per-option detail helps.
- **All 320 of its questions are single-answer** — its schema (`"answer":
  "A"`) structurally cannot express multiple-response, even though the
  real exam includes "Select TWO/THREE" items. That is precisely the trap
  our v1 schema was heading into, now avoided.
- **It has no per-question source citation at all.** No `sourceUrl`, no
  doc reference, no provenance of any kind. This is the single clearest
  gap and it maps exactly onto our non-negotiable citation requirement —
  **provenance is our actual differentiator**, not question volume.

**Usage rule:** cross-check and inspiration only. Do not copy questions
or rationales, MIT license notwithstanding — our stated principle is
original questions written against public docs, and importing someone
else's uncited bank would destroy the one property that makes this
project worth building.

---

## Phase 0 — Repo foundations
**Status:** DONE

- ~~Pick and add a LICENSE~~ **done**: MIT for code.
- ~~Decide content license separately~~ **done**: CC BY-SA 4.0, since
  question text/explanations are a different kind of asset than code.
  Both are stated in the README licensing section and each cert's
  `manifest.json` carries a `contentLicense` field.
- ~~Expand README~~ **done**: what this is, what it isn't, the
  public-vs-gated source boundary table, exam facts, design principles.
  Absorbed the durable content from the old `HANDOFF.md`, which has been
  removed as fully superseded.
- ~~**Unaffiliated/trademark disclaimer**~~ **done in README**; still
  needs repeating in the app footer once Phase 3 exists.
- ~~**No-tracking statement**~~ **done in README** (design principles).
- `CONTRIBUTING.md` stub even though community content is deferred to
  Phase 9 — it sets the "questions must cite public docs, no exam dumps"
  bar *before* the first drive-by PR, not after. README now states the
  principle; CONTRIBUTING needs the operational version of it (what a
  valid citation looks like, what gets a PR closed on sight).
- `.gitignore`, basic repo hygiene.

## Phase 1 — Question schema design
**Status:** DONE

- **Stable option IDs, not `correctIndex`.** Phase 5 wants shuffled
  option order, and any hand-edit that reorders options would silently
  invert the answer key with positional indexing. IDs make reordering
  and diffing safe.
- **`correct` is always an array + a `type` discriminator** (`single` |
  `multi`), because the real exam includes "Select TWO/THREE" items.
  A single-select-only schema would need a content migration the moment
  the first realistic multi-response question is written.
- **`schemaVersion` on content too**, not just on `localStorage`. Same
  argument, applied to the asset that's actually hard to regenerate.
- **`sourceCheckedAt`** is the cheap 80% answer to the doc-drift problem:
  a date per question makes "what's gone stale?" a trivial query and a
  future scheduled diff job possible, without building any drift tooling
  in v1.
- **`status`** (`draft` | `reviewed`) records the human-review pass that
  Phase 2 promises. Without it, "reviewed for accuracy" is untracked.
- **`distractorNotes` optional** — explaining why the wrong answers are
  wrong is what separates a good bank from a flashcard dump. Optional so
  it never blocks authoring.
- `domain` values are **stable slugs** (`tools-and-mcps`), with the
  official display name and weight held once in `manifest.json` rather
  than repeated across every question. The slug set maps 1:1 onto the
  eight official exam-guide domains, so weighting/filtering stays
  data-driven and a guide re-wording changes one manifest line instead of
  100 questions. The validator enforces that every `domain` exists in the
  manifest.
- **`subdomain` optional**, matching the blueprint's published sub-domain
  weights. Costs nothing to record while authoring and is the difference
  between "you're weak on Security & Safety" and "you're weak on prompt
  injection specifically." Not required by the validator in v1, so it
  never blocks a question from landing.
- `sourceUrl`/`sourceNote` is the provenance mechanism — every question
  traces to a public doc, non-negotiable. This is the project's core
  differentiator (see README § The source boundary).
- Decide file layout: `/certs/ccdv-f/questions.json` (single file is fine
  at this size) plus `/certs/ccdv-f/manifest.json` for cert metadata
  (name, blueprint domain weights, exam link, content license).

**Deliverable, not deferred:** a validation script (zod or JSON Schema)
plus the CI job that runs it, shipped *in this phase*. Validating content
is near-worthless once 100 questions are already written against a
malformed assumption — it has to gate the first authored question.
Checks: unique IDs, `correct` non-empty and referencing real option IDs,
`correct.length === 1` iff `type === "single"`, `domain` ∈ manifest
domains, `cert` matches folder, `sourceUrl` non-empty and well-formed.

**Done when:** validator rejects a deliberately broken fixture in CI.

## Phase 2 — Seed content (CCDV-F)
**Status:** DONE

- Pull the official CCDV-F exam guide's domain breakdown into
  `manifest.json` (see verified weights above — confirm first-hand).
- **Target 100 questions for v1**, expanding the original 80-question target
  while the source and review context is active. The larger bank gives the
  long-tail domains more depth and delays repeat exposure. Weighted straight
  off the blueprint, 100 questions yields ~33 for Applications and
  Integration but only ~3 each for Eval, Testing, and Debugging and Claude
  Code — still too thin to be useful as a study aid. **Set a floor of 5
  questions per domain** and let the large domains absorb the rest; the quiz
  engine can still *sample* to true blueprint weights at runtime. Authoring
  depth and exam simulation are different problems and shouldn't share one
  number.
- Mix in genuine multi-response items — a bank that's 100% single-select
  will not prepare anyone for the real format.
- No pipeline/tooling needed yet for v1 — hand-author (with AI drafting
  assistance) directly into the JSON file, human-reviewed for accuracy
  and flipped from `status: draft` to `reviewed`.
- **This is the long pole.** It does not block Phase 3 — see below.

**Done when:** 100 questions pass the Phase 1 validator, every domain
meets its floor, and every question is `status: reviewed`.

**Met.** 100 questions, all `reviewed`, all eight domains above the
5-question floor (smallest: Claude Code and Eval/Testing/Debugging at 7
each). The review method and its results are written up in
`certs/ccdv-f/review-progress.md`: every question was independently
cold-answered against its cited source page by a reader that never saw
the answer key, giving 94 agreements, 3 disagreements (all adjudicated in
the key's favour), and 3 questions whose sources were verified by hand.

A follow-up pattern audit then caught the failure mode this phase's model
note warns about, in its other form: the bank was **answer-length biased**,
and "always pick the longest option" scored 61% on single-select against a
25% baseline. Cold-answering could not have caught it, since that method
only proves the key is faithful to its source. All 100 questions were
rebalanced by padding distractors rather than trimming keys, and a
`lengthBias` guard now sits beside the position-bias guard in the
validator. Before/after metrics are in `review-progress.md`.

## Phase 3 — Frontend scaffold
**Status:** DONE

- **Stack locked: Vite + React + TypeScript.** The quiz / review /
  results views share meaningful component and state logic, which is
  exactly where vanilla TS starts hand-rolling a worse React. Leaving
  this open is the kind of decision that stalls a fresh repo.
- Routing: landing/cert-picker page → quiz session → results page.
  (Even with one cert in v1, keep the picker so adding a second cert in
  Phase 6 is additive, not a rewrite.)
- Load question bank via static `fetch()` of the JSON at runtime, keyed
  by cert slug — so adding a cert is a content change, not a code change.
- **ESLint + Prettier added.** `npm run lint` / `npm run format` /
  `npm run format:check`, wired into `npm run check` and CI. Note:
  `typescript-eslint` doesn't support TypeScript 7 yet (the repo's `tsc`),
  so `devDependencies` alias a TS 6 build in under the `typescript` name
  for linting only (see `eslint.config.js` header comment and the
  `@typescript/native` / `typescript` aliases in `package.json`) — remove
  this once `typescript-eslint` ships TS 7 support (tracked upstream at
  `typescript-eslint/typescript-eslint#10940`).

## Phase 4 — Core quiz functionality
**Status:** DONE

- Quiz session: pull N questions (config: all, by domain, random subset,
  weighted-by-domain), single- **and multi-select** answering, immediate
  or end-of-quiz reveal of correct answer + explanation + source link.
- **Multi-response scoring rule: all-or-nothing** (matches how these
  exams typically grade, and avoids inventing a partial-credit model
  users would misread as their real score). Show the count required
  ("Select TWO") in the UI, as the real exam does.
- Scoring + per-domain breakdown at end of session.
- `localStorage`: persist last N attempt scores/history, bookmarked
  questions, "questions missed" list for a review-only mode.
- Keep the storage schema versioned (`{version, data}`) so future format
  changes don't break on existing users' stored data — and write the
  read path to discard unknown/older versions gracefully rather than
  throwing, or the first schema bump white-screens returning users.
- **Unit-test the scoring and weighted-sampling logic.** It's the only
  non-obvious code in the project, it's silently wrong when it breaks,
  and it's trivially testable as pure functions. No other testing
  ceremony needed for v1.

**Addendum (2026-09-07) — weighted sampling replaced with quota allocation.**
The original `weightedSample` drew one bucket at a time, proportional to
weight, without replacement — sampling-with-replacement-of-buckets, not a
quota. Simulating it against ccdv-f's real 8-domain, 53-question blueprint
showed why that's the "off-by-one" risk this phase's plan text called out
turning out worse than off-by-one: per-domain counts on a single run ranged
±5–8 questions from the exact blueprint target (e.g.
applications-and-integration, target 17.5, ranged 12–23 across runs), and the
two smallest domains (claude-code, eval-testing-and-debugging) drew zero
questions in 19–24% of runs. The mean across many runs was unbiased — the
weights themselves were correct — but no single exam averages across runs,
and the per-domain score breakdown this app mirrors is read from one run.

`weightedSample` (`src/lib/quiz.ts`) now allocates `count` as a quota:
domains first, then each domain's quota split across its published skills,
using sum-preserving randomized rounding (Madow systematic sampling) to
resolve the fractional remainder rather than drawing buckets one at a time.
Plain largest-remainder rounding was considered and rejected — it resolves
every fractional remainder the same way on every run, which trades the
variance problem for a fixed bias (measured on ccdv-f: applications-and-
integration locked to 19 every run against a 17.5 target). Randomized
rounding keeps every run within one of the exact target *and* keeps the
long-run average exact, which a deterministic rule can't do simultaneously.
A quota that exceeds a bucket's available pool is capped and the shortfall
redistributed to buckets with room, so a thin skill pool degrades gracefully
instead of throwing or overdrawing. Verified against the shipped ccdv-f core
bank at count 53 over 5,000 runs: every domain lands on floor-or-ceil of its
exact target on every run, and no domain draws zero.

This is generic sampler code, not ccdv-f content — it applies to every cert
that declares blueprint weights. See `certs/ccdv-f/review-progress.md` for
the per-domain target percentages this fix now holds to on every run.

## Phase 5 — Polish
**Status:** DONE

- Review mode (only previously-missed/bookmarked questions).
- Domain filter matching blueprint weights.
- Basic accessibility pass (keyboard nav, focus states) and mobile
  layout check.
- Optional: dark mode, shuffle options order.

## Phase 6 — Generalize to a second cert
**Status:** DONE

- Only after CCDV-F works end-to-end. Onboard AZ-900 or AI-900 (mature
  public docs) purely as a forcing function to prove the schema/app
  aren't overfit to CCDV-F's quirks (e.g. Claude's partner-network tiering
  shouldn't leak into the shared engine).
- Expect: new `/certs/az-900/*` content files, cert-picker UI now has
  two real entries, no core app logic changes if the abstraction held.

**Met.** AZ-900 is registered through the existing data-driven catalog with
18 independently source-reviewed questions distributed across all three
current exam domains. The shared `src/` quiz engine required no changes. The
content validator now also rejects catalog entries without matching cert
folders and cert folders omitted from the catalog.

## Phase 7 — Add AWS Certified Cloud Practitioner
**Status:** DONE

- Target **AWS Certified Cloud Practitioner (CLF-C02)**. Re-check the current
  official AWS exam guide before authoring in case the exam code, domains, or
  weights have changed.
- Add `/certs/aws-clf-c02/manifest.json` and `questions.json`, then register the
  cert in `certs/catalog.json`. Do not add AWS-specific branches to the shared
  quiz engine.
- Build a set comparable to the AZ-900 forcing-function bank: **18 original,
  source-reviewed questions**, distributed proportionally across every current
  exam domain, with **six multiple-response items**.
- Cite only public AWS documentation and the public official exam guide. Do
  not copy certification exam items, AWS Skill Builder practice questions, or
  gated training content.
- Run the existing structural and answer-pattern validators. Independently
  verify every key against its cited page and record the review method and
  results beside the bank.

**Done when:** all 18 questions are `reviewed`, every current CLF-C02 domain is
represented proportionally, the validator and app smoke checks pass, the cert
appears in the picker, and no core `src/` logic changes were needed.

**Met.** AWS Certified Cloud Practitioner (CLF-C02) is registered through the
existing data-driven catalog with 18 independently source-reviewed questions
distributed 4/6/6/2 across the current 24%/30%/34%/12% domains. Six questions
are multiple-response items with five options each. Every cited public AWS page
was checked on September 3, 2026, and the shared `src/` quiz engine required no
changes.

## Phase 8 — Deploy
**Status:** PENDING

- Static hosting: GitHub Pages (fits an open-source repo well) or
  Netlify/Vercel. Pick GitHub Pages by default — zero extra accounts,
  free, matches "no backend" philosophy.
- Gotcha: project Pages serve from a subpath, so set Vite
  `base: '/Cert Club/'` and make every question-bank `fetch()` path
  relative to it. This is the single most common way a working local
  build 404s in production.
- CI already exists from Phase 1 (schema validation); extend it here with
  build + the Phase 4 unit tests on every PR.

## Phase 9 — Stretch / explicitly deferred
**Status:** PENDING (deferred — not v1)

- Community-contributed questions (PR-based) — needs a review process
  first, deliberately not v1.
- Doc-drift detection (scheduled re-fetch/diff of docs.claude.com vs.
  exam guide) to flag stale questions.
- Lab-style/hands-on questions (beyond MCQ) — noted in early research as the
  real differentiator, but explicitly a v2+ idea, not a blocker for
  shipping MCQ v1.

---

## Explicitly out of scope for v1
- Any backend/API/server-rendered logic.
- Accounts, auth, cross-device sync.
- Non-MCQ question types (labs, drag-and-drop, free text). Note that
  single-select **and multiple-response** MCQ are both *in* scope — see
  Phase 1.
- Full-size non-CCDV-F question banks; Phases 6-7 intentionally add smaller
  forcing-function sets before deeper content expansion.
- Spaced repetition (floated in early research; it's a whole scheduling model
  and the review-mode in Phase 5 covers 80% of the value for ~5% of the
  effort).
