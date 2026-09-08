# Contributing

Thanks for helping improve Cert Club. Contributions to the app and its
question banks are welcome, provided they follow the source boundary in the
README.

## Question content requirements

- Questions must be original. Do not submit exam dumps, reconstructed exam
  items, or text copied from a paid or gated course.
- Every question must cite a public source that anyone can access without an
  account or paid subscription.
- A valid citation identifies the official documentation or exam
  guide/blueprint URL, the relevant section or topic, and the date it was
  checked. A bare home-page link or an uncited claim is not sufficient.
- Explanations should show why the correct answer is correct and, when useful,
  why the distractors are wrong.

Pull requests containing confidential exam material, paywalled or gated
course content, missing provenance, or copied questions will be closed without
review.

## Writing good questions

A question is only useful if it can be answered *by knowing the material* and
not by anything else. The rules below are what stops a bank from being
solvable on pattern alone; the last three are enforced by `npm run check`, so
breaking them fails CI rather than review.

- **Distractors must be wrong for an interesting reason.** A plausible wrong
  answer states something a competent reader might actually believe — usually
  a real mechanism applied to the wrong situation, or an intuition the docs
  explicitly overturn. Record that reason in `distractorNotes`.
- **Aim for one clearly wrong option, one confidently wrong, and two that
  are genuinely hard to separate.** An item where three options are throwaways
  tests nothing but reading speed.
- **No facepalm options.** "Clearly wrong" means a claim a real practitioner
  could hold and the docs overturn — not an option no one would ever pick
  ("merge the AI-generated PR without reviewing or testing it"). Real exams do
  ship options like that; they are free eliminations and add nothing here but
  reading load. Every option should cost the candidate a decision.
- **Do not let the correct answer be the longest option.** Keys tend to grow
  because they carry the source doc's full hedged claim while distractors get
  written as crisp wrong assertions. Fix this by padding distractors with
  equivalent qualifying clauses, never by trimming a key into inaccuracy —
  fidelity to the cited doc outranks cosmetic balance. *Enforced bank-wide:
  mean key length may not exceed mean distractor length by more than 10
  characters in either direction, and the key may be the single longest option
  in at most 45% of single-select items.*
- **Vary the answer position.** No single position may hold more than 50% of
  single-select answers. *Enforced.*
- **Do not make a multi-select key the leading run of options** (`a`+`b`, or
  `a`+`b`+`c`), which is guessable from position alone. *Enforced.*
- **Write the stem as a situation, not a definition prompt.** "A team observes
  X and wants Y — what explains it?" discriminates better than "What is X?"
- Both bias guards only engage above a 20-question sample, so they will not
  fire on a small new cert bank. They are a bank-level regression check, not a
  per-question rule.

### Difficulty calibration

**Target at least the real exam's difficulty, and prefer somewhat above it.**
A learner who scores well on a bank should find the live exam more
comfortable — that is the useful direction for the error to run.

Concretely, the real exams these banks target tend to be easier than the bank:
most items can be reduced to a single surviving option by elimination alone,
and the survivor is usually the one a competent practitioner would have picked
on instinct. Bank questions may legitimately be harder than that. It is fine
for an item to have no single stand-out option and to turn on separating two
defensible answers, as long as the key is genuinely correct against its cited
source and the reasoning is recoverable from the material.

Two limits on that licence:

- Harder must not mean *ambiguous*. If two options are both defensible against
  the cited doc, the item is broken, not hard.
- Harder must not mean *deeper*. Depth beyond the blueprint's cognitive level
  belongs in `scope: "deep"` — see the depth anchors in
  [`certs/ADDING-A-CERT.md`](certs/ADDING-A-CERT.md).

**Formats the live exam does not use are still allowed if they are harder.**
Multi-select is the standing example: a bank may carry multi-select items even
for an exam that ships single-select only. All-or-nothing scoring over two or
three independent facts is strictly more demanding than picking one, so it
trains the material rather than the format. Record the divergence in the
cert's review file so a future author reads it as intent, not as a defect.

Reviewing your own answer key against its cited source is not sufficient to
catch these — a key can be perfectly faithful to the doc and still be
guessable. See `certs/ccdv-f/review-progress.md` for a worked example of a
bank that passed source review and was still 61% solvable by picking the
longest option.

## Validate content changes

Use Node.js 22 or newer, then run:

```sh
npm ci
npm run check
```

The check validates every cert manifest and question bank, then runs the schema
tests, including the deliberately invalid fixture that must be rejected.

## Pull requests

Keep changes focused and explain the source or rationale for question and
content changes. Before opening a pull request, confirm that it does not
include secrets, generated build output, or unrelated formatting changes.

By submitting a contribution, you agree that code is licensed under the MIT
License and original question content is licensed under CC BY-SA 4.0.
