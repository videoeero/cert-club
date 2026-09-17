# Agent workflows

Procedures for the recurring content work: recon a proposed certification,
author a batch of questions, evaluate a batch's per-question correctness,
harden a domain to the exam's difficulty, audit a bank's coverage, audit its
citations for drift, condensing a review record, and the gate on adding a new
question type.

## Install

They are plain markdown and can simply be read. To have your agent retrieve
them by itself, symlink them into its skills directory:

```sh
npx skills@1.5.25 add .            # this checkout, for the agents you have
npx skills@1.5.25 add . --list     # see them without installing
npx skills@1.5.25 remove --all     # undo
```

The install targets are gitignored: which agent you use is your choice, not
repository content.

The version is pinned on purpose. `npx skills` without one runs whatever was
published most recently, on your machine, the first time anyone sets up — bump
it here deliberately instead. npx will offer to download the package if you do
not have it cached; that prompt is expected.

The CLI reports usage telemetry to `add-skill.vercel.sh` when it installs from
GitHub or another remote source. Installing from a local path, as above, sends
nothing: it derives no source identifier for a local path, and the telemetry
call is gated on having one. Verified by reading `dist/cli.mjs` at 1.5.25 —
worth re-checking if you bump the pin. `DO_NOT_TRACK=1` or `DISABLE_TELEMETRY=1`
disables it either way.

## These are procedures, not rules

They say in what order to do the work and where the judgement calls sit. Every
rule they apply belongs to [`AGENTS.md`](../AGENTS.md),
[`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`certs/ADDING-A-CERT.md`](../certs/ADDING-A-CERT.md), which are
authoritative. Where a workflow here disagrees with one of those, the document
wins and the workflow is wrong — fix it rather than following it.

Do not add a rule to this folder. A rule stated in two places drifts, and this
repository has already had to repair one instance of exactly that.

For the end-to-end operator runbook showing how to chain these skills together
to build a complete cert bank from scratch, see
[`certs/AUTHORING-A-CERT-WITH-SKILLS.md`](../certs/AUTHORING-A-CERT-WITH-SKILLS.md).

| Workflow                                                        | Use it when                                                             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`assess-new-cert`](assess-new-cert/SKILL.md)                   | Deciding whether a proposed cert can be banked from public sources      |
| [`classify-sources`](classify-sources/SKILL.md)                 | Phase one of `assess-new-cert`: locating and labeling candidate sources |
| [`extract-blueprint`](extract-blueprint/SKILL.md)               | Phase two of `assess-new-cert`: deriving weights, samples and format    |
| [`author-questions`](author-questions/SKILL.md)                 | Writing or revising a batch of questions                                |
| [`evaluate-questions`](evaluate-questions/SKILL.md)             | Checking a batch's answer keys and distractors are actually correct     |
| [`harden-domain-questions`](harden-domain-questions/SKILL.md)   | Calibrating one domain's difficulty up to the guide's sample questions  |
| [`audit-coverage`](audit-coverage/SKILL.md)                     | Checking coverage against the blueprint, or judging `draft` → `stable`  |
| [`audit-sources`](audit-sources/SKILL.md)                       | Re-checking citations for staleness, dead links or doc drift            |
| [`condense-review-progress`](condense-review-progress/SKILL.md) | Distilling a review record down to its essential decisions and anchors  |
| [`add-question-type`](add-question-type/SKILL.md)               | Considering an answer shape beyond single and multi select              |
