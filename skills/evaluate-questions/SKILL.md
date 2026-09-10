---
name: evaluate-questions
description: Adversarial per-question correctness pass over an existing bank — cold-derive each answer independently of the stored key and explanation, judge distractor quality against CONTRIBUTING.md, and set a question's status to reviewed once it survives or back to draft when it does not. Use after author-questions lands a batch, or whenever asked if questions are actually correct rather than merely schema-valid. Not for authoring new questions, not for coverage-vs-blueprint or citation-staleness passes.
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Evaluate questions for correctness

The rule that matters most, before anything else:

> `npm run check` passing means the bank is schema-valid. It says nothing
> about whether any individual `correct` key is actually correct.

No schema rule can catch a key that contradicts its own `explanation`, or an
explanation that describes an answer no option actually states. Both are real
defects that have shipped in a `draft` bank that was fully schema-valid the
whole time. This skill exists because authoring optimizes for landing a batch
green, and green is necessary but not sufficient.

**Independence is the whole method.** Do not read the stored `correct` or
`explanation` first and check whether they sound plausible together — that
rubber-stamps whatever the drafting pass believed about itself, including a
belief that happens to be wrong. Read the stem, the options, and the cited
source; decide the answer cold; only then compare against what is stored.

## Stages

1. **Scope.** One batch just landed (diff the changed question files), one
   domain, or the full bank. Read `review-progress.md` for what earlier
   passes already disposed of — do not re-litigate a recorded decision.
2. **Cold-derive, per question.** Fetch the `sourceUrl`, read the section
   `sourceNote` names, and independently decide the answer. `correct` is a
   set, not a slug: on a `multi` item derive the whole key set, and treat a
   mismatch in either direction as a defect — an option missing from the
   stored set is as wrong as an extra one, and a partially-right key is the
   characteristic multi defect. Finding your chosen option somewhere in the
   stored array is not agreement. Any mismatch is a **miskey** — the most
   severe finding this pass produces, because the bank is actively teaching
   the wrong answer.
   A failed or empty fetch is not evidence about the question. Apply
   `audit-sources`' false-negative discipline before believing a page does
   not support its key: reconfirm by a second method — for docs that render
   client-side, `curl -sL <url>.md`. An `unsupported` disposition sourced
   from one bad fetch escalates a sound question as broken.
3. **Cross-check the explanation against the key's own text**, not just
   against the source. A key can cite the right page and still be wrong if
   the `explanation` argues for a fact that no option states — that is not a
   miskey to swap, it is an unsupported item: the right answer isn't on the
   ballot.
4. **Judge distractor quality** against `CONTRIBUTING.md` § Writing good
   questions, which states the mix to aim for — read it there rather than
   from memory, and read it as a shape rather than a count, since items here
   run to five and six options. Flag facepalm options nobody would pick, and
   check every `distractorNotes` entry states a real reason a competent
   reader might believe it, not a restatement that it's false.
5. **Record one disposition per question**: confirmed, miskeyed (name the
   right option), unsupported (no option matches the source/explanation), or
   weak-distractors. Every disposition needs its own line — silently fixing
   without recording loses the evidence the next pass needs.
6. **Fix in place only what's unambiguous.** Swapping `correct` to the option
   the source actually supports, or rewriting a facepalm distractor into a
   believable one, is a same-change fix. Anything that changes which fact is
   tested, or needs sourcing this pass didn't do, goes back to
   `author-questions` or the user — do not draft new claims here.
   Swapping a key or rewriting an option can push the bank out of the
   `npm run balance -- --strict` guards. Do not trim a key to close that gap:
   `CONTRIBUTING.md` says fidelity to the cited doc outranks cosmetic
   balance. Pad distractors with equivalent qualifying clauses, or escalate.
   Leave `sourceCheckedAt` alone even when you re-read the page — that field
   belongs to `audit-sources`, and moving it here would launder a correctness
   pass into a citation-freshness claim this pass does not make.
7. **Set `status` to what this pass actually concluded, in both
   directions.** `reviewed` for questions ending on confirmed or
   fixed-and-reconfirmed; back to `draft` for any item leaving this pass with
   an unresolved disposition — the resolved ones are `reviewed` like anything
   else. Demotion is the half that is easy to skip and the half that matters:
   banks predating this skill are already entirely `reviewed`, so on those
   "don't promote it" is a no-op that leaves a known-broken item wearing the
   label, with the finding buried in `review-progress.md`.
8. **Record the pass in `review-progress.md`**: date, scope, the disposition
   counts, and what remains unreviewed — the same discipline `audit-sources`
   uses for citation drift, applied to correctness instead.

## Stop and ask

- **A miskey rate that suggests the batch's whole generation pass is
  unreliable**, not one bad item. Surface the pattern before fixing item by
  item — re-drafting the batch can be cheaper than repairing it one key at a
  time, and that's a call for the user, not a default to fix quietly.
- **An unsupported question** — no option matches the source or the
  explanation. This cannot be repaired by editing; it needs new authoring or
  retirement, both out of scope here.
- **Anything touching `manifest.json`** — a weight, domain, or status change
  belongs to `audit-coverage` or `assess-new-cert`, never here.

## Done when

Every question in scope has one recorded disposition, every confirmed or
fixed item has `status: "reviewed"` and every item with an unresolved one is
back to `status: "draft"`, `review-progress.md` names the pass and what it did
not cover, and `npm run check` is still green.
