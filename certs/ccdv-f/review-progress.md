# CCDV-F review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the Claude Certified Developer – Foundations Exam Guide v1.0
(July 2026). Sources were last checked on September 7, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. All 106 questions are `reviewed` (0 draft). Coverage
is fully proportional across all eight domains and 25 declared skills.
All quality, balance, and bias guards pass cleanly.

## Composition

106 questions, all at `status: reviewed`.

The questions track the published domain weights:

| Domain                           | Questions | Share | Weight |
| -------------------------------- | --------: | ----: | -----: |
| applications-and-integration     |        35 | 33.0% |  33.1% |
| model-selection-and-optimization |        18 | 17.0% |  16.8% |
| agents-and-workflows             |        15 | 14.2% |  14.7% |
| prompt-and-context-engineering   |        12 | 11.3% |  11.0% |
| tools-and-mcps                   |        11 | 10.4% |  10.6% |
| security-and-safety              |         9 |  8.5% |   8.1% |
| claude-code                      |         3 |  2.8% |   3.1% |
| eval-testing-and-debugging       |         3 |  2.8% |   2.6% |

All domains match their targets exactly under the 2× exam baseline (106 questions, 2× the 53-question live form), with zero surplus and every declared skill floor at ≥ 2.

Formats: 67 single-select, 39 multi-select (24 select-TWO, 15 select-THREE).
44 distinct source pages across the whole bank.

## Pruning to 106 questions (2× baseline)

In September 2026, following the removal of the 28 `deep` items, the bank was pruned from 149
to 106 questions (exactly 2× the 53-question live exam). The pruning removed 43 questions across
all eight domains to eliminate concept overlaps, retire low-value trivia, and align domain
sizes with blueprint weights while ensuring every declared skill floor remains at ≥ 2 questions.

## Removal of the legacy "deep" question category

The bank originally held 177 questions, with 28 questions tagged with a `"deep"` scope
to separate items that exceeded the blueprint's cognitive level or turned on narrow documentation
mechanics from the 149 core questions.

In September 2026, the question scope feature and the 28 `deep` questions were removed
from the repository. Questions in the bank now focus directly on the exam blueprint at
the appropriate cognitive level, eliminating the maintenance debt of a two-tier question hierarchy.

## Calibration against the guide's own sample questions

Section 8 of the exam guide carries **three official sample items** (Domain 2
batch processing, Domain 7 prompt injection, Domain 8 MCP server) with answer
keys and rationales. The guide calls them illustrative of "the style and
cognitive level of the exam" and states they are not drawn from the live item
bank. They are published in the guide itself, so they sit inside the sourcing
boundary, which makes them the strongest anchor available: they are published
by the vendor itself as representative of the exam's style and cognitive
level, which is a claim no third-party set can carry.

All three share one shape: two or three sentences of concrete scenario with an
explicit constraint, then "which approach best fits" or "which mitigation is
most effective". Single-select, four options, ~35-word stems, ~15-word
options. The key names a mechanism. Crucially the distractors are
*transparently* bad — raise the temperature so behaviour is harder to predict;
add a line asking users not to include malicious instructions; hard-code the
logic into each system prompt. A competent practitioner eliminates three
options without recalling any documentation detail. None of the three tests a
parameter name, a status code, a precedence rule, or token accounting.

Structurally the bank matches closely: median stem **38 words**, **99 of 106**
open on a concrete scenario, four options the norm. The bank also contains
direct analogues of all three samples — `applications-and-integration-008`,
`security-and-safety-003` and `-004`, `tools-and-mcps-012` — and
the "which documented pattern fits" family (`agents-and-workflows-005`,
`-024`, `-025`) is sample-3 shape almost exactly.

Cognitively, about a quarter of the bank sits **above** the samples, along four
identifiable axes:

1. **Distractor subtlety.** Where the samples allow elimination by high-level
   judgement, these turn on recalling specific documented rules. Representative
   examples:
   - `claude-code-003`: deny rules bind in `bypassPermissions`, allow rules do not.
   - `security-and-safety-005`: deny → ask → allow precedence; first match wins regardless of specificity.
   - `model-selection-and-optimization-013`: input over window is a 400; input + `max_tokens` over window may be accepted and stopped mid-generation.
   - `model-selection-and-optimization-015`: thinking tokens count against `max_tokens`, window, and rate limits.
   - `applications-and-integration-002`: adjacent same-role messages are combined rather than rejected.
   - `agents-and-workflows-001`: hinges on there being no default turn ceiling.
   - `tools-and-mcps-008`: one client per server connection, plus transport mapping.
   - `eval-testing-and-debugging-006`: telemetry is opt-in and requires your own collector.
2. **Multi-select share.** 39 of 106 (36.8%), of which 15 are select-THREE and 5
   of those are also `hard`. All three samples are single-select; the guide
   confirms the exam mixes both formats but publishes no ratio, so ~37% is an
   unanchored choice. Under all-or-nothing scoring a select-THREE needs three
   independent facts to land.
3. **Compound stems.** Questions asking two things simultaneously (e.g.
   `applications-and-integration-001`, `-003`, `-047`, `security-and-safety-005`,
   `agents-and-workflows-003`), driving mean option length to 20.3 words
   against the samples' ~15.
4. **Self-reported difficulty.** The bank is 17 easy/single, 37 medium/single,
   23 medium/multi, 13 hard/single, 16 hard/multi. The samples are
   easy-to-medium single on this bank's own scale, so the 29 `hard` items
   (27.4%) are the headroom by the bank's own labelling.

### This headroom is deliberate — do not "fix" it

Practising above the bar is the goal. A learner who scores well here should
find the real exam more comfortable, which is the useful direction for the
error to run. The four axes above are recorded so a future author recognises
them as intent rather than rediscovering them as a defect and flattening the
bank toward the samples.

Two boundaries on that licence:

- **"Above the samples" is not "above the exam."** The anchor is three items
  the guide itself calls illustrative, and vendors tend to publish easy
  samples; a real 53-item form almost certainly contains harder items than its
  own showcase. The 24% figure is *how many items exceed the sample
  set*, not a claim that every question is a quarter harder. It is not
  evidence that further escalation is safe.
- **Overshoot must be avoided.** Questions that turn on narrow documentation
  mechanics with no analogue in the exam reference material should be removed
  or rewritten rather than retained in the bank.

The scoring facts make the headroom cheap. Section 9 of the guide confirms the
result is a single scaled score (720 on 100–1,000) against a fixed standard,
and that per-domain percentages "are not used to determine your pass or fail
result". There are no per-domain minimums, so a hard item costs one item and
nothing more — practising against a harder bank carries no structural penalty.

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
| mean(correct) − mean(distractor)           |  +24.4 | +3.2 |
| — median                                   |  +11.2 | +3.0 |
| key is the single longest option (singles) |    61% |  22% |

"Before" was measured on the 100-question bank the audit ran against; "Now" is
the current 106 post-pruning. The populations differ, so read the columns as bank states
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
- `security-and-safety-013` (subsequently retired in the 106-question pruning pass)
  offered **classifier screening**, which is recommended guidance — but the stem was
  explicitly about an instruction that slipped past screening.

`eval-testing-and-debugging-007` was fixed for the opposite reason: its two
surviving options both said "spend limit reached" and differed only on which
flavour returns 429 versus 400. A coin-flip on a lookup value is not a hard
question. The distractor is now a workspace-limit throttle, wrong for a
learnable reason: throughput 429s carry retry-after guidance and recover, spend-cap
429s do not.

**Five questions still carry a free temperature elimination**, all
six-option multi-selects where one gift costs proportionally less. Worth
doing; not urgent.

## Other pattern tells — measured, and one acted on

**Absolute qualifiers** (`always`, `never`, `only`, `must`, `every`, `cannot`,
`all`, `any`, `no`) appear in **48% of distractors against 29% of keys**. The
corresponding strategy — eliminate every option containing an absolute, then
guess among what is left — scores an expected **25% against a 25% baseline**,
and uniquely identifies the key in **0 of 67** single-select items (previously
26% across 97 items before the 106-question pruning).

**The distribution is deliberately left alone**, and that has not changed. The
residual edge is an order of magnitude weaker than the length bias was
(+36pp), it cannot carry anyone to 720/1000, and the skew is largely
*legitimate*: the cited docs state correct behaviour with genuine hedging,
while a distractor is frequently wrong precisely because it over-claims.
Flattening it would mean either writing hedged falsehoods or stripping
accurate qualifiers out of keys — both trade factual fidelity for cosmetics,
which is the trade this project's provenance rule declines to make. It is
recorded so the number is known rather than assumed, and so a future author
does not "discover" it as a new defect.

**The decisive items were not left alone.** This measurement first read 30%
expected and **7 of 109 uniquely identified** — seven items where the key was
the sole option carrying no absolute, so eliminating absolutes answered them
outright with no subject knowledge at all. On 2026-09-12 each of those seven
had one distractor rewritten, and `questionSchema` now rejects the shape, so
it cannot reappear unnoticed.

That is a narrower intervention than the one this section declines, and it is
not the same trade. Every rewrite left the distractor exactly as false as it
was and changed only the register it was false in — "Only a single image is
ever allowed per request, and it must always be positioned after all of the
text content" became "A single image per request is the documented limit, and
it belongs after the text content". No key was touched, and no hedged
falsehood was written. A distractor that is wrong on substance rather than
wrong on style is the better distractor whatever the strategy scores against
it.

## Near-duplicate adjudications

| Pair | Source | Resolution |
| --- | --- | --- |
| `applications-and-integration-017` / `eval-testing-and-debugging-001` | develop-tests | **Resolved.** `eval-testing-and-debugging-001` was retired with the legacy deep items, leaving `-017` as the SMART properties question. |
| `applications-and-integration-007` / `prompt-and-context-engineering-005` | context-windows | **Resolved in 106 pruning.** `applications-and-integration-007` was cut (subsumed by `prompt-and-context-engineering-005` which provides the richer context accounting coverage). |
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

- Answer position across single-select: 11 / 24 / 18 / 14 (n=67, max is 35.8%,
  well within the 50% ceiling).
- No multi-select key is a leading run of options.
- `subdomain` and `distractorNotes` present on all 106.

```
npm run check   # validate + balance --strict + 340 tests + lint + format
npm run typecheck
```

Both pass.

## Figure-bearing claims audit and baseline — 2026-09-13

Following the provenance rules codified in `CONTRIBUTING.md`, this pass evaluated the
figure-bearing questions in `ccdv-f` against their cited documentation. All citations in
this population are on `platform.claude.com`, which serves `.md`, so each page was
re-read in full.

### Summary of adjudications (5 items)

| Question | Claim under review | Cited page | Claim class | Verdict | Disposition |
| --- | --- | --- | --- | --- | --- |
| `model-...-005` | "5 minutes" | `prompt-caching` | Class 1 (Verbatim vendor fact) | **Confirmed**: "By default, the cache has a 5-minute lifetime." | **bump** |
| `model-...-008` | "5 minutes" | `prompt-caching` | Class 1 (Verbatim vendor fact) | **Confirmed**: same statement; 1-hour TTL documented as the alternative. | **bump** |
| `model-...-010` | "50 percent discount", "24 hours" | `batch-processing` | Class 1 (Verbatim vendor facts) | **Confirmed**: "All usage is charged at 50% of the standard API prices"; "Batches expire if processing does not complete within 24 hours." | **bump** |
| `model-...-012` | "24 hours" | `optimizing-for-cost-and-intelligence` | Class 1 (Verbatim vendor fact) | **Confirmed**: the cited page itself states batch processing is "at 50% off for work that can wait up to 24 hours" — so this is a same-page fact, not the cross-page fact an earlier version of this table recorded. | **bump** |
| `prompt-...-001` | "up to 30 percent" | `claude-prompting-best-practices` | Class 1 (Verbatim vendor fact) | **Confirmed**: "Queries at the end can improve response quality by up to 30 percent in tests, especially with complex, multidocument inputs." | **bump** |

> **Correction (same day).** An earlier version of this section covered only the four
> `model-selection-and-optimization` items and recorded their disposition as **bump**
> without moving any `sourceCheckedAt`. Both are fixed here:
> `prompt-and-context-engineering-001` was missing from the hand-selected population and
> has been adjudicated, and all five `sourceCheckedAt` values are now bumped to match the
> re-read.

### Bank metrics and true defect rate

- **Total questions in bank**: 106 (audit conducted on the 177-question pre-pruning population)
- **Figure-bearing questions evaluated**: 5 (mechanically detected; an earlier hand-selected population had 4)
- **Confirmed without change**: 5
- **Defects identified**: 0
- **True defect rate**: 0 / 5 = **0.0%**, on a fully re-read `.md`-host population.
