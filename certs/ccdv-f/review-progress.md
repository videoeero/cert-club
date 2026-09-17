# CCDV-F review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the Claude Certified Developer – Foundations Exam Guide v1.0
(July 2026, Exam code: CCDV-F). Sources and bank verified on September 17, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. All 106 questions are `reviewed` (0 draft). Coverage
is fully proportional across all eight domains and 25 declared skills, achieving exactly 2×
the 53-question live exam baseline (35 / 18 / 15 / 12 / 11 / 9 / 3 / 3) with every declared skill floor at ≥ 2 questions.
All quality, balance, and bias guards pass cleanly.

## Blueprint and weights

The guide publishes exact domain weights in Section 4:

| Domain                           | Slug                               |   Weight | Target (2× of 53) | Bank Questions |
| -------------------------------- | ---------------------------------- | -------: | ----------------: | -------------: |
| Applications and Integration     | `applications-and-integration`     |    33.1% |                35 |             35 |
| Model Selection and Optimization | `model-selection-and-optimization` |    16.8% |                18 |             18 |
| Agents and Workflows             | `agents-and-workflows`             |    14.7% |                15 |             15 |
| Prompt and Context Engineering   | `prompt-and-context-engineering`   |    11.0% |                12 |             12 |
| Tools and MCPs                   | `tools-and-mcps`                   |    10.6% |                11 |             11 |
| Security and Safety              | `security-and-safety`              |     8.1% |                 9 |              9 |
| Claude Code                      | `claude-code`                      |     3.1% |                 3 |              3 |
| Eval, Testing, and Debugging     | `eval-testing-and-debugging`       |     2.6% |                 3 |              3 |
| **Total**                        |                                    | **100%** |           **106** |        **106** |

Exam specs from blueprint:

- Total items: 53 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Single-select and multiple-response (multi-select)

## Composition and coverage audit

Audited against the 106-question bank:

- **Distribution**: Proportional across all 8 domains and 25 declared skills with zero surplus.
- **Item formats**: 67 single-select, 39 multi-select (24 select-TWO, 15 select-THREE).
- **Difficulty breakdown**: 17 easy (single), 37 medium (single), 23 medium (multi), 13 hard (single), 16 hard (multi).
- **Sourcing**: 44 distinct authoritative documentation pages across `platform.claude.com`, `code.claude.com`, `anthropic.com/engineering`, and `modelcontextprotocol.io`.
- **Single-select position distribution**: 11 A / 24 B / 18 C / 14 D across `a`–`d` (max 35.8%, well within 50% ceiling).
- **No multi-select key is a leading run of options**.
- **Distractor notes and subdomains**: 100% complete across all 106 questions.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

### Evolution and pruning history

- **Pruning to 106 questions (September 2026)**: Bank was pruned from 149 to 106 questions (2× baseline), retiring 43 questions across all eight domains to eliminate concept overlaps, retire low-value trivia, and align domain sizes with blueprint weights while keeping declared skill floors at ≥ 2.
- **Removal of legacy "deep" category**: The bank originally held 177 questions, including 28 tagged `"deep"` for items exceeding blueprint cognitive level or testing narrow mechanics. The two-tier hierarchy was retired to focus the entire bank directly on the exam blueprint at the proper cognitive level.

## Official sample question inventory

Section 8 of the exam guide carries **three official sample items** (Domain 2 batch processing, Domain 7 prompt injection, Domain 8 MCP server) with answer keys and rationales. The guide states they illustrate "the style and cognitive level of the exam" without being drawn from live forms.

All three share one shape: 2–3 sentences of concrete scenario with an explicit constraint, asking "which approach best fits" or "which mitigation is most effective". Single-select, four options, ~35-word stems, ~15-word options. Keys name mechanisms; distractors are transparently eliminable by high-level judgement. None tests a parameter name, status code, precedence rule, or token accounting.

The bank contains direct analogues of all three samples (`applications-and-integration-008`, `security-and-safety-003` / `-004`, `tools-and-mcps-012`), and the "which documented pattern fits" family (`agents-and-workflows-005`, `-024`, `-025`) matches sample 3 closely.

## Calibration principles and deliberate headroom

About a quarter of the bank sits **above** the samples along four deliberate axes:

1. **Distractor subtlety**: Questions turn on recalling specific documented rules rather than transparent elimination:
   - `claude-code-003`: deny rules bind in `bypassPermissions`, allow rules do not.
   - `security-and-safety-005`: deny → ask → allow precedence; first match wins regardless of specificity.
   - `model-selection-and-optimization-013`: input over window returns 400; input + `max_tokens` over window may be accepted and stopped mid-generation.
   - `model-selection-and-optimization-015`: thinking tokens count against `max_tokens`, window, and rate limits.
   - `applications-and-integration-002`: adjacent same-role messages are combined rather than rejected.
   - `agents-and-workflows-001`: hinges on there being no default turn ceiling.
   - `tools-and-mcps-008`: 1:1 client-to-server connection architecture, plus transport mapping.
   - `eval-testing-and-debugging-006`: telemetry is opt-in and requires your own collector.
2. **Multi-select share**: 39 of 106 (36.8%), including 15 select-THREE (5 of which are `hard`). All-or-nothing scoring requires 3 independent facts to land.
3. **Compound stems**: Questions asking two things simultaneously (`applications-...-001`, `-003`, `-047`, `security-...-005`, `agents-...-003`), driving mean option length to 20.3 words vs samples' ~15.
4. **Self-reported difficulty**: 29 `hard` items (27.4%) provide intentional headroom above the easy-to-medium samples.

### This headroom is deliberate — do not "fix" it

Practising above the bar is the goal. A learner who scores well here should find the real exam more comfortable. These axes are recorded so a future author recognizes them as intent rather than flattening the bank toward the samples.

**Boundaries on headroom:**

- "Above the samples" is not "above the exam": vendors tend to publish easy samples; real forms contain harder items.
- Overshoot must be avoided: questions turning on narrow documentation mechanics without exam analogues should be removed or rewritten.
- Headroom is cheap: scaled score (720 / 1000) with no per-domain minimums means a hard item carries no structural penalty.

## Bias guards and pattern tells

### Answer-length bias

An audit found correct options originally ran longer than distractors (+24.4 character mean delta; longest option was key in 61% of single-select items).

- **Distractor padding**: Distractors were padded with qualifying clauses leaving their documented reason-for-wrongness intact. Keys were trimmed only where accuracy was unaffected (never trim a key into inaccuracy).
- **Current state**: Mean delta is +3.2 characters (median +3.0 chars); longest option is key in 22% of single-select items. Locked in `schemas/question-bank.mjs` via `LENGTH_BIAS_MAX_MEAN_DELTA = 10` and `LENGTH_BIAS_MAX_LONGEST_SHARE = 0.45`.

### Distractor quality and temperature elimination

- 14 items originally offered irrelevant "raise/lower temperature" distractors. The 10 costliest were rewritten into authentic near-misses (e.g. `agents-and-workflows-017` deny rule vs hook; `eval-testing-and-debugging-007` throughput vs spend-cap 429).
- Five six-option multi-select items retain a temperature distractor where it costs proportionally less; non-urgent.

### Absolute qualifiers

- Absolutes (`always`, `never`, `only`, `must`, `every`, `cannot`, `all`, `any`, `no`) appear in 48% of distractors vs 29% of keys.
- **Distribution deliberately left alone**: Eliminating absolutes scores 25% (random baseline) and uniquely solves 0 of 67 single-select items. Flattening it would require hedged falsehoods or stripping accurate qualifiers from keys.
- **Decisive items fixed**: 7 items where the key was the sole option lacking an absolute were rewritten on 2026-09-12 and are now enforced by `questionSchema`.

## Architectural and sourcing adjudications

- **Near-duplicate adjudications**:
  - `applications-and-integration-017` / `eval-testing-and-debugging-001` (develop-tests): Resolved; `-001` retired with deep items, leaving `-017` as the SMART criteria question.
  - `applications-and-integration-007` / `prompt-and-context-engineering-005` (context-windows): Resolved; `-007` cut during 106-pruning, subsumed by `-005`.
  - `security-and-safety-005` / `claude-code-003` (permissions / permission-modes): Both kept; `-005` tests deny-first precedence, `-003` tests the `bypassPermissions` carve-out. Complementary.
- **Reading documentation**: Client-rendered pages on `platform.claude.com` and `code.claude.com` are fetched reliably by appending `.md` to the URL.
- **Sourcing boundaries**: Partner cloud documentation (AWS Bedrock, Vertex AI) and gated Partner Academy courses remain strictly outside citable sourcing.

## Maintenance audits

### Figure-bearing claims baseline (2026-09-13)

Evaluated 5 figure-bearing questions on `platform.claude.com` against re-read documentation:

- All 5 confirmed intact as Class 1 verbatim vendor facts: `model-...-005` and `-008` (5-minute cache TTL), `model-...-010` (50% discount, 24 hours), `model-...-012` (24 hours), `prompt-...-001` (up to 30 percent).
- **True defect rate**: 0 / 5 = **0.0%**.

### Recurring source drift audit (2026-09-17)

Comprehensive drift audit across all 106 questions and 44 base URLs:

- **Blueprint drift**: 0% drift. Exam guide v1.0 (July 2026, CCDV-F) re-verified on CDN. All 8 domain names, weights (33.1/16.8/14.7/11.0/10.6/8.1/3.1/2.6), 53 items, 120 minutes match `manifest.json` exactly.
- **Source liveness**: All 44 base URLs return HTTP 200.
- **Re-citations (2 items)**: `tools-and-mcps-008` and `-011` re-cited to pinned `2026-07-28` MCP specification paths per `certs/VENDORS.md`.
- **Claim adjudications**:
  - `claude-code-005`: Advisory quote mismatch "headless" confirmed intact; page retitled "Run Claude Code programmatically" while slug `/headless` and CLI flags `-p`/`--output-format json` remain documented.
  - `applications-and-integration-017`: "90 percent" confirmed as a Class 2 scenario parameter illustrating SMART properties.
  - `model-...-007`, `-008`, `-012`: Confirmed verbatim vendor facts (1-hr TTL, 5-min TTL / 2,048 tokens comma formatting, 24-hr batch).
  - Engineering blog posts (12 items citing `building-effective-agents` and `effective-context-engineering`): Confirmed intact via manual HTML review.
- **Dispositions**: 104 bump, 2 re-cite, 0 rewrite, 0 retire. True defect rate: 0 / 106 = **0.0%**. All `sourceCheckedAt` dates updated to `2026-09-17`.
