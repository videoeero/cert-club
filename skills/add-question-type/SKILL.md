---
name: add-question-type
description: Gate and hazard list for introducing a new question type (ordering, match-pairs, fill-in) beyond single and multi select. Starts by arguing the change is unnecessary, then names the hazards a file list does not surface. Use only when a new answer shape is genuinely under consideration. Not for authoring questions in the existing types, and not for schema changes unrelated to question shape.
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion, Bash
---

# Adding a new question type

`certs/ADDING-A-QUESTION-TYPE.md` holds the ordered touchpoint list — schema
through UI through tests — and is authoritative on the sequence. Do not start
there.

## Stage 0 — argue against it

Mandatory, and it is most of this skill. **Can multi-select express this?**

`CONTRIBUTING.md` licenses formats the live exam does not use _when they are
harder_, and all-or-nothing multi-select over three independent facts usually
is. So the honest answer is almost always "no new type — express it as
multi-select", and reaching for the touchpoint list first means implementing
a schema change to solve an authoring problem.

Make the argument out loud, with the specific objective in hand, and get an
explicit answer before touching any file. `PLAN.md` still lists non-MCQ types
as out of scope for v1; overriding that is a `schemaVersion` conversation.

## The hazards no file list surfaces

- **Every schema object is `.strict()`**, and question shape has two sources
  of truth: the zod schema and the hand-rolled `isQuestion` guard in
  `src/lib/content.ts` (zod is not in the browser bundle). A new field must
  land in all layers or `loadCertContent` throws at runtime.
  `test/field-parity.test.mjs` is the check — run it.
- **`correct: string[]` may not generalise.** `scoreAnswer` compares unordered
  ID sets; ordering and matching answers are ordered or paired. Decide up
  front whether the representation generalises or forks, because the choice
  propagates into `AnswerMap` and into persisted attempts.
- **The bias guards assume "an options array with a key subset."** Either
  define what key-versus-distractor length means for the new shape, or
  exclude it — and if you exclude it, **say so in the review file**, because
  excluding questions silently shrinks the guard sample below its minimum and
  turns the guard off unnoticed.
- **`AttemptRecord` is persisted** behind a versioned `localStorage`
  envelope. A new answer shape is a migration, and it must discard or migrate
  old envelopes rather than throw — a throw white-screens returning users.
- **`test/fixtures/broken/` must still be rejected.** A loosened schema that
  starts accepting the deliberately invalid fixture is a silent regression.

## Done when

`npm run check`, `npm run typecheck` and `npm run build` are green; the
field-parity test is clean; a back-compat test loads a pre-existing
`AttemptRecord`; the `type` row in `certs/ADDING-A-CERT.md` § Step 3 is
updated; and **at least one real question of the new type exists in a real
bank** — a type with no instance is dead code that will rot.
