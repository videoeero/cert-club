---
name: condense-review-progress
description: Distill a cert bank's review-progress.md by removing bloated drafting narratives and repetitive clean-item audit tables while strictly preserving standing decisions, blueprint anchors, and deliberate non-defects. Use after a bank promotion, batch expansion, or drift audit settles. Not for authoring questions or altering question keys.
argument-hint: "<cert-slug>"
allowed-tools: Read, Edit, Glob, Grep, AskUserQuestion, Bash
---

# Condense a bank's review record

Each `review-progress.md` opens with the rule: "Chronology lives in git;
this file holds the reasons." During drafting, authoring batches, and drift
audits, authors append
execution notes, triage tables, and narrative updates. Once work lands, these
files become bloated with walls of prose and repetitive tables that bury the
standing rationale a future author needs.

This skill distills `certs/<slug>/review-progress.md` down to its essential
architectural decisions without discarding critical context.

## Invariants: what must never be pruned

Never prune or weaken any of the following:

1. **Bank and blueprint identity**: Guide version, effective date, item count,
   duration, scoring scale, passing bar, and domain weight normalization.
2. **Bank status rationale**: The explicit human-approved promotion reasoning
   for `stable`, or coverage boundaries explaining `draft`.
3. **Current composition**: The latest distribution across domains, question
   counts, format mix (single vs multi), and source diversity.
4. **Deliberate non-defects and coverage limits**: Intentional design choices
   that cold readers might mistake for defects — such as deliberate difficulty
   headroom above sample items, domain floors over-provisioning small domains,
   omitted obsolete topics, and the calibration firewall statement.
5. **Sample question inventory**: The vendor's official sample questions,
   mechanisms tested, and their role as the cognitive depth anchor.
6. **Source classification table**: The Gate and Authority dispositions for
   citable, excluded, and readable-only documentation hosts.
7. **Architectural and sourcing adjudications**: Specific technical rulings
   explaining subtle keys, near-duplicate resolutions, or distractor designs.
8. **Audit summaries**: Date, scope, blueprint drift verdict, defect rate, and
   specific actionable fixes (rewrites, re-citations, or retirements).

## What to condense and strip

1. **Repetitive clean-item tables**: Long tables where dozens of items report
   no change (bump). Compress to a concise one-line count (e.g. "All items
   confirmed intact without change") and retain only actionable rows
   (rewrites, re-citations, or subtle adjudications).
2. **Authoring journey narratives**: Remove narrative chronologies ("first we
   tried X, then script failed, then we redrafted Y"). Keep the resulting state
   and the technical reasons, not the diary.
3. **Transient tool debugging**: Ephemeral triage logs, network timeouts, or
   fetcher troubleshooting that does not establish a lasting vendor rule.
4. **Redundant audit sections**: Consolidate repetitive multi-day audit logs
   into a single dated changelog or keep only the latest comprehensive audit.

## Stages

1. **Read `manifest.json` and `review-progress.md`** for the cert slug.
2. **Audit against the invariants**: Catalog every standing decision,
   deliberate non-defect, sample item, and architectural ruling.
3. **Draft the condensed text** (in preparation — do not treat this reply as
   the deliverable):
   - Replace prose narratives with concise bullet points or summary tables.
   - Collapse clean-pass audit rows into aggregate counts.
   - Ensure headings follow standard structure: Blueprint and weights,
     Composition, Sample question inventory, Calibration, Adjudications,
     and Maintenance audits.
4. **Verify integrity**: Ensure no invariant, domain rationale, or non-defect
   was dropped. Check that all referenced questions still exist in the bank.
5. **Present diff to maintainer**: Report line and byte reductions, highlight
   the condensed areas, and request confirmation before applying edits.
6. **Apply the edits to the file**: Once confirmed, use `Edit` to write the
   condensed text back into `certs/<slug>/review-progress.md` itself. The
   deliverable is the modified file on disk, never a condensed copy pasted into
   the reply or held in memory — leaving the file unchanged means the skill did
   not run.
7. **Verify repository checks**: Run `npm run check` to confirm formatting and
   validation remain clean.
