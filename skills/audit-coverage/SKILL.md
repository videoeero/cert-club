---
name: audit-coverage
description: Offline audit of a cert bank's coverage against its blueprint, and the recommendation on promoting it from draft to stable. Judges each domain against its manifest weight, reports the bias and composition figures, and writes the reasoning into the review file. Use after a batch lands or when asked whether a bank is ready. Not for checking whether cited pages are still live or accurate, and not for authoring questions.
argument-hint: "<cert-slug>"
allowed-tools: Read, Edit, Glob, Grep, Bash
---

# Audit coverage against the blueprint

This skill is **offline by design**. It has no `WebFetch` and no `WebSearch`,
which makes it cheap enough to run after every batch and is the hard boundary
against `audit-sources`: anything requiring a page to be re-read belongs
there. It also has no `Write` — it edits existing files, it does not create
them.

## Stages

1. **Measure.** Run all three and read the output, not just the exit codes:

   ```sh
   npm run validate
   npm run balance -- --strict
   npm run metrics -- <slug> --markdown
   ```

2. **Judge per domain, never against totals.** `AGENTS.md` is explicit: never
   infer bank status from question count. A bank can reach the live exam's
   question count with a domain barely touched. The comparison is each
   domain's share of the bank against its weight in `manifest.json`, and the
   same one level down for any domain declaring `skills`.
3. **Separate the two `status` fields.** `manifest.status` is coverage of the
   blueprint; a question's own `status` is whether that item was reviewed.
   They are independent — a bank of entirely `reviewed` questions can still
   be a `draft` bank. Never derive one from the other.
4. **Do not re-flag the recorded non-defects.** The review files record
   deliberate decisions as intent. Before reporting anything as a defect,
   check whether it is already recorded as a choice. Two standing examples:
   - The per-skill floor legitimately **over-provisions the smallest
     domains**, so the thinnest skills sit above their weights. Deliberate: a
     domain with one question tests nothing reliably.
   - ccdv-f's difficulty headroom above the guide's sample questions is
     **intent, not defect** — its review file says "do not fix it". Do not
     recommend flattening a bank toward its samples. Difficulty standing is
     `harden-domain-questions`' dated note in the review file, not a coverage
     finding — read it as an input to the promotion call, do not re-derive it.
5. **Write the reasoning into `review-progress.md`**, into the existing
   composition and coverage-limits sections. Name what is _not_ covered as
   plainly as what is — a coverage audit that only reports strengths is
   useless to the next author.
6. **Recommend, with the table.** Present the per-domain comparison and a
   recommendation to promote or hold, with the reason. Then stop.

## Promotion is always human

`certs/ADDING-A-CERT.md` says there is deliberately no mechanical threshold
for `draft` → `stable`. Deliberately no threshold means deliberately no
autonomous decision:

- Never flip `manifest.status` unasked. Ask, and flip it only on an explicit
  yes, in the same change as the recorded reasoning.
- Never invent a threshold — not a question count, not a share, not a ratio —
  and do not present one as if the repo had it. If asked for the number, the
  answer is that there isn't one, and why.

## Done when

The per-domain comparison is reported, the reasoning is in
`review-progress.md`, a promote-or-hold recommendation is on the table, and
`npm run check` is still green after any edit.
