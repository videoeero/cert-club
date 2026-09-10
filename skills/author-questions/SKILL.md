---
name: author-questions
description: Write or revise a batch of questions for one domain or skill of an existing cert bank — size the batch from the balance report, cite public sources, apply the depth anchors, and land the batch green. Use when asked to add, extend, rewrite or fix questions. Not for deciding whether a new cert is viable, not for the draft-to-stable promotion decision, and not for the recurring source-drift pass.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Author a question batch

`certs/ADDING-A-CERT.md` § Step 3 owns the field rules and
`CONTRIBUTING.md` § Writing good questions owns the item-quality rules. Read
both; this skill is the order of operations, not a second copy.

## Stages

1. **Orient.** Read the cert's `manifest.json`, the target `questions/*.json`,
   and `review-progress.md` — the review file records earlier judgement calls
   as intent, and re-deciding them silently is the main failure mode here.
   Then run `npm run balance -- --target <n>` and `npm run metrics -- <slug>`.

   **Batch size is a balance output, not a user preference.** If the user asks
   for ten and the target skill is four short, say so and reconcile before
   drafting — writing ten pushes the skill out the other side.

2. **Sources first, questions second.** Find the documentation that
   establishes the fact, fetch each page, and confirm two things: that it
   opens with no account, and that the vendor publishes it. A redirect to a
   login or a signup wall is a gated source; a copy of vendor material on
   someone else's site is unciteable however open it is. Record the URL you
   actually landed on, not the one you typed — a legacy URL that redirects
   today can degrade to a section root tomorrow, which no longer establishes
   the claim. `sourceCheckedAt` is the date you actually read the page.
3. **Depth gate, per question.** Apply the three anchors in
   `ADDING-A-CERT.md` § How deep should a question go?. Anchor 2 is the one
   that gets missed, and it reduces to one testable rule:

   > Named flags, parameters and constants may appear as supporting detail
   > inside the correct option, but the **discrimination between options must
   > be conceptual**.

4. **Draft the whole batch before polishing any item.** The bias guards are
   bank-level, and key rotation and distractor padding are batch operations —
   polishing item by item just relocates the skew.
5. **Self-check.** `npm run metrics -- <slug>` is the only way to see the bias
   figures on a bank still below the guards' sample minimum, where
   `npm run validate` reports nothing. Read them before you are green, not
   after.
6. **Iterate to green on `npm run check`.** That is the gate — not
   `scripts/test.sh`, which is strictly weaker.
7. **Append a dated batch note to `review-progress.md`** in the same change:
   what was added, which sources, which judgement calls, what is still thin.

## Stop and ask

- **A question whose only viable source is gated.** Do not swap in a different
  URL and keep the question — that yields a citation which does not establish
  the claim. Drop the question or bring the problem back to the user.
- **Trimming a key for cosmetic length balance.** Forbidden:
  `CONTRIBUTING.md` says fidelity to the cited doc outranks cosmetic balance.
  Pad distractors with equivalent qualifying clauses; if that will not close
  the gap, escalate rather than trimming a key into inaccuracy.
- **Heavy `scope: "deep"` tagging in one batch.** Depth problems are usually
  allocation problems, and tagging has a second-order cost: it shrinks the
  `core` pool, which shrinks every per-skill target, which can push a skill
  you never touched out of tolerance. Fix the allocation first.

## Done when

- `npm run check` is green.
- Every new question's `sourceCheckedAt` is the date its page was read.
- The target skill's delta is inside tolerance in `npm run balance -- --strict`.
- `review-progress.md` is updated in the same change.

Green here means schema-valid, not correct — every key was written by the
same pass that will judge it correct. Run `evaluate-questions` next, ideally
in a session that didn't draft this batch, before treating it as reviewed.
