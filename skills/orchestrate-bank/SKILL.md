---
name: orchestrate-bank
description: Orchestrate end-to-end question authoring, cold evaluation, and difficulty hardening across all domains of a cert bank using subagents. Use when populating or expanding a scaffolded bank to its 2x baseline without manually running per-domain sessions.
argument-hint: "<cert-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Subagent, Agent, AskUserQuestion
---

# Orchestrate Certification Bank Authoring

Chains `author-questions`, `evaluate-questions`, and `harden-domain-questions` across
all domains of a bank using subagents. `certs/AUTHORING-A-CERT-WITH-SKILLS.md` Phase 2
owns the workflow details; this skill is the automated orchestration procedure.

Requires an agent environment capable of spawning isolated subagents (`Subagent` or `Agent`).

## Stages

1. **Orient & Size Quotas.**
   Read `certs/<slug>/manifest.json` and `certs/<slug>/review-progress.md`.
   Run `npm run balance -- --2x <slug>` to extract the remaining question delta
   for every domain and skill breakdown. If all deltas are met, stop.

2. **Stage A: Authoring Subagents (Parallel or Serial).**
   For each domain (or skill if declared):
   - Spawn a dedicated subagent with tool execution access.
   - Instruct the subagent to execute `skills/author-questions` for that domain or skill,
     targeting its exact quota from the balance report.
   - Each subagent edits only its own `questions/<domain>.json` and reports drafted
     items and sources back to the coordinator.
   - Once all authoring subagents complete, run `npm run check`.

3. **Stage B: Adversarial Cold Evaluation (Fresh Subagents).**
   For each domain:
   - Spawn a clean, independent subagent (strictly no prompt history from Stage A)
     to eliminate generative self-confirmation bias.
   - Instruct the subagent to execute `skills/evaluate-questions` on that domain.
   - Subagent cold-solves items against cited documentation, setting verified items to
     `reviewed` and demoting or repairing miskeys.
   - Collect disposition summaries back to the coordinator.

4. **Stage C: Difficulty Hardening Subagents.**
   For each domain:
   - Spawn a subagent to execute `skills/harden-domain-questions` on that domain.
   - Calibrates solvability and distractors against official sample questions
     inventoried in `review-progress.md`. Default outcome is no change.

5. **Stage D: Reconciliation & Bank Gate.**
   The coordinator agent:
   - Runs `npm run sync-dates`.
   - Runs `npm run check` and `npm run metrics -- <slug> --markdown`.
   - Appends a consolidated, dated summary note covering authoring, evaluation, and
     hardening dispositions to `certs/<slug>/review-progress.md`.

## Stop and ask

- **A subagent reporting unresolvable gated documentation**: Halt and escalate rather
  than drafting unverified or out-of-scope facts.
- **Widespread miskeys or unsupported dispositions**: If evaluation demotes multiple
  items in a domain, pause to confirm whether the blueprint extraction or doc mapping
  needs human attention.
- **Whole-bank bias guard failures**: If post-hardening metrics fail length or position
  guards, adjust distractors before proceeding.
- **Promotion to stable**: Do not flip `manifest.status` to `stable`; promotion is
  strictly human-gated in Phase 4.

## Done when

- All domains and skills satisfy their 2x live exam baseline in `npm run balance -- --strict`.
- Every question item carries `status: "reviewed"`.
- `certs/<slug>/review-progress.md` reflects the dated batch notes and pass outcomes.
- `npm run check` is completely green.
