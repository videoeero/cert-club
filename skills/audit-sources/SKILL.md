---
name: audit-sources
description: Recurring drift pass over a bank's citations — triage staleness and liveness, re-read the blueprint for weight or domain changes, re-answer keys cold against their cited sections, and record one disposition per affected question. Use when citations may have gone stale, a link looks broken, or a vendor doc has moved. Not for measuring coverage against the blueprint, and not for authoring new questions.
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Audit sources for drift

The rule that matters most, before anything else:

> **Never bump `sourceCheckedAt` without actually re-reading the page.**

That shortcut makes the field worthless and is undetectable afterward. The
field's whole value is that it means what it says.

## Stages

1. **Mechanical triage.** `npm run check-sources -- <slug>` reports staleness
   (`--max-age-days`) and liveness. Use `--json` when feeding the output into
   a plan, `--offline` when only staleness matters. This is triage input, not
   a verdict.
2. **False-negative discipline, before any edit.** A single failed fetch is
   **never** grounds for changing a `sourceUrl`. Reconfirm by a second method
   before believing a page is gone. `certs/ccdv-f/review-progress.md` records
   the precedent: an early pass reported seven pages as `404` or moved, all
   seven were live, and the failures were an artefact of that pass's fetcher.
   It also records the trick that makes those docs readable —
   `curl -sL <url>.md`, because the pages render client-side. A redirect is
   not drift either; a live page at a new URL is a pin-versus-float judgement
   call, not a broken citation.
3. **Blueprint drift outranks page drift.** Re-read `manifest.examUrl` first
   and compare version, date, domain names and weights against the manifest.
   A weight change invalidates the balance arithmetic for the entire bank, and
   no amount of link checking will reveal it. Do this before spending any
   effort on individual pages.
4. **Page-level drift on live URLs.** Prioritise by `sourceCheckedAt` age
   multiplied by how load-bearing the claim is — a citation carrying the whole
   discrimination between two options matters more than one supporting a
   detail. Re-answer the key **cold** against the cited section: read the
   section, answer the question, then compare to the recorded key. Adjudicate
   disagreements; the key is often right and the cold reader wrong.
5. **One explicit disposition per affected question**, and say which:
   - **bump** — page re-read, claim intact, update `sourceCheckedAt`.
   - **re-cite** — claim intact, moved to a different page or section.
   - **rewrite** — the doc changed under the question; fix the item.
   - **retag `deep`** — still sound and sourced, no longer exam-aligned.
   - **retire** — the claim no longer holds and cannot be rescued.
6. **Record the pass in `review-progress.md`**: the date, and the scope
   covered. State what was **not** covered just as explicitly, so the next
   pass knows where it is starting rather than assuming the bank was swept.

## Stop and ask

- **Any retirement.** Removing a question changes the bank's shape and can
  move a skill out of tolerance.
- **Any manifest weight or domain-name change.** That is a blueprint
  revision, not an edit: it is an `assess-new-cert` re-run, and it invalidates every
  balance judgement recorded against the old weights.

## Done when

Every question the triage flagged has one recorded disposition, no
`sourceCheckedAt` moved without its page being read, the pass and its scope
are in `review-progress.md`, and `npm run check` is green.
