# CCDV-F review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the Claude Certified Developer – Foundations Exam Guide v1.0
(July 2026). Sources were last checked on September 7, 2026.

## Composition

177 questions, all at `status: reviewed`.

| Scope  | Questions | Share |
| ------ | --------: | ----: |
| `core` |       149 | 84.2% |
| `deep` |        28 | 15.8% |

`core` questions are traceable to a blueprint objective and pitched at the
exam's cognitive level. `deep` questions are sound and sourced but sit above
that level; they are served only when the learner opts into "Include deeper
practice", and are excluded from the blueprint balance arithmetic entirely.

The `core` slice tracks the published domain weights:

| Domain                           | Core | Share | Weight |
| -------------------------------- | ---: | ----: | -----: |
| applications-and-integration     |   46 | 30.9% |  33.1% |
| model-selection-and-optimization |   24 | 16.1% |  16.8% |
| agents-and-workflows             |   23 | 15.4% |  14.7% |
| prompt-and-context-engineering   |   16 | 10.7% |  11.0% |
| tools-and-mcps                   |   14 |  9.4% |  10.6% |
| security-and-safety              |   13 |  8.7% |   8.1% |
| claude-code                      |    7 |  4.7% |   3.1% |
| eval-testing-and-debugging       |    6 |  4.0% |   2.6% |

`claude-code` and `eval-testing-and-debugging` sit above their weights because
`MINIMUM_SKILL_TARGET` floors every skill at 2 questions, which over-provisions
the smallest domains. That is deliberate: a domain with one question tests
nothing reliably.

Core formats: 97 single-select, 52 multi-select (36 select-TWO, 16
select-THREE). 65 distinct source pages across the whole bank.

## Why the scope split exists

The bank was calibrated against the only public full-length CCDV-F practice
set, `docs/claude_certified_developer_foundations_practice_exam.md`, written by
someone who had sat the exam. That set is uniformly scenario-driven — situation,
then recognise the governing principle — and almost never asks for a parameter
name, a status code, or a field-level contract.

Measured against it, most of this bank matches. A tail did not: questions that
turn on narrow documentation mechanics with no analogue anywhere in the
reference set. Those 28 are now tagged `deep` rather than deleted, because each
is accurate, sourced, and genuinely instructive — just not a rehearsal of the
exam.

Each `deep` question carries a `scopeNote` justifying the classification
against the blueprint; the schema requires one and forbids it on `core`.

Tagged `deep` (28):

| Domain                           | Questions                                     |
| -------------------------------- | --------------------------------------------- |
| applications-and-integration     | 006, 011, 013, 020, 021, 023, 048, 050        |
| model-selection-and-optimization | 003, 004, 009, 010, 011                       |
| prompt-and-context-engineering   | 006, 007, 008, 011, 021                       |
| eval-testing-and-debugging       | 001, 005, 007                                 |
| tools-and-mcps                   | 003, 009, 010                                 |
| agents-and-workflows             | 002, 010                                      |
| security-and-safety              | 010, 012                                      |

Two of these (`eval-testing-and-debugging-001` and `-005`) are tagged for a
different reason from the rest: they are not merely deep but off-objective,
testing success-criteria and A/B methodology where the Domain 4 objective
covers error identification, recovery, and trace analysis. An earlier
`out-of-scope` scope value recorded that distinction. It was removed in favour
of a two-value taxonomy, because a third bucket bought nothing the UI or the
arithmetic used — both treated `deep` and `out-of-scope` identically — while
letting a question sit unclassified by default. `scope` is now mandatory, so a
new question cannot enter the bank without a decision.

### The 80% floor

`SCOPE_MIN_CORE_SHARE = 0.8`, checked above `SCOPE_MIN_SAMPLE = 20` questions.

The default filter is `core-only`, so the exam-aligned slice is what a learner
practising cold actually sits. If tagging drifts upward, that default pool
shrinks below a useful size and the bank stops rehearsing the real thing. The
floor is a ceiling on tagging, not a target to fill: tag a question `deep`
because it overshoots the exam, never to reach a quota.

Two second-order effects are worth knowing before tagging anything else.
Tagging shrinks the `core` pool, which shrinks every per-skill balance target,
which can push a skill you did not touch outside `BALANCE_TOLERANCE`. And
because the guard engages only above 20 questions, it will not fire on a small
new cert bank.

## Answer-length bias

An audit of the reviewed bank found a systematic answer-length bias: correct
options ran markedly longer than their distractors, because the key carried the
source doc's full hedged claim while distractors were written as crisp wrong
assertions. This survived source review precisely because that review only
proves the key is faithful to the cited source — it says nothing about whether
the question discriminates.

"Always pick the longest option" scored **37/61 = 61%** on single-select
against a ~25% random baseline, enough to clear the exam's 720/1000 bar on
typography alone.

| Metric                                     | Before | Now  |
| ------------------------------------------ | -----: | ---: |
| mean(correct) − mean(distractor)           |  +24.4 | +2.6 |
| — median                                   |  +11.2 | +2.0 |
| key is the single longest option (singles) |    61% |  19% |

"Before" was measured on the 100-question bank the audit ran against; "Now" is
the current 177. The populations differ, so read the columns as bank states
rather than as a controlled before/after.

The fix was applied to distractors first: each was padded with equivalent
qualifying clauses leaving its documented reason-for-wrongness intact, and
several were tightened into genuine near-misses. Keys were trimmed only where
it cost no accuracy. Provenance outranks cosmetic balance — never trim a key
into inaccuracy to satisfy a metric.

Thresholds in `schemas/question-bank.mjs` lock in the achieved state:

- `LENGTH_BIAS_MAX_MEAN_DELTA = 10` characters, checked in **both** directions,
  since a bank whose keys are reliably shorter is just as guessable as one
  whose keys are reliably longer.
- `LENGTH_BIAS_MAX_LONGEST_SHARE = 0.45` for single-select, against a ~25%
  chance rate and the position guard's comparable 50% ceiling.

Run against the pre-fix bank the guard fails on both axes, which is the
regression it exists to catch.

## Distractor quality

A separate pass measured how often a distractor could be eliminated for free.
14 questions offered a "raise/lower the temperature" option in a context where
temperature was plainly irrelevant — a gift of 25% of the option space in a
four-option item.

The 10 costliest were rewritten into genuine near-misses that encode real
misconceptions rather than filler. Two illustrate the intended standard:

- `agents-and-workflows-017` now offers a **deny rule**, which really does
  block the write. The stem also requires every attempt to be recorded, which
  a deny rule does not do and a hook does.
- `security-and-safety-013` now offers **classifier screening**, which is
  recommended guidance — but the stem is explicitly about an instruction that
  slipped past screening.

`eval-testing-and-debugging-007` was fixed for the opposite reason: its two
surviving options both said "spend limit reached" and differed only on which
flavour returns 429 versus 400. A coin-flip on a lookup value is not a hard
question. The distractor is now a workspace-limit throttle, wrong for a
learnable reason: throughput 429s carry retry-after guidance and recover, spend-cap
429s do not.

**Five questions still carry a free temperature elimination**, all
six-option multi-selects where one gift costs proportionally less. Worth
doing; not urgent.

## Other pattern tells — measured, not acted on

**Absolute qualifiers** (`always`, `never`, `only`, `must`, `every`, `cannot`,
`all`, `any`, `no`) appear in **49% of distractors against 29% of keys**. The
corresponding strategy — eliminate every option containing an absolute, then
guess among what is left — scores an expected **30% against a 25% baseline**,
and uniquely identifies the key in only 7 of 109 single-select items.

**This is deliberately left alone.** A +5pp edge is an order of magnitude
weaker than the length bias was (+36pp), it cannot carry anyone to 720/1000,
and the skew is largely *legitimate*: the cited docs state correct behaviour
with genuine hedging, while a distractor is frequently wrong precisely because
it over-claims. Removing the pattern would mean either writing hedged
falsehoods or flattening accurate qualifiers out of keys — both trade factual
fidelity for cosmetics, which is the trade this project's provenance rule
declines to make. It is recorded so the number is known rather than assumed,
and so a future author does not "discover" it as a new defect.

## Near-duplicate adjudications

| Pair | Source | Resolution |
| --- | --- | --- |
| `applications-and-integration-017` / `eval-testing-and-debugging-001` | develop-tests | **Both kept.** Different domains, different layers: the first asks for the abstract SMART properties, the second for a concrete worked metric. |
| `applications-and-integration-007` / `prompt-and-context-engineering-005` | context-windows | **Both kept.** The first is an easy single-select overview; the second a medium multi-select drilling into specifics. |
| `security-and-safety-005` / `claude-code-003` | permissions / permission-modes | **Both kept.** Different source pages. The first tests deny-first evaluation order, the second the `bypassPermissions` carve-out. Complementary, not redundant. |

## Source review

Every key was independently answered cold against its cited source and
adjudicated where the cold reader disagreed. In every disagreement the answer
key proved correct and the cold reader had erred: once by conflating two
mechanisms the source described separately, once by stopping at the first
correct option in a multi-select, once by answering a different question than
the stem asked.

The docs render client-side, so the reliable way to read a page is to append
`.md` to its URL:

```sh
curl -sL https://platform.claude.com/docs/en/build-with-claude/compaction.md
```

An early review pass reported `404` / "content moved" for seven source pages.
All seven were live and correct; the failures were an artefact of that pass's
URL fetcher, not doc drift. No `sourceUrl` needed changing. Confirm a page is
genuinely gone before editing a `sourceUrl`.

## Verified clean

- Answer position across single-select: 30 / 30 / 27 / 22 (no position holds
  more than the 50% ceiling).
- No multi-select key is a leading run of options.
- `subdomain` and `distractorNotes` present on all 177.
- `scope` present on all 177; every non-`core` question carries a `scopeNote`.

```
npm run check   # validate + balance --strict + 69 tests + lint + format
npm run typecheck
```

Both pass.
