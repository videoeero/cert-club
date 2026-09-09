# Agent workflows

Procedures for the recurring content work: recon a proposed certification,
author a batch of questions, audit a bank's coverage, audit its citations for
drift, and the gate on adding a new question type.

## Install

They are plain markdown and can simply be read. To have your agent retrieve
them by itself, symlink them into its skills directory:

```sh
npx skills add .            # this checkout, for the agents you have
npx skills add . --list     # see them without installing
npx skills remove --all     # undo
```

The install targets are gitignored: which agent you use is your choice, not
repository content.

## These are procedures, not rules

They say in what order to do the work and where the judgement calls sit. Every
rule they apply belongs to [`AGENTS.md`](../AGENTS.md),
[`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`certs/ADDING-A-CERT.md`](../certs/ADDING-A-CERT.md), which are
authoritative. Where a workflow here disagrees with one of those, the document
wins and the workflow is wrong — fix it rather than following it.

Do not add a rule to this folder. A rule stated in two places drifts, and this
repository has already had to repair one instance of exactly that.

| Workflow                                          | Use it when                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| [`assess-new-cert`](assess-new-cert/SKILL.md)     | Deciding whether a proposed cert can be banked from public sources     |
| [`author-questions`](author-questions/SKILL.md)   | Writing or revising a batch of questions                               |
| [`audit-coverage`](audit-coverage/SKILL.md)       | Checking coverage against the blueprint, or judging `draft` → `stable` |
| [`audit-sources`](audit-sources/SKILL.md)         | Re-checking citations for staleness, dead links or doc drift           |
| [`add-question-type`](add-question-type/SKILL.md) | Considering an answer shape beyond single and multi select             |
