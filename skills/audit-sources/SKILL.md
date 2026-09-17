---
name: audit-sources
description: Recurring drift pass over a bank's blueprint and citations — check live exam guide for blueprint updates, audit bank impact, triage link staleness, re-answer keys cold against docs, and record dispositions. Use when triggered for a cert slug, when citations go stale, or a vendor doc moves.
argument-hint: "[cert-slug | host]"
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Audit sources and blueprint for drift

The rule that matters most, before anything else:

> **Never bump `sourceCheckedAt` without actually re-reading the page.**

That shortcut makes the field worthless and is undetectable afterward.

## Stages

1. **Blueprint drift outranks page drift (run first on cert-slug).** When given
   a cert slug, fetch `manifest.examUrl` first (observing `certs/VENDORS.md`)
   and compare upstream version, date, domain names, weights, and syllabus
   objectives against `manifest.json` and `certs/<slug>/review-progress.md`.
   - **If blueprint has changed:**
     a. Extract new structure and normalize ranges via `npm run scaffold -- --normalize "<range1>,<range2>,<range3>"`.
     b. Audit question bank impact in `questions/*.json`: identify questions on
     dropped topics (to **retire**), questions on changed syntax/APIs (to
     **rewrite** after cold doc verification), and brand-new objectives needing items.
     c. Run `npm run balance -- --2x <slug>` to re-calculate domain targets.
     d. Stop and ask: present blueprint diff, question dispositions, and balance deltas.
   - **If blueprint is intact:** explicitly state version match and continue.

2. **Mechanical triage.** Run `npm run check-sources` (with `<cert-slug>` if
   targeted, or repo-wide for whole-host sweeps). `--json` to feed a plan,
   `--offline` when only staleness matters. Run `npm run check-claims` to flag
   quotes, identifiers, and figures absent from cited pages on `.md`-serving
   hosts. These are triage worklists for stage 4, never automated verdicts.

3. **False-negative discipline, before any edit.** A single failed fetch is
   **never** grounds for changing a `sourceUrl`. Reconfirm by a second method
   before believing a page is gone (e.g. `curl -sL <url>.md` for client-rendered
   docs per `certs/ccdv-f/review-progress.md`). A redirect to a live equivalent is
   a pin-vs-float judgement call, not a broken link.

4. **Page-level drift on live URLs (scoped by host or cert).**
   Prioritise by `sourceCheckedAt` age and claim criticality. Re-answer the key
   **cold** against the cited section: read the section, answer the question,
   then compare to the recorded key.
   With page open, read free-text (`explanation`, `distractorNotes`,
   `sourceNote`, keyed options) for figure/API drift per `CONTRIBUTING.md`.
   Adjudicate `check-claims` findings against the text.

5. **One explicit disposition per affected question:**
   - **bump** — page re-read, claim intact, update `sourceCheckedAt`.
   - **re-cite** — claim intact, moved to a different page or section.
   - **rewrite** — doc or blueprint evolved under question; update stem/options/key.
   - **retire** — claim no longer holds or dropped from blueprint; cannot be rescued.

6. **Record the pass in `review-progress.md`**: the date, scope, blueprint
   check result, and disposition breakdown. Adjudicate triage findings in the
   dated section by numeric class. State what was not covered.

7. **Update `certs/VENDORS.md`.** Correct moved hosts, add discovered legacy or
   gated properties to the do-not-cite list, and re-date confirmed entries.

## Stop and ask

- **Any retirement.** Removing a question changes bank shape and balance.
- **Any manifest weight, domain, or syllabus change.** Present the blueprint diff,
  question disposition plan, and balance impact before modifying files.

## Done when

Blueprint alignment is verified, flagged questions have recorded dispositions,
no `sourceCheckedAt` moved without re-reading, pass notes are in
`review-progress.md`, `certs/VENDORS.md` is current, and `npm run check` is green.
