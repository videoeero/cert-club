# Adding a new question type

This document is the authoritative, ordered touchpoint list for adding a new
`type` to the question schema — e.g. match-pairs, ordering — for human
contributors and AI agents alike. It is a sibling of
[`ADDING-A-CERT.md`](./ADDING-A-CERT.md), which covers adding a *bank*; this
one covers adding a new *shape* of question that every bank can then use.

## Read this first: you probably don't need a new type

`PLAN.md` § "Explicitly out of scope for v1" is direct about this:

> Non-MCQ question types (labs, drag-and-drop, free text). Note that
> single-select **and multiple-response** MCQ are both *in* scope.

A new `type` touches ten files (below), a client-side storage migration, and
every place that scores, renders, and reports an answer. That is a large
blast radius for a format decision. Before starting, check whether the format
you want can instead be expressed as `type: "multi"` — because it usually
can, and `CONTRIBUTING.md` § "Difficulty calibration" already licenses this:

> Formats the live exam does not use are still allowed if they are harder.
> Multi-select is the standing example: … All-or-nothing scoring over two or
> three independent facts is strictly more demanding than picking one, so it
> trains the material rather than the format.

Match-pairs and ordering are usually reducible this way. "Match each of these
three terms to its definition" is, information-theoretically, "select the
three statements that correctly pair a term with its definition" out of a
larger option list — all-or-nothing over three independent facts, which is
exactly the multi-select case `CONTRIBUTING.md` already sanctions, and it is
*harder* than a drag-and-drop matching UI, not easier, because there is
nowhere to hide a partial answer. The same reduction usually works for a
short ordering task ("select the two steps that must happen before step 3").

So: reach for `type: "multi"` first, and record the reduction in the cert's
`review-progress.md` (the pattern `ADDING-A-CERT.md` already asks for when a
bank uses a format the live exam doesn't). Only keep reading if you have a
concrete case that genuinely cannot be expressed as a selection over a fixed
option list — a full permutation ordering over more than a handful of items
is the realistic example, since multi-select cannot express *sequence*, only
*membership*.

## The layers, in order

Verify each of these against the code before changing it — this list is a
map of where the shape lives, not a substitute for reading the current
implementation of each file.

### 1. `schemas/question-bank.mjs` — the schema

- `questionSchema.type` is `z.enum(["single", "multi"])`; widen it.
- Every object in this file is `.strict()` (`optionSchema`, `questionSchema`,
  `manifestSchema`, `domainSchema`, `catalogSchema`), so any new payload a
  type needs (e.g. a `pairs` field, or a `sequence` field distinct from
  `options`/`correct`) must be declared on the schema explicitly or it is
  rejected — there is no room to just start writing new keys into question
  JSON.
- The `superRefine` on `questionSchema` has two type-conditioned refinements
  that assume exactly two types exist: `type === "single"` requires
  `correct.length === 1`; `type === "multi"` requires `correct.length >= 2`.
  Both need a third branch, and a third refinement immediately below them —
  the "correct options must not be exactly the first options in listed
  order" guessability check — is currently gated on `type === "multi"` too
  and needs its own decision for the new type (does position-guessability
  even apply to it?).
- Decide what `correct` *means* for the new shape before writing the branch.
  For `single`/`multi` it is "the subset of `options` ids that are right." An
  ordering type needs a sequence, not a subset — `correct: string[]` can
  still hold it, but its semantics change from "set" to "ordered list," which
  ripples into every consumer that currently treats `correct` as a set (see
  §5). A pairing type needs pairs, which `correct: string[]` cannot express
  at all without inventing a delimiter convention — prefer a new field over
  overloading the existing one, since overloading breaks `.strict()`'s
  clarity and every string-array assumption downstream.

### 2. `src/types.ts` — the TypeScript shape

- `Question.type` is an inline literal union (`"single" | "multi"`), not an
  exported named type — widen it here, and it is worth promoting it to a
  named `QuestionType` export at the same time so the other files below have
  one place to import it from instead of repeating the literal union.
- `AnswerMap = Record<string, string[]>` is the shape stored in
  `AttemptRecord.answers` and threaded through the whole app. It fits
  "selected option ids" or "an ordered sequence of option ids" but not a
  pairing (which needs a mapping, not a list). If the new type needs
  structure `string[]` can't hold, `AnswerMap`'s value type has to become a
  union or a discriminated shape, and that change alone touches every reader
  of `answers` in `quiz.ts`, `storage.ts`, `QuizSessionPage.tsx`, and
  `ResultsPage.tsx`.

### 3. `src/lib/storage.ts` — persisted attempts

- `AttemptRecord` (which embeds `answers: AnswerMap`) is persisted to
  `localStorage` behind a versioned envelope: `{ version: STORAGE_VERSION,
  data }`, written by `writeValue` and read by `readValue`. `readValue`
  already discards anything whose `version` doesn't match the current
  `STORAGE_VERSION`, or whose `data` fails the relevant type guard —
  returning the caller's fallback instead of throwing. That means the safe
  path is already built in: **bump `STORAGE_VERSION`** when the answer shape
  changes, and every envelope written under the old shape is silently
  discarded on next read rather than misread. Do not skip the bump — an
  unbumped version with a changed `isStringArrayMap`/`isAttemptRecord` guard
  is the one way this *could* throw or silently corrupt data instead of
  cleanly discarding it.
- `isStringArrayMap` (used inside `isAttemptRecord` to validate
  `answers`) checks that every value is a flat array of strings. A pairing or
  ordering answer shape needs its own guard alongside or instead of it, kept
  in sync with whatever `AnswerMap`'s value type becomes in `types.ts`.
- A returning user's existing attempt history is what's at stake: the goal is
  "old envelopes quietly stop showing up," never "the app throws and
  white-screens." Confirm this with a test that feeds an old-shape envelope
  through `getAttempts`/`getAttempt` after the bump and asserts it comes back
  empty/absent, not thrown.

### 4. `src/lib/content.ts` — the second source of truth

- `isQuestion` (module-private; also `isOption`, `isManifest`, `isSkill`) is
  the hand-rolled runtime type guard the app actually calls, because zod is
  not shipped in the browser bundle. It must grow whatever fields the new
  type needs, mirroring the schema change in §1 field-for-field.
- This is exactly the drift `test/field-parity.test.mjs` (this authoring
  toolkit's deliverable alongside this document) exists to catch: it derives
  the required-field list from `questionSchema.shape` and asserts
  `loadCertContent` rejects a question missing any one of them. Run it after
  changing `isQuestion` — a new required field the guard doesn't check yet is
  precisely the failure mode it's built to catch. It does not, however, check
  a type-conditional field (one required only when `type` is the new value)
  — extend the test's fixtures if the new type has any, since the derived
  list only sees unconditionally-required keys.

### 5. `src/lib/quiz.ts` — selection and scoring

- `scoreAnswer` scores by order-insensitive set equality (`selected.size ===
  correct.size` and every selected id is in `correct`). It cannot score an
  ordering type, where `[a, b, c]` and `[c, b, a]` must be scored
  differently. It needs a type-conditional branch.
- `selectQuizOption` is typed `questionType: "single" | "multi"` and encodes
  the interaction model directly: single replaces the selection, multi
  toggles membership up to `requiredCount`. Neither matches "pick a position
  for each item" or "pick a partner for each item."
- `pickIncorrectOptions` and `simulateQuizAnswers` (used to generate
  simulated attempts for manual QA / demos) both assume "the wrong answer is
  some other N-sized subset of distractor option ids" — they shuffle
  `options` filtered by `!correctSet.has(id)` and slice to
  `question.correct.length`. An ordering or pairing type's "wrong answer"
  isn't a subset at all, so both need a type-conditional generator.

### 6. `src/components/QuizQuestion.tsx` — the question UI

- `AnswerOptionList` computes `isSelectionLimitReached` from `question.type
  === "multi"` and renders `<input type={question.type === "multi" ?
  "checkbox" : "radio"} …>` — the single/multi binary is load-bearing here,
  not just descriptive. A new type needs its own control (e.g. numbered
  drag-handles or ordinal `<select>`s per item for ordering; a `<select>` per
  left-hand item for pairing) and its own branch in this component, not a
  third value slotted into the existing radio/checkbox conditional.
  `QuestionHeader`'s `isMulti` label ("Multiple response" vs. "Single
  response") needs a third label too.
- The `fieldset`/`legend`/`aria-describedby` wiring here is built around a
  single native `<input>` group with one accessible name and one set of
  selected values. A non-radio, non-checkbox control (drag-and-drop reorder,
  or a set of per-row `<select>`s) needs its own aria pattern — reordering
  controls in particular need an aria-live announcement of position changes,
  which nothing here currently provides.
- `AnswerFeedback` renders `question.correct.map(id => id.toUpperCase()).join(", ")`
  as "the correct answer" — a flat, unordered join. It cannot express "in
  this order" or "A pairs with 3, B pairs with 1."

### 7. `src/pages/QuizSessionPage.tsx` — the session gate

- `requiredAnswerCount = question.correct.length` and
  `hasRequiredSelectionCount = selectedOptionIds.length === requiredAnswerCount`
  gate whether the learner can proceed (`canProceed`) when `revealMode` is
  not `"immediate"`. This is a *count* check, so it happens to still work for
  an ordering type, whose `correct` length is still meaningful.
- **If you took § 1's advice and gave the new type its own field instead of
  overloading `correct`, this gate breaks and it breaks quietly**: a question
  with an empty or absent `correct` reports `requiredAnswerCount === 0`, so
  `canProceed` is satisfied before the learner has answered anything. Branch
  the answer count on `question.type` — the new type has to say how many
  selections it considers complete, whatever field holds them. That is the
  cost of the cleaner schema, and it is worth paying deliberately rather than
  discovering here.

### 8. `src/pages/ResultsPage.tsx` and `AnswerFeedback` — post-quiz review

- `QuestionReview` in `ResultsPage.tsx` renders `question.options` as a flat
  `<ul>`, marking each as selected/correct/incorrect independently — the same
  flat, unordered model as `AnswerFeedback` in `QuizQuestion.tsx` (§6). Both
  need a new rendering branch for a type whose correctness is relational
  (pairing) or sequential (ordering); neither can express either today.

### 9. Tests

- `test/quiz.test.mjs` has a single `question()` fixture factory
  (`type = "single"` default, `correct = ["a"]` default) used across the
  whole file. A new type needs its own fixture beside it — extending the
  existing factory with more optional parameters is preferable to a second,
  divergent factory, to keep the two shapes' tests comparable.
- `test/fixtures/broken/questions.json` must keep failing validation after
  the change — it exercises an unrelated failure (`correct` referencing a
  nonexistent option id) that has nothing to do with `type`, so it should be
  unaffected, but confirm `test/validate-content.test.mjs`'s
  "rejects the deliberately broken fixture" case still passes.
- Extend `test/field-parity.test.mjs`'s fixtures (see §4) if the new type
  adds a type-conditionally-required field, since its derived field list only
  covers unconditional requirements.

### 10. Docs

- `ADDING-A-CERT.md`'s field-rules table row for `type` (currently `"single"`
  or `"multi"`) needs the new value, and its "Key field rules" prose
  wherever it describes `correct`'s single/multi arithmetic.
- `AGENTS.md` doesn't currently name the type enum directly, but its
  "Schema is the source of truth" section is the right place to point at
  this document once a type beyond `single` and `multi` exists.
- `PLAN.md` § "Explicitly out of scope for v1" explicitly excludes non-MCQ
  types; record the decision to add one as an amendment there rather than
  silently contradicting it.

## The hazard no file list surfaces: the bank-level guards

`questionBankSchema` in `schemas/question-bank.mjs` runs four bank-level
guards, and three of the four assume "an options array with a key/distractor
split," each gated behind its own minimum sample size:

- `POSITION_BIAS_MIN_SAMPLE = 20` — no single option position may hold too
  large a share of single-select answers; filtered to `type === "single" &&
  correct.length === 1`, so a new type is automatically excluded from this
  one's sample as written.
- `LENGTH_BIAS_MIN_SAMPLE = 20`, checked twice against the same filtered
  set (`scored`, then `scoredSingles`, both built from `optionLengths()`):
  once for mean key-vs-distractor length delta (`scored` — any question
  where `optionLengths()` finds at least one key and one distractor, so any
  type reusing the `options`/`correct` key-subset shape qualifies as
  written), and once for how often the key is the single longest option
  (`scoredSingles`, additionally filtered to `type === "single"`, so a new
  type is excluded from this half regardless).
- `SCOPE_MIN_SAMPLE = 20` — the core/deep share floor, which counts every
  question regardless of `type`, so a new type always participates in this
  one.

A new type has exactly two honest outcomes against each guard, and the
dangerous failure is picking neither on purpose:

1. **It participates.** Then you must define, for the new shape, what
   "correct option" and "distractor" mean (for `optionLengths`) and what
   "position of the correct answer" means (for the position-bias guard) — an
   ordering type has no single "correct position," and a pairing type has
   several.
2. **It's excluded** — the filters above simply don't match the new type's
   shape, so its questions never enter `singles`/`scored`/`scoredSingles`.

Excluding is a legitimate choice, but it has a silent cost in the one place
that matters most: the schema-level guards inside `questionBankSchema` that
`npm run check` actually gates on. There, "sample below minimum" and "sample
present and clean" produce the *identical* outcome — no issue is raised
either way — because each guard is simply skipped below its `*_MIN_SAMPLE`
threshold with no separate signal for "didn't run." (`npm run metrics`, a
separate, non-gating report, does compute and print a distinct status per
guard — `guardStatus()` in `scripts/bank-metrics.mjs` — but nothing requires
anyone to run or read it, and it is not part of `npm run check`.) So in the
gate that actually blocks a merge: if the new type becomes a meaningful share
of a bank, every `single`-only or `optionLengths`-shaped guard's *effective*
sample shrinks by however many questions moved to the new type — a bank that
comfortably cleared `POSITION_BIAS_MIN_SAMPLE` on its single-select questions
before the new type existed can quietly drop back under 20 once a slice of
what used to be single-select is rewritten as the new type, and the gate
reports the same "all checks passed" either way. Whoever adds a new type
needs to decide, explicitly and in the cert's `review-progress.md`, whether
the new type counts toward these samples, and if it doesn't, to actually run
`npm run metrics` before and after to see whether a guard silently dropped
below threshold — the gate itself will not tell you.
