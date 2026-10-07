# Implementation Plan: Optional per-option `hintText` + "Show hints" toggle

Status: APPROVED 2026-10-07, amended 2026-10-07 after external plan review (7 of
8 findings validated against code; see § Review amendments embedded in phases).
User decisions locked in:

- Code only in this change; CLF-C02 content migration is a follow-up (Phase 4).
- Hints always visible in post-quiz review (ResultsPage) and once revealed in
  immediate mode; toggle only before answering.
- Migration scope when it happens: CLF-C02 only; other banks (az-900, ccar-p,
  ccar-f, ccdv-f) migrate deliberately later.
- Field name is **`hintText`** (camelCase): every multi-word property in the
  schema, types, and banks is camelCase (`schemaVersion`, `distractorNotes`,
  `sourceCheckedAt`); `hintText` keeps that 100% consistent.

Background: ~98% of bank options (534/543 in aws-clf-c02) carry inline glosses
("Spot Instances, unused EC2 capacity at a significant discount"), while the real
exam uses bare service names. Split glosses into optional `hintText`, revealed by
a per-question button.

Implement with `implement-phase` conventions: complete phases in order, mark
status per phase when its acceptance criteria pass, run `npm run check` (and
`npm run build`, since `src/` changes) before marking any phase COMPLETE.

---

## Phase 1: Schema + app types + loader + claim checks + tests

Status: COMPLETE

### Changes

- `schemas/question-bank.mjs` — `optionSchema` gains
  `hintText: z.string().min(1).optional()`. All objects are `.strict()`, so the
  field must be declared explicitly. Do NOT bump `SCHEMA_VERSION`: the field is
  optional, every existing bank still validates (ADDING-A-QUESTION-TYPE.md
  reserves version bumps for breaking/type changes).
- `src/types.ts` — `QuestionOption.hintText?: string`.
- `src/lib/content.ts` — `isOption` (hand-rolled runtime guard; no zod in
  browser bundle) must validate `hintText` as a non-empty string when present.
  Mirror the zod schema field-for-field.
- `scripts/check-claims.mjs` — **review amendment**: `provenanceSurface`
  (lines ~165–175) and `extractFigures` (~198–227) currently read `opt.text`
  only for keyed options. Add `opt.hintText` alongside `opt.text` for keyed
  options in both, so keyed-option glosses moved into `hintText` keep being
  figure-verified against cited docs. Note: `check-claims` is a standalone
  audit script, not part of `npm run check` — nothing in CI enforces this, so
  without the change the gap is silent.
- `test/check-claims.test.mjs` — extend fixtures to cover `hintText` figures in
  the provenance surface (fixture around line 124).
- `test/field-parity.test.mjs` — derives required fields from
  `questionSchema.shape`, so it stays green on its own; extend fixtures to
  assert (a) a question with `hintText` loads, (b) a non-string `hintText` is
  rejected by `isQuestion`/`loadCertContent`, (c) an empty-string `hintText`
  (`""`) is rejected — schema is `min(1)`. Add `hintText` to the
  "accepts a question carrying every optional field" fixture (~line 191) so
  that test truly covers all optional fields.
- `test/quiz.test.mjs` — confirm no change needed: `scoreAnswer`,
  `selectQuizOption` are id-based, must remain untouched.

### Acceptance

- `npm run check` green; `npm run build` green.
- Field-parity tests pass including the three new cases.
- `check-claims` fixture tests cover `hintText`.

---

## Phase 2: Quiz-session hint toggle UI

Status: COMPLETE

### Changes

- `src/pages/QuizSessionPage.tsx` — new state
  `hintRevealedQuestionIds: Set<string>` + toggle handler, following the
  existing `revealedQuestionIds` / `strikethroughs` useState pattern
  (per-question id sets). NOT persisted to localStorage; hints are
  per-session ephemeral, unlike bookmarks/attempts. **Review amendment**: the
  state must be reset in all THREE session lifecycle sites where
  `setRevealedQuestionIds(new Set())` already runs: (1) the cert-slug/retry
  effect (~line 86), (2) the retake-session effect (~line 147), (3) the
  `onStartSession` callback (~line 281). Otherwise hints leak across sessions.
- `src/components/QuizQuestion.tsx`:
  - **Review amendment (prop interfaces)** — extend explicitly:
    - `QuizQuestionProps`: `isHintRevealed: boolean; onToggleHint: () => void;`
    - `QuestionHeaderProps`: `hasHints: boolean; isHintRevealed: boolean;`
      plus existing `isRevealed`/`revealMode` as needed for button gating.
    - `AnswerOptionListProps`: `showHints: boolean` — computed by the parent as
      `isHintRevealed || (revealMode === "immediate" && isRevealed)` so
      auto-show-on-reveal is a derived value, not extra state.
  - "Show hints" button rendered only when
    `question.options.some((o) => o.hintText)` AND `!isRevealed`. In
    `revealMode: "end"` the button stays available for the whole session
    (isRevealed is false during the quiz); in immediate mode it disappears
    once revealed, when hints auto-show — leaving a dead "Hide hints" button
    post-reveal would contradict the locked decision.
  - **Review amendment (header layout)**: `.questionCardHeader` is
    `display: flex; justify-content: space-between` with exactly two children
    (`.questionMeta`, bookmark button); a third direct child pushes the
    bookmark to center, and the `@media (max-width: 40rem)` rule switches the
    header to `flex-direction: column`, stacking buttons awkwardly. Wrap the
    hint button + bookmark button in a `questionActions` container:
    `.questionActions { display: flex; align-items: center; gap: var(--space-sm); }`
  - **Review amendment (CSS Grid + label semantics)**: `.answerOptionLabel`
    is a 3-column grid (`1.25rem 2.125rem 1fr` — input, option bubble, text).
    A hint as a 4th direct child wraps into column 1 under the radio button.
    Wrap column 3 in a **`<span>`** (NOT `<div>` — `<label>` permits phrasing
    content only, so a flow element would be an HTML validation error)
    holding `option.text` + the conditionally rendered hint; style it
    `display: flex; flex-direction: column; gap: 0.25rem;`.
  - **Review amendment (fieldset)**: the `<fieldset>` is
    `disabled={isRevealed}` (~line 97), so a hint button inside it dies once
    an answer is checked in immediate mode. The button lives in
    `QuestionHeader` (inside `questionActions`, outside the fieldset), so
    this is satisfied by the header placement above.
  - **Review amendment (strikethrough)**: when `isStruck`, the hint must
    inherit the strikethrough/muted styling along with `option.text` —
    apply `strikethroughText` to the column-3 wrapper (or wrap both in `<s>`)
    so a struck option never shows a bright, active hint. Also `aria-expanded`
    on the toggle button.
- `src/components/QuizQuestion.module.css` — hint styling (muted, consistent
  with existing feedback/explanation styles); `.questionActions` action-group
  class; column-3 wrapper class (`optionContent`-style span with
  flex-direction: column).
- `src/pages/ResultsPage.tsx` — in `QuestionReview`, render each option's
  `hintText` inline (muted), NO toggle: the answer is already revealed there
  (user decision). **Review amendment (CSS Grid)**: `.reviewOption` is a
  2-column grid (`2.125rem 1fr`); the hint must be nested inside column 2
  alongside `option.text`, not added as a direct `<li>` child. Questions
  without hints render exactly as today.

### Acceptance

- `npm run build` green.
- Browser smoke: question with `hintText` shows the button and reveals/hides on
  click; question without hints shows no button; in immediate mode hints
  auto-appear after reveal; struck option mutes its hint; layout has no
  broken column (hint below label, not under the radio); results page shows
  hints inline in column 2. Use `browser.open` on the Vite dev server with a
  hand-edited fixture question in a throwaway working-tree edit (revert
  after).

---

## Phase 3: Docs + review-record note

Status: COMPLETE

### Changes

- `CONTRIBUTING.md` — document `hintText` field + new convention: `text` should
  be the bare service/tool name matching the live exam format (parenthetical
  acronym expansion allowed, e.g. "AWS Database Migration Service (AWS DMS)");
  explanatory gloss goes in `hintText`. Glosses in `hintText` are option claims
  — same sourcing rule as `text`, and verified by `check-claims` (per Phase 1).
- `certs/ADDING-A-CERT.md` — add `hintText` to the field-rules table.
- `certs/aws-clf-c02/review-progress.md` — record that the schema now supports
  `hintText`, that the gloss-stripping migration of the bank's options was
  still pending at that point, and the migration rule: only service/tool-name
  options ("Service, which <gloss>" / "Service, <noun phrase>") get stripped;
  statement-style options whose text IS the answer content ("Security groups
  are stateful firewalls, so…") stay intact with no hint.

### Acceptance

- `npm run check` green (it also runs the sync-dates and content validation).
- Docs consistent with schema (no contradiction with AGENTS.md "schema is the
  source of truth").

---

## Phase 4: CLF-C02 content migration

Status: COMPLETE

Split 354 glossed options across 87 service/tool/concept questions in
`certs/aws-clf-c02/questions/*.json` into bare `text` + `hintText`, using the
migration rule in Phase 3. The 41 statement-style questions (181 options) and
the 2 already-bare questions (8 options: tech-009, tech-010) stay intact with
no hints. Verified with `npm run check` (bias guards re-measured: option length
mean delta shifted to -0.48 chars, longest-is-key at 18.7%, all passing);
verified with `npm run balance -- --strict`, `npm run build`, and `npm run check-claims`.
Updated `test/bank-metrics.test.mjs` and `certs/aws-clf-c02/review-progress.md`.

---

## Out of scope

- Migrating other cert banks (az-900, ccar-p, ccar-f, ccdv-f).
- Any settings panel / global preference (toggle is per-question,
  per-session).
- Persisting hint state.
- `SCHEMA_VERSION` bump.
