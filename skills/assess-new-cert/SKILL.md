---
name: assess-new-cert
description: Recon a proposed new certification before any bank exists — locate the official exam guide, classify every candidate source on gate and authority, derive domain weights, record a GO / GO-WITH-CONSTRAINTS / NO-GO verdict, and on GO scaffold the bank and seed one sourced question per domain. Use when asked whether a cert is viable, or to start one. Not for authoring or revising questions in a bank that already exists, and not for auditing coverage or sources.
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Recon a proposed certification

Decide whether a cert can be banked **from public sources alone**, and if so
on what terms. `AGENTS.md` § Non-negotiable content rule and
`certs/ADDING-A-CERT.md` are authoritative; read them first.

## What this skill may write

Only the scaffolded tree, `certs/catalog.json`, and the cert's row in the
README table — the four steps in `ADDING-A-CERT.md`, nothing past them. Create
no file under `certs/` by hand; every one comes out of `npm run scaffold`, so
the layout has one author and this skill edits only what the scaffold made.

**Never edit the test suite.** A test enumerating real banks may legitimately
need the new slug, but a recon changing its own gate marks its own homework.
Report it and let a human make that edit.

## Stages

1. **Preflight the slug.** Read `certs/catalog.json` and the `certs/` folders.
   An existing slug means this is an authoring or audit job, not recon — stop
   and say so.
2. **Find the official guide, then find the _current_ one.** Read
   `certs/VENDORS.md` first — if this vendor has a profile it names where the
   guides live, which documentation hosts are citable, and which of its
   properties must not be cited. Then fetch the guide with no credentials; if reading it needs an account, the recon is already in NO-GO
   territory. Vendors leave old revisions up indefinitely, and a superseded
   guide passes every other test in this skill — so read the version and date
   block and record both verbatim. A `Version 0.1` from last year is not the
   guide, however officially it is hosted. When two vendor copies exist,
   prefer the higher version, and prefer the one on the path the vendor's
   other guides use — check where an existing bank's `examUrl` points.
3. **Classify every candidate source on both axes.** _Gate_: the test is
   **registration, not price**, and the vendor's own official course fails it
   however official it is. _Authority_: is the publisher the party that owns
   the fact? A copy of the guide in a public repository passes the gate and
   fails authority — it is unciteable, and as `examUrl` it would put the whole
   blueprint on a mirror. Both get re-litigated every time. Label each URL
   citable, readable-but-not-citable (a course's public landing page is the
   standing example — it evidences coverage, never a fact), or excluded, and
   say which axis excluded it.
4. **Weights.** If the guide publishes exact integers, check they sum to 100
   and move on — there is nothing to normalise. Only if it publishes _ranges_
   run `npm run scaffold -- --normalize "25-30,35-40,30-35"`, which does the
   midpoint-and-largest-remainder arithmetic that prose does not.
5. **Record the skill breakdown if the guide publishes one.** Declaring
   `skills` opts the bank into per-skill weighted sampling _and_ into the
   `--strict` balance gate. Say that out loud — it is a commitment, not a
   detail.
6. **Inventory the guide's sample questions.** They are the cognitive-level
   anchor (`ADDING-A-CERT.md` § How deep should a question go?, anchor 2). A
   guide with none means the bank has no vendor-published calibration and
   depends on the answer to stage 7.
7. **Format audit.** Quote the guide's own sentence on item format into the
   review file rather than summarising it; a summary hides a misread, and
   whether the exam ships multiple-response items shapes every batch after
   this one. Then: does any objective need a question type the schema does
   not have? Default answer: no. Multi-select expresses more than expected —
   see `add-question-type` before believing otherwise.
8. **Stop-and-ask: calibration.** Ask the user whether they have found public
   third-party material usable as calibration for question structure, scope
   and difficulty. Present the firewall in the repo's own words, from
   `certs/ccdv-f/review-progress.md`:

   > **Calibration only.** No question, option, or rationale here derives from
   > that set, or from any other third-party bank. It informed how deep and
   > how scenario-shaped a question should be, never what a question says.

   Record the answer either way, including "none" — a bank with no calibration
   set and no official samples is a constraint the next author must know about.

9. **Stop-and-ask: the verdict**, approved before anything is written.
   **GO** — guide public, blueprint extractable, citable documentation for
   every domain. **GO-WITH-CONSTRAINTS** — viable, but name each constraint
   concretely: a domain with thin public docs, no samples, no calibration.
   **NO-GO** — the blueprint or the material behind it is gated; say which.

10. **On GO, scaffold.** Run `npm run scaffold` with `--slug`, `--name`,
    `--exam-url`, one `--domain "<slug>:<name>:<weight>"` per domain (plus
    `--skill "<domain>/<skill>:<name>:<weight>"` if stage 5 applies), and
    `--register`. Preview with `--dry-run` first. Then fill the recon findings
    into the seeded `review-progress.md`: source classification, sample
    inventory, calibration answer, and the constraints from the verdict.
11. **Seed one real question per domain.** Each one:
    - `scope: "core"`
    - `status: "draft"` — you wrote it, so nobody has reviewed it
    - `sourceUrl` a page you fetched in stage 3, and `sourceCheckedAt` the
      date you fetched it

    This is not authoring the bank; it
    is the smoke test of the sourcing plan you just wrote, and the only way
    to learn before handing off that a documentation host you named is wrong.
    Nothing is a placeholder: a question with an invented `sourceUrl` is
    worse than an empty file. If a domain has no citable page, that is a
    constraint the verdict missed — go back and say so.

## Done when

A verdict is recorded. On NO-GO nothing exists under `certs/`. On GO the
review file carries the reasoning, and `npm run check` is green — the seed
question per domain is what makes that possible, since a bank with an empty
domain file cannot validate. Then hand off to `author-questions`, which sizes
its first real batch from `npm run balance`.
