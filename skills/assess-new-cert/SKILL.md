---
name: assess-new-cert
description: Recon a proposed new certification before any bank exists — locate the official exam guide, classify every candidate source on gate and authority, derive domain weights, record a GO / GO-WITH-CONSTRAINTS / NO-GO verdict, and on GO scaffold the bank and seed one sourced question per domain. Use when asked whether a cert is viable, or to start one. Not for authoring or revising questions in a bank that already exists, and not for auditing coverage or sources.
argument-hint: "<cert-slug-or-name> [exam-guide-url]"
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
2. **Locate and classify sources.** Follow `skills/classify-sources/SKILL.md`
   in full: it finds the current exam guide and labels every candidate
   documentation source citable, readable-but-not-citable, or excluded.
3. **Extract the blueprint.** Follow `skills/extract-blueprint/SKILL.md` in
   full, against the guide stage 2 settled on: weights, any skill breakdown,
   the sample-question inventory, and the format audit.
4. **Stop-and-ask: calibration.** Ask the user whether they have found public
   third-party material usable as calibration for question structure, scope
   and difficulty. Present the firewall in the repo's own words, from
   `certs/ccdv-f/review-progress.md`:

   > **Calibration only.** No question, option, or rationale here derives from
   > that set, or from any other third-party bank. It informed how deep and
   > how scenario-shaped a question should be, never what a question says.

   Record the answer either way, including "none" — a bank with no calibration
   set and no official samples is a constraint the next author must know about.

5. **Stop-and-ask: the verdict**, approved before anything is written.
   **GO** — guide public, blueprint extractable, citable documentation for
   every domain. **GO-WITH-CONSTRAINTS** — viable, but name each constraint
   concretely: a domain with thin public docs, no samples, no calibration.
   **NO-GO** — the blueprint or the material behind it is gated; say which.

6. **On GO, scaffold.** Run `npm run scaffold` with `--slug`, `--name`,
   `--exam-url`, one `--domain "<slug>:<name>:<weight>"` per domain (plus
   `--skill "<domain>/<skill>:<name>:<weight>"` if stage 3 declared one), and
   `--register`. Preview with `--dry-run` first. Then fill the recon findings
   into the seeded `review-progress.md`: source classification, sample
   inventory, calibration answer, and the constraints from the verdict.
7. **Seed one real question per domain.** Each one:
   - `scope: "core"`
   - `status: "draft"` — you wrote it, so nobody has reviewed it
   - `sourceUrl` a page labeled citable in stage 2, and `sourceCheckedAt` the
     date you fetched it

   This is not authoring the bank; it is the smoke test of the sourcing plan
   you just wrote, and the only way to learn before handing off that a
   documentation host you named is wrong. Nothing is a placeholder: a
   question with an invented `sourceUrl` is worse than an empty file. If a
   domain has no citable page, that is a constraint the verdict missed — go
   back and say so.

## Done when

A verdict is recorded. On NO-GO nothing exists under `certs/`. On GO the
review file carries the reasoning, and `npm run check` is green — the seed
question per domain is what makes that possible, since a bank with an empty
domain file cannot validate. Then hand off to `author-questions`, which sizes
its first real batch from `npm run balance`.
