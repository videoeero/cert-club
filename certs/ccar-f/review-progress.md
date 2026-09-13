# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F). Sources and bank
verified on September 11, 2026.

## Bank status: `draft`

`manifest.status` is `draft`. All 110 questions are `reviewed` (0 draft). Coverage is
tightly proportional across all five domains, with each domain within ~1 percentage
point of its blueprint weight. The bank is held at `draft` by deliberate human decision
pending evaluation of `deep`-scope coverage (currently 100% `core`, 0 `deep`).

Promote to `stable` only on an explicit human decision weighing that standing depth
limitation, and record that reasoning here.

## Recon verdict: `GO`

The certification assessment reached a unanimous **GO** verdict:
- The official exam guide is publicly accessible without credentials or registration.
- Domain weights are explicitly defined integers that sum to exactly 100%.
- The exam includes 12 official scenario-based sample questions with full rationales.
- Public, authoritative vendor documentation covers every objective across all five domains.
- Question format is standard single- and multi-select, requiring no schema extensions.

## Blueprint and weights

The guide publishes exact domain weights in Section 4. Normalized with `npm run scaffold -- --normalize "27,18,20,20,15"`:

| Domain | Slug | Weight | Target | Bank Questions |
| --- | --- | ---: | ---: | ---: |
| Agentic Architecture & Orchestration | `agentic-architecture-and-orchestration` | 27% | 27 | 29 |
| Tool Design & MCP Integration | `tool-design-and-mcp-integration` | 18% | 18 | 20 |
| Claude Code Configuration & Workflows | `claude-code-configuration-and-workflows` | 20% | 20 | 22 |
| Prompt Engineering & Structured Output | `prompt-engineering-and-structured-output` | 20% | 20 | 22 |
| Context Management & Reliability | `context-management-and-reliability` | 15% | 15 | 17 |
| **Total** | | **100%** | **100** | **110** |

Exam specs from blueprint:
- Total items: 60 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Scenario-based multiple-choice (single-select) and multiple-response (multi-select)

### Skill breakdown

Section 6 of the exam guide outlines 30 task statements across the five domains (1.1–1.7, 2.1–2.5, 3.1–3.6, 4.1–4.6, 5.1–5.6), but does not publish individual percentage weights for task statements. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `az-900` and `aws-clf-c02`.

## Composition and coverage audit

Audited against the 110-question bank on 2026-09-11. `npm run validate`, `npm run metrics -- ccar-f --markdown`, and `npm run check` all clean. `npm run balance -- --strict` does not list ccar-f as no domain declares `skills`.

Composition is tightly proportional across all five domains, with no domain acting as a coverage floor:

| Domain | Core | Share | Weight | Δ |
| --- | ---: | ---: | ---: | ---: |
| Agentic Architecture & Orchestration | 29 | 26.4% | 27% | −0.6 |
| Tool Design & MCP Integration | 20 | 18.2% | 18% | +0.2 |
| Claude Code Configuration & Workflows | 22 | 20.0% | 20% | 0.0 |
| Prompt Engineering & Structured Output | 22 | 20.0% | 20% | 0.0 |
| Context Management & Reliability | 17 | 15.5% | 15% | +0.5 |
| **Total** | **110** | **100%** | **100%** | |

### Format mix and pattern review

- **Item formats**: 100 single-select, 10 multi-select (all select-2; 2 per domain).
- **Difficulty breakdown**: 71 medium (64 single, 7 multi), 39 hard (36 single, 3 multi).
- **Sourcing**: 23 distinct authoritative documentation pages; 100% `core` scope.
- **Single-select position distribution**: 25 A / 26 B / 25 C / 24 D across `a`-`d` (max 26%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is -3.58 characters (median -1.00 chars), well within the ±10 character ceiling.
- **Longest option as key share**: 19 of 100 single-select items (19%), comfortably below the 45% ceiling and outperforming the 25% random baseline.
- **Distractor notes coverage**: 100% of distractor options across all 110 questions carry complete explanations in `distractorNotes`.
- **All four bias guards pass**: `positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`, and `scopeCoreShare`.

### Known coverage limits

- **Depth**: 0/110 `deep`-scope questions, vs. ccdv-f's 28/177. Deferred by explicit user decision (2026-09-10, "no need to add deep questions") — not a current gap, listed for completeness.
- **Task-statement granularity**: The guide's 30 task statements carry no published percentage weights, so coverage is verified at domain level only, not below it.

## Source classification

Evaluated against the repository's two non-negotiable tests (Gate and Authority):

| Candidate Source | Gate | Authority | Disposition | Notes |
| --- | --- | --- | --- | --- |
| Official Exam Guide PDF (`everpath-course-content.s3-accelerate.amazonaws.com`) | Pass | Pass | **Citable** | Canonical vendor blueprint hosted on official Skilljar CDN. |
| Claude Code documentation (`code.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Authoritative vendor reference for Claude Code, CLI, subagents, and Agent SDK. Accessible as `.md`. |
| Claude Platform documentation (`platform.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Authoritative vendor reference for Messages API, tool use, context windows, batch processing. Accessible as `.md`. |
| Model Context Protocol Specification (`modelcontextprotocol.io`) | Pass | Pass | **Citable** | Official MCP open standard specification published by Anthropic. |
| Anthropic Partner Academy courses | Fail | Pass | **Excluded** | Gated behind partner/user login. The test is registration, not price. |
| Course landing pages / marketing syllabi | Pass | Pass | **Readable only** | Evidence of curriculum scope only; never cite for technical facts. |
| Third-party dumps, GitHub mirrors, unofficial guides | Pass | Fail | **Excluded** | Unverified third-party copies fail authority test. |

## Official sample question inventory

Section 9 of the exam guide provides 12 official sample questions, establishing the cognitive-level anchor for the bank:

1. **Question 1** (Domain 1): Programmatic prerequisite vs system prompt / few-shot / routing classifier for mandatory tool sequencing before financial operation (`get_customer` before `process_refund`). Key: programmatic prerequisite.
2. **Question 2** (Domain 2): Distinguishing `get_customer` vs `lookup_order` when both have minimal descriptions. Key: expand tool description with input formats, examples, boundaries.
3. **Question 3** (Domain 5): Improving escalation calibration when agent escalates simple cases and mishandles exceptions. Key: explicit escalation criteria in system prompt with few-shot examples.
4. **Question 4** (Domain 3): Location for project-scoped custom slash command. Key: `.claude/commands/` in project repository.
5. **Question 5** (Domain 3): Monolith to microservices restructuring. Key: plan mode.
6. **Question 6** (Domain 3): Applying conventions across test files located throughout repo. Key: `.claude/rules/` with YAML frontmatter glob patterns.
7. **Question 7** (Domain 1): Research system missing creative industry subtopics because coordinator decomposed topic too narrowly. Key: coordinator task decomposition too narrow.
8. **Question 8** (Domain 5): Error propagation from web search timeout to coordinator. Key: return structured error context (failure type, attempted query, partial results, alternatives).
9. **Question 9** (Domain 1): Reducing round-trip latency when synthesis subagent needs simple fact-checking. Key: give synthesis agent a scoped `verify_fact` tool, preserve coordinator delegation for complex cases.
10. **Question 10** (Domain 3): Running Claude Code non-interactively in automated CI pipeline. Key: `-p` flag.
11. **Question 11** (Domain 4): Evaluating proposal to switch real-time calls to Message Batches API. Key: batch processing for technical debt reports only; keep real-time calls for pre-merge checks.
12. **Question 12** (Domain 4): Multi-file PR review producing inconsistent results. Key: split into focused passes (per-file local analysis, then cross-file integration pass).

All 12 items are scenario-grounded architectural judgements focusing on failure modes, isolation boundaries, deterministic vs probabilistic mechanisms, and tradeoff analysis.

## Calibration principles and firewall

The bank relies strictly on the 12 official sample questions in the exam guide as the primary cognitive-level anchor.

Standing calibration firewall from `certs/ccdv-f/review-progress.md`:

> **Calibration only.** No question, option, or rationale here derives from that set, or from any other third-party bank. It informed how deep and how scenario-shaped a question should be, never what a question says.

Cognitive level and depth anchors follow Anchor 2 strictly: items discriminate conceptually on failure modes, error recovery boundaries, lifecycle hooks, state persistence, and architectural tradeoffs. Named flags (e.g. `-p`, `--output-format json`, `allowed-tools`, `stop_reason`) appear as supporting detail inside options rather than trivia test points.

## Review and authoring history

### Seed questions (2026-09-10)

One `core` question seeded per domain to verify sourceability and schema validity:
- `ccar-f-agentic-architecture-and-orchestration-001`: Subagent context isolation and explicit context passing (`code.claude.com/docs/en/sub-agents.md`).
- `ccar-f-tool-design-and-mcp-integration-001`: Project-level `.mcp.json` configuration and environment variable expansion (`code.claude.com/docs/en/mcp.md`).
- `ccar-f-claude-code-configuration-and-workflows-001`: Path-specific rules in `.claude/rules/` with YAML frontmatter `paths` glob patterns (`code.claude.com/docs/en/memory.md`).
- `ccar-f-prompt-engineering-and-structured-output-001`: Message Batches API 50% discount and SLA considerations for synchronous vs asynchronous workloads (`platform.claude.com/docs/en/build-with-claude/batch-processing.md`).
- `ccar-f-context-management-and-reliability-001`: Trimming tool outputs to prevent context rot over long conversations (`platform.claude.com/docs/en/build-with-claude/context-windows.md`).

### Initial 100-question batch and adversarial evaluation (2026-09-10)

Authored 95 new single-select questions across all five domains to reach the 100-question target, strictly proportional to blueprint weights. Every item cited open vendor documentation (`platform.claude.com`, `code.claude.com`, `modelcontextprotocol.io`).

An adversarial cold-review pass evaluated all 100 questions independently against the cited documentation before checking stored keys and explanations:
- **85 questions confirmed immediately** (`status: "reviewed"`).
- **15 questions flagged an authoring defect**: an automated balancing pass had clobbered the intended correct answer with a padded distractor clone, leaving the stored `correct` pointer targeting a distractor.
- **Redraft and confirmation**: All 15 affected items (Tool Design: 1, Configuration & Workflows: 3, Prompt Engineering: 5, Context Management: 6) were redrafted to restore the verified vendor-backed answer with plausible engineering near-misses, re-evaluated against the sources, confirmed, and promoted to `reviewed`.

### Multi-select expansion (2026-09-10)

Authored 10 new multi-select (`type: "multi"`, select-2) questions across all five domains (2 per domain: `agentic-...-028/029`, `tool-...-019/020`, `claude-...-021/022`, `prompt-...-021/022`, `context-...-016/017`), expanding the bank to 110 items.

These items target architectural topics where multiple technical facts naturally co-occur without artificial padding: MCP primitive operational models, PreToolUse hook concurrency and precedence, memory file concatenation hierarchy, headless bare mode isolation, Structured Outputs ordering and refusal semantics, Message Batches terminal states, prompt caching prefix lookbacks, and native citations token accounting. All 10 were cold-derived and confirmed `reviewed`.

### Difficulty calibration and distractor hardening (2026-09-11)

Measured against the 12 official scenario samples, the initial bank was somewhat soft because many single-select distractors were absurd throwaways or giveaway anti-patterns eliminable on sight without deep domain knowledge.

Systematically applied `harden-domain-questions` across all five domains to align the bank with the "1 obviously wrong, 1 confidently wrong, 2 hard-to-separate" model:
- **Absurd and facepalm distractors eliminated**: Replaced giveaway options (e.g. translating prompts to Latin, CA certificate signing of markdown files, rebooting workstations in single-user mode, process-crashing unhandled exceptions, raw assembly language, and instructing models to hallucinate) with realistic technical near-misses (e.g. speculative subagents, negative prompt constraint traps, protocol-level JSON-RPC error code misconceptions, schema union complexity, and caching boundary traps).
- **Key-length tell eliminated**: Padded extreme short-key outliers on `prompt-...-013` and `tool-...-014` with full operational syntax matching distractors.
- **Stems tightened**: Converted abstract definition-style prompts into concrete production scenarios forcing architectural tradeoff decisions.
- **Invariants preserved**: No `correct` key, `sourceUrl`, or `sourceNote` was changed; distractors were padded rather than keys trimmed; and all four bias guards passed cleanly throughout.

All five domains now sit firmly at or slightly above the sample anchor, with all 110 questions confirmed at `status: "reviewed"`.

## Figure-bearing claims audit and baseline — 2026-09-13

Following the provenance rules codified in `CONTRIBUTING.md`, this pass evaluated all
10 figure-bearing questions in `ccar-f` against their cited documentation sources to
establish the bank's true defect rate.

### Summary of adjudications (10 items)

| Question | Claim under review | Cited page | Claim class | Verdict | Disposition |
| --- | --- | --- | --- | --- | --- |
| `agentic-...-015` | "2%" | `programmatic-tool-calling` | Class 2 (Scenario parameter) | **Confirmed**: Urgency violation rate from stem echoed in explanation to contrast probabilistic prompting with deterministic code. | **none** (scenario parameter; page not re-read in this pass) |
| `agentic-...-020` | "$500" | `hooks-guide` | Class 2 (Scenario parameter) | **Confirmed**: Policy threshold from stem echoed in options and explanation. | **none** (scenario parameter; page not re-read in this pass) |
| `context-...-014` | "98%", "40%" | `structured-outputs` | Class 2 (Scenario parameters) | **Confirmed**: 98% is aggregate accuracy from stem; 40% is an illustrative localized failure rate in explanation. | **none** (scenario parameter; page not re-read in this pass) |
| `context-...-015` | "24.2%", "22.1%", "23.15%" | `citations` | Class 2 (Scenario parameters) + Class 4 | **Confirmed**: Conflicting research figures from stem; 23.15% is the fabricated mathematical average tested in distractor `opt-a`. | **none** (scenario parameter; page not re-read in this pass) |
| `prompt-...-001` | "50%", "24 hours" | `batch-processing` | Class 1 (Verbatim vendor facts) | **Confirmed**: "All usage is charged at 50% of the standard API prices"; "Batches expire if processing does not complete within 24 hours." Page re-read. | **bump** |
| `prompt-...-009` | "100%" | `structured-outputs` | Class 1/4 (Mechanism property) | **Confirmed**: Constrained decoding at inference layer guarantees valid JSON syntax. | **none** (scenario parameter; page not re-read in this pass) |
| `prompt-...-014` | "$450", "$500" | `troubleshooting-tool-use` | Class 2 (Scenario parameters) | **Confirmed**: Invoice extraction mismatch amounts from stem echoed in explanation. | **none** (scenario parameter; page not re-read in this pass) |
| `prompt-...-018` | "50%", "24 hours" | `batch-processing` | Class 1 (Verbatim vendor facts) | **Confirmed**: turnaround window and discount both verbatim. Page re-read. | **bump** |
| `prompt-...-022` | "50%" | `batch-processing` | Class 1 (Verbatim vendor fact) | **Confirmed**: discount verbatim on cited page. Page re-read. | **bump** |
| `tool-...-012` | "85% of needs" | `sub-agents` | Unsourced claim | **Defect**: Explanation asserted that `verify_fact` "addresses the common case (85% of needs)", but no 85% figure appears in `sub-agents.md`. | **rewrite** — removed `(85% of needs)` from explanation. |

### Bank metrics and true defect rate

- **Total questions in bank**: 110
- **Figure-bearing questions evaluated**: 10
- **Confirmed without change**: 9
- **Defects identified and fixed**: 1 (`ccar-f-tool-design-and-mcp-integration-012`)
- **True defect rate**: 1 / 10 = **10.0%**.

> **Correction (same day).** An earlier version of this section gave every confirmed row
> a **bump** disposition, but no `sourceCheckedAt` was moved. `skills/audit-sources/SKILL.md:55`
> defines **bump** as "page re-read, claim intact, update `sourceCheckedAt`", and `:12`
> forbids bumping without a re-read. The three `batch-processing` rows were genuinely
> re-read and are now bumped. The six Class 2 rows below them are items whose figures come
> from their own stem rather than from the cited page; their pages were not re-read, so
> their disposition is **none** and their `sourceCheckedAt` stands unchanged. The defect
> rate is unaffected: the figures in those six are scenario parameters, which the cited
> page is not expected to carry.

