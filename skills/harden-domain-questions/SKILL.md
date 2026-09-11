---
name: harden-domain-questions
description: Difficulty-calibration pass over one domain of an existing bank — measure how solvable its questions are against the guide's own sample questions, and lift the ones that sit at or below sample difficulty by padding weak distractors and tightening stems, without changing which fact is tested. Default outcome is no change. Use when a domain feels too easy, or after author-questions lands a batch and you want it calibrated before it ships. Not for fixing a wrong key or a facepalm option in isolation (evaluate-questions), not for adding coverage or new facts (author-questions).
argument-hint: "<cert-slug> <domain-slug>"
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Harden a domain to the exam's difficulty

`CONTRIBUTING.md` § Difficulty calibration owns the rule — target at least the
live exam's difficulty and prefer somewhat above, with two limits: harder must
not mean _ambiguous_ and must not mean _deeper_. § Writing good questions owns
the distractor mix, the facepalm rule and the key-length tell. This skill is
the order of operations for applying those to one domain; it restates them
only in the shorthand the procedure needs.

The anchor is not your judgement of "feels hard." It is the guide's own
**sample questions**, inventoried per bank in `review-progress.md` (as ccar-f
and ccdv-f already do). The vendor publishes those as representative of the
exam's cognitive level, a claim no third-party set carries. Calibrate to them,
not to instinct.

## Stage 0 — default to no change

This gate is mandatory and most domains clear it untouched. A domain already
_above_ its sample anchor, with distractors wrong for an interesting reason, is
done; editing it to "feel harder" only risks the ambiguity or depth
CONTRIBUTING forbids.

Proceed on a question only when _both_ hold: the domain is at or below its
sample anchor, and the item is soft in a nameable way — an obvious stand-out
key, or a distractor eliminable without knowing the material. If either fails,
the disposition is **calibrated — no change**, recorded like any other. A pass
that touches nothing and says why is a successful pass.

## Stages

1. **Scope one domain.** Never several. Read the cert's `manifest.json`, the
   target `questions/<domain>.json`, and `review-progress.md` — the sample
   inventory and any prior calibration note are your anchor and must not be
   re-litigated silently.
2. **Pin the anchor for this domain.** From the sample inventory take the items
   that map to this domain, and read what separates key from distractors —
   whether elimination alone reaches one option, or the sample forces a
   decision between two defensible ones. If the guide samples no item here,
   calibrate to the nearest sampled domains' shape and say so in the note.
3. **Measure current solvability, per question**, against the tells
   CONTRIBUTING names across both sections: does elimination alone leave one
   survivor a competent practitioner picks on instinct (below the band); does
   the key win on the length tell (`npm run metrics -- <slug>` shows it
   bank-wide); is any distractor a facepalm that eliminates for free?
4. **Harden only what Stage 0 admits, two ways, both preserving the tested
   fact.** To make a distractor faithful, read the cited `sourceUrl` and, when
   a near-miss leans on a real mechanism from elsewhere, the vendor doc that
   describes it — reading a source to shape and disprove an option is not
   re-sourcing the question, and `sourceUrl`/`sourceNote` still must not
   change.
   - **Pad or replace weak distractors** into near-misses — a real mechanism
     in the wrong situation, or an intuition the docs overturn — recording the
     reason in `distractorNotes`. Aim for the mix CONTRIBUTING § Writing good
     questions names, which describes a single-select item; a multi-select is
     hardened by its all-or-nothing key instead.
   - **Tighten the stem into a situation** whose concrete constraint forces the
     discrimination, rather than a definition prompt.

   Do not touch `correct`, and do not change which fact the item tests — those
   are author-questions and evaluate-questions calls (see "Stop and ask").

5. **Do not overshoot.** Re-read each edit against CONTRIBUTING's two limits,
   checking a padded distractor against the cited doc so it is wrong rather
   than a second defensible answer: two options both defensible against that
   source is _ambiguous_, not hard — back it out; a discrimination now turning
   on a rule past the blueprint's level is _deeper_ — back that out too.
   Retagging the item `scope: "deep"` is not this pass's edit: it needs a
   `scopeNote` and moves the bank's core share, so route it to
   `author-questions`.
6. **Respect the bias guards.** Padding moves the length and position figures;
   never trim a key to compensate — fidelity to the cited doc outranks cosmetic
   balance. If padding cannot close a gap, escalate rather than trimming a key.
7. **Record one disposition per question** in `review-progress.md` —
   _calibrated — no change_, or _hardened_ with the axis lifted (weak
   distractor, obvious key, definition-prompt stem) — plus a dated line on the
   domain's standing versus its anchor, as the existing calibration sections do.
8. **Land green.** `npm run metrics -- <slug>` is the diagnostic and
   `npm run check` is the gate; it stays green throughout — this pass changes
   difficulty, never schema validity.

## Stop and ask

- **A wrong or contradicted key surfaces while reading** is a miskey — the most
  severe finding a bank produces, and `evaluate-questions`' disposition, not
  this pass's. Hand it off; do not swap a key here.
- **A domain soft because a fact is missing**, not because a distractor is
  weak, needs authoring — route it to `author-questions` with its own sourcing
  rather than inventing a claim in a hardening edit.
- **A question liftable only by going deeper than the blueprint.** Depth is not
  difficulty: leave it, or route the `scope: "deep"` retag and its `scopeNote`
  to `author-questions` per `certs/ADDING-A-CERT.md`.
- **Anything touching `manifest.json`** — weights, domains, `status` — belongs
  to `audit-coverage`, never here.

## Done when

Every question in the domain has one recorded disposition (including the
_no change_ ones), every hardened item still tests the same fact against the
same source and reads unambiguously against it, `review-progress.md` carries a
dated note on the domain's standing versus its sample anchor, and
`npm run check` is still green.
