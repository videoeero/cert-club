---
name: audit-sources
description: Recurring drift pass over a bank's citations — triage staleness and liveness, re-read the blueprint for weight or domain changes, re-answer keys cold against their cited sections, and record one disposition per affected question. Use when citations may have gone stale, a link looks broken, or a vendor doc has moved. Not for measuring coverage against the blueprint, and not for authoring new questions.
argument-hint: "[cert-slug | host]"
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Audit sources for drift

The rule that matters most, before anything else:

> **Never bump `sourceCheckedAt` without actually re-reading the page.**

That shortcut makes the field worthless and is undetectable afterward. The
field's whole value is that it means what it says.

## Stages

1. **Mechanical triage, always repo-wide.** Run `npm run check-sources` with
   no slug. It builds one URL set across every bank before fetching, so the
   whole repository costs less than the banks run separately — and only a
   repo-wide pass shows that a _host_ moved rather than a page. `--json` to
   feed a plan, `--offline` when only staleness matters. Triage input, not a
   verdict. Then run `npm run check-claims` for the same reason: it lists the
   quotes, identifiers and figures in each bank's free-text surface and, on
   `.md`-serving hosts, flags the ones absent from the cited page. Roughly one
   finding in ten is real, so it is a worklist for stage 4, never a verdict —
   but it reads every citation, which no reviewer reliably does.
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
4. **Page-level drift on live URLs. Scope the work by host, not by cert.**
   Drift arrives per host: a documentation reorganisation hits every question
   citing it, across banks, and one moved page deserves one disposition
   applied everywhere — not the same judgement made twice on different days.
   Certs of one vendor share hosts while sharing almost no URLs, so the host
   is the unit. Within it, prioritise by `sourceCheckedAt` age multiplied by
   how load-bearing the claim is: a citation carrying the whole
   discrimination between two options matters more than one supporting a
   detail. Re-answer the key **cold** against the cited section: read the
   section, answer the question, then compare to the recorded key.
   The page is already open: read the free-text surface (`explanation`,
   `distractorNotes`, `sourceNote`, and keyed options) against it too, checking
   for figure and API drift per `CONTRIBUTING.md` — that is where unsourced
   drift hides. Clear stage 1's `check-claims` findings for this host here,
   each against the page: most are quoted prompt fragments, config values or
   scenario names, which are not claims about the page at all. The residue is
   what the tool is for — retitled pages still quoted by their old name, and
   syntax a question teaches that the vendor never documented. Adjudicate disagreements; the key is often right and the cold
   reader wrong.
5. **One explicit disposition per affected question**, and say which:
   - **bump** — page re-read, claim intact, update `sourceCheckedAt`.
   - **re-cite** — claim intact, moved to a different page or section.
   - **rewrite** — the doc changed under the question; fix the item.
   - **retag `deep`** — still sound and sourced, no longer exam-aligned.
   - **retire** — the claim no longer holds and cannot be rescued.
6. **Record the pass in `review-progress.md`**: the date, and the scope
   covered. State what was **not** covered just as explicitly, so the next
   pass knows where it is starting rather than assuming the bank was swept.
7. **Update `certs/VENDORS.md`.** This workflow owns that file, because
   fetching every cited host on a schedule is the only thing positioned to
   notice a vendor moved. Correct any host that has changed, add a newly
   discovered legacy or gated property to the vendor's do-not-cite list, and
   re-date the entry — but only for what this pass actually re-confirmed. A
   date moved without a check makes the file exactly the kind of
   authoritative-looking trap it exists to prevent.

## Stop and ask

- **Any retirement.** Removing a question changes the bank's shape and can
  move a skill out of tolerance.
- **Any manifest weight or domain-name change.** That is a blueprint
  revision, not an edit: it is an `assess-new-cert` re-run, and it invalidates every
  balance judgement recorded against the old weights.

## Done when

Every question the triage flagged has one recorded disposition, no
`sourceCheckedAt` moved without its page being read, the pass and its scope
are in `review-progress.md`, `certs/VENDORS.md` matches what this pass found,
and `npm run check` is green.
