---
name: extract-blueprint
description: Given a certification's located and versioned exam guide, derive its domain and skill weights, inventory its sample questions as the cognitive-level anchor, and audit its stated item format. Use only as the second phase of assess-new-cert's recon, after classify-sources has settled the guide and its sources. Not for revising an existing bank's blueprint — a weight or domain change there belongs to audit-sources — and not for authoring questions.
argument-hint: "<exam-guide-url-or-file> [cert-slug]"
allowed-tools: Read, WebFetch, Bash
---

# Extract a cert's blueprint

Phase two of `assess-new-cert`'s recon, run against the guide
`skills/classify-sources/SKILL.md` located and versioned.
`certs/ADDING-A-CERT.md` owns the field rules this applies.

## Stages

1. **Weights and sizing.** If the guide publishes exact integers, check they
   sum to 100 and move on — there is nothing to normalise. Only if it publishes
   _ranges_ run `npm run scaffold -- --normalize "25-30,35-40,30-35"`, which does
   the midpoint-and-largest-remainder arithmetic that prose does not. Record the
   official item count as `examQuestionCount`; the full bank target is 2x that
   count, distributed via `npm run balance -- --2x` (or `--target <2*count>`).
2. **Record the skill breakdown if the guide publishes one.** Declaring
   `skills` opts the bank into per-skill weighted sampling _and_ into the
   `--strict` balance gate. Say that out loud — it is a commitment, not a
   detail.
3. **Inventory the guide's sample questions.** They are the cognitive-level
   anchor (`ADDING-A-CERT.md` § How deep should a question go?, anchor 2). A
   guide with none means the bank has no vendor-published calibration and
   depends on the calibration stop-and-ask back in `assess-new-cert`.
4. **Format audit.** Quote the guide's own sentence on item format into the
   review file rather than summarising it; a summary hides a misread, and
   whether the exam ships multiple-response items shapes every batch after
   this one. Then: does any objective need a question type the schema does
   not have? Default answer: no. Multi-select expresses more than expected —
   see `add-question-type` before believing otherwise.

## Done when

Weights sum to 100 (normalised if the guide published ranges), any skill
breakdown is recorded with its commitment noted, the sample inventory is
listed, and the format audit's quote is captured verbatim. Hand all four back
to `assess-new-cert` for the calibration and verdict stop-and-asks.
