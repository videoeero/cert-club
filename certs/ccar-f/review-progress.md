# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F). Sources and bank
verified on September 11, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-14 following complete blueprint coverage and explicit human confirmation.
With 120 questions against a 60-question live exam, the bank provides exactly 2× exam coverage
proportionally distributed across all five domains to match blueprint weights with zero delta (32 / 22 / 24 / 24 / 18).
All 120 questions are `reviewed`.
All quality, balance, and bias guards pass cleanly.

## Recon verdict: `GO`

The certification assessment reached a unanimous **GO** verdict:
- The official exam guide is publicly accessible without credentials or registration.
- Domain weights are explicitly defined integers that sum to exactly 100%.
- The exam includes 12 official scenario-based sample questions with full rationales.
- Public, authoritative vendor documentation covers every objective across all five domains.
- Question format is standard single- and multi-select, requiring no schema extensions.

## Blueprint and weights

The guide publishes exact domain weights in Section 4. Normalized with `npm run scaffold -- --normalize "27,18,20,20,15"`:

| Domain | Slug | Weight | Target (2x of 60) | Bank Questions |
| --- | --- | ---: | ---: | ---: |
| Agentic Architecture & Orchestration | `agentic-architecture-and-orchestration` | 27% | 32 | 32 |
| Tool Design & MCP Integration | `tool-design-and-mcp-integration` | 18% | 22 | 22 |
| Claude Code Configuration & Workflows | `claude-code-configuration-and-workflows` | 20% | 24 | 24 |
| Prompt Engineering & Structured Output | `prompt-engineering-and-structured-output` | 20% | 24 | 24 |
| Context Management & Reliability | `context-management-and-reliability` | 15% | 18 | 18 |
| **Total** | | **100%** | **120** | **120** |

Exam specs from blueprint:
- Total items: 60 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Scenario-based multiple-choice (single-select) and multiple-response (multi-select)

### Skill breakdown

Section 6 of the exam guide outlines 30 task statements across the five domains (1.1–1.7, 2.1–2.5, 3.1–3.6, 4.1–4.6, 5.1–5.6), but does not publish individual percentage weights for task statements. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `az-900` and `aws-clf-c02`.

## Composition and coverage audit

Audited against the 120-question bank on 2026-09-14, after the 2x-expansion batches took
every domain to 0 delta against its 2x target. `npm run validate`, `npm run metrics -- ccar-f --markdown`,
and `npm run check` all clean. `npm run balance -- --strict` does not list ccar-f as no domain declares `skills`.

Composition is tightly proportional across all five domains, with no domain acting as a coverage floor:

| Domain | Core | Share | Weight | Δ |
| --- | ---: | ---: | ---: | ---: |
| Agentic Architecture & Orchestration | 32 | 26.7% | 27% | −0.3 |
| Tool Design & MCP Integration | 22 | 18.3% | 18% | +0.3 |
| Claude Code Configuration & Workflows | 24 | 20.0% | 20% | 0.0 |
| Prompt Engineering & Structured Output | 24 | 20.0% | 20% | 0.0 |
| Context Management & Reliability | 18 | 15.0% | 15% | 0.0 |
| **Total** | **120** | **100%** | **100%** | |

### Format mix and pattern review

- **Item formats**: 110 single-select, 10 multi-select (all select-2; 2 per domain).
- **Difficulty breakdown**: 78 medium (71 single, 7 multi), 42 hard (39 single, 3 multi).
- **Sourcing**: 28 distinct authoritative documentation pages.
- **Single-select position distribution**: 27 A / 26 B / 28 C / 29 D across `a`-`d` (max 26.4%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is -3.28 characters (median -0.83 chars), well within the ±10 character ceiling.
- **Longest option as key share**: 19 of 110 single-select items (17.3%), comfortably below the 45% ceiling and outperforming the 25% random baseline.
- **Distractor notes coverage**: 100% of distractor options across all 120 questions carry complete explanations in `distractorNotes`.
- **All three bias guards pass**: `positionBias`, `lengthBiasMeanDelta`, and `longestOptionIsKey`.

### Known coverage limits

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

- **Total questions in bank**: 110 at audit time (expanded to 120 on 2026-09-14)
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


## Bank expansion to 120 questions (2× baseline) — 2026-09-14

Authored 10 single-select questions across all five domains to eliminate remaining deltas against the 120-question 2× exam baseline (32 / 22 / 24 / 24 / 18):

- **Domain 1 (`agentic-architecture-and-orchestration`, 3 items)**:
  - `ccar-f-agentic-architecture-and-orchestration-030`: Git worktree session isolation and proactive tool blocking on checkout mutations (`worktrees.md`).
  - `ccar-f-agentic-architecture-and-orchestration-031`: Dynamic workflows vs autonomous coordinator loops for large sweeps, storing intermediate results in script variables (`workflows.md`).
  - `ccar-f-agentic-architecture-and-orchestration-032`: Coordination models: direct peer messaging and shared task lists in Agent Teams vs hierarchical subagents (`agent-teams.md`).
- **Domain 2 (`tool-design-and-mcp-integration`, 2 items)**:
  - `ccar-f-tool-design-and-mcp-integration-021`: Context-efficient exploration using `Grep` for entry points followed by targeted `Read`, avoiding full-codebase loads (`tools-reference.md`).
  - `ccar-f-tool-design-and-mcp-integration-022`: Context scaling with MCP tool search, deferring full JSON schemas until needed (`mcp.md`).
- **Domain 3 (`claude-code-configuration-and-workflows`, 2 items)**:
  - `ccar-f-claude-code-configuration-and-workflows-023`: Unified prompt planning for interdependent bugs with shared lifecycle dependencies vs piecemeal turn regressions (`best-practices.md`).
  - `ccar-f-claude-code-configuration-and-workflows-024`: CI check-run merge gating via `gh`/`jq` per-severity breakdown, since neutral check-run conclusions do not block branch protection (`code-review.md`).
- **Domain 4 (`prompt-engineering-and-structured-output`, 2 items)**:
  - `ccar-f-prompt-engineering-and-structured-output-023`: Suppressing review churn via `REVIEW.md` re-review convergence rules (reporting Important findings only on subsequent passes) (`code-review.md`).
  - `ccar-f-prompt-engineering-and-structured-output-024`: Resolving grammar compilation complexity under constrained decoding by flattening nested objects and reducing optional properties (`structured-outputs.md`).
- **Domain 5 (`context-management-and-reliability`, 1 item)**:
  - `ccar-f-context-management-and-reliability-018`: Distinguishing transport access failures from valid semantic empty matches by returning `is_error: true` with diagnostic payload (`handle-tool-calls.md`).

### Architectural and sourcing adjudications

- **`claude-...-024` re-scoping**: Blueprint Task Statement 3.6 notes supplying prior review findings on CI re-runs, but vendor documentation lacks this mechanism. The item was re-scoped onto documented GitHub check-run conclusion semantics: the check run completes with a neutral conclusion and never blocks branch protection, requiring CI pipelines to parse machine-readable per-severity counts via `gh` and `jq`.
- **`claude-...-023` sourceNote precision**: Grounded directly on `best-practices.md` § "Provide specific context in your prompts" (bundling interdependent defects into a single prompt to reconcile changes across service calls).
- **`tool-...-021` distractor hardening**: Replaced an artificial archive-concatenation option with a recursive find/grep shell pipeline. Distractor justification rests on unbounded raw-stdout volume versus targeted Grep + selective Read.
- **`tool-...-022` distractor hardening and draft status**: Distractor `b` was re-pointed to the documented MCP discovery cache (`MCP_DISCOVERY_CACHE`, caching tool lists across sessions) rather than an undocumented prompt caching claim. Held at `status: "draft"` pending independent evaluation.

### Adversarial evaluation and difficulty calibration

- **Adversarial evaluation (`evaluate-questions`)**: All 10 expansion items were independently cold-derived against official vendor documentation. Nine items were confirmed and promoted to `status: "reviewed"`; `-022` remains at `status: "draft"` due to its updated distractor.
- **Difficulty calibration (`harden-domain-questions`)**: Calibrated Domain 2 against Sample Question 2. 20 items were confirmed at or above sample depth without changes; 2 items (`-021`, `-022`) were hardened to replace synthetic distractors with authentic architectural near-misses.
- **Full bank status**: 119 `reviewed`, 1 `draft`. All 120 items are scenario-grounded and sit firmly at or above the official sample anchor. Single-select position distribution (27 A / 26 B / 28 C / 29 D), length delta (-3.31 chars), and longest-option-as-key share (17.3%) all pass repository bias guards cleanly.

## Recurring source drift audit — 2026-09-17

Comprehensive, repo-wide source drift and claims verification pass executed across the complete 120-question bank following the `audit-sources` workflow.

### Scope covered and not covered

- **Scope covered**: All 120 questions across all 5 domains and all 28 distinct authoritative vendor documentation URLs across 3 hosts (`modelcontextprotocol.io`, `code.claude.com`, and `platform.claude.com`). Official blueprint PDF re-verified against live CDN.
- **Scope not covered**: Draft-to-reviewed status promotion for `ccar-f-tool-design-and-mcp-integration-022` was not conducted (held at `status: "draft"` pending independent evaluation under `evaluate-questions`). Question stems and option text were not altered.

### Blueprint drift evaluation

The canonical exam guide PDF was fetched cold from Anthropic's Everpath CDN (`https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf`) and extracted via text parsing:
- **Guide version**: `Version 1.0 · Effective July 2026 · Exam code: CCAR-F`.
- **Exam specifications**: 60 questions, 120 minutes, 720 scaled passing threshold.
- **Domain weights**:
  1. Agentic Architecture & Orchestration: 27%
  2. Tool Design & MCP Integration: 18%
  3. Claude Code Configuration & Workflows: 20%
  4. Prompt Engineering & Structured Output: 20%
  5. Context Management & Reliability: 15%
- **Verdict**: Zero blueprint drift. Manifest metadata, domain slugs, and percentage weights match the official guide exactly.

### Mechanical triage and claim adjudications

Automated triage via `scripts/check-sources.mjs` and `scripts/check-claims.mjs` evaluated all citations and free-text surfaces across the bank:
- **Source liveness**: 0 failed URLs. All 28 distinct pages return HTTP 200.
- **Advisory findings (quote mismatches, 2 items)**:
  - `ccar-f-tool-design-and-mcp-integration-014`: Advisory mismatch on `"none"`. Root cause: question was citing `handle-tool-calls.md`, but `tool_choice` is documented in `define-tools.md` § "Forcing tool use", which explicitly specifies the four possible options (`auto`, `any`, `tool`, `none`). Grounded and re-cited.
  - `ccar-f-tool-design-and-mcp-integration-017`: Advisory mismatch on `"Jira operations"`. Adjudicated as Class 2 illustrative scenario example in explanation, contrasting vague tool descriptions with descriptive schemas per `code.claude.com/docs/en/mcp.md`. Confirmed intact.
- **Figure-bearing claim adjudications (10 items evaluated)**:
  - `ccar-f-agentic-architecture-and-orchestration-015`: "2%" — Class 2 scenario parameter from stem (non-compliance rate). Confirmed.
  - `ccar-f-agentic-architecture-and-orchestration-020`: "$500" — Class 2 scenario parameter from stem (spending limit policy threshold). Confirmed.
  - `ccar-f-claude-code-configuration-and-workflows-022`: "5-second", "10-minute" — Class 1 verbatim vendor facts: `code.claude.com/docs/en/headless.md` § "Background tasks at exit" explicitly documents the five-second grace period for background Bash tasks and the 10-minute idle wait ceiling for background subagents. Confirmed.
  - `ccar-f-context-management-and-reliability-014`: "98%", "40%" — Class 2 scenario parameters from stem (aggregate accuracy and localized failure rate). Confirmed.
  - `ccar-f-prompt-engineering-and-structured-output-001`: "50%", "24 hours" — Class 1 verbatim vendor facts: `platform.claude.com/docs/en/build-with-claude/batch-processing.md` confirms 50% discount and 24-hour turnaround window. Confirmed.
  - `ccar-f-prompt-engineering-and-structured-output-009`: "100%" — Class 1/4 mechanism property: constrained decoding guarantees valid JSON syntax. Confirmed.
  - `ccar-f-prompt-engineering-and-structured-output-014`: "$450", "$500" — Class 2 scenario parameters from stem (invoice amounts). Confirmed.
  - `ccar-f-prompt-engineering-and-structured-output-018`: "24 hours" — Class 1 verbatim vendor fact: Message Batches turnaround. Confirmed.
  - `ccar-f-prompt-engineering-and-structured-output-022`: "50%" — Class 1 verbatim vendor fact: batch discount. Confirmed.
  - `ccar-f-tool-design-and-mcp-integration-012`: Verified intact following 2026-09-13 fix removing unsourced percentage. Confirmed.

### Sourcing re-citations and updates (8 items)

1. **MCP specification pinning (5 items)**:
   - `ccar-f-tool-design-and-mcp-integration-006`, `-007`, `-009`: Re-cited from superseded tutorial path `https://modelcontextprotocol.io/docs/2025-06-18/develop/build-server.md` to authoritative pinned specification `https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md` § "Error Handling" (which establishes protocol-level errors vs tool execution errors with `isError: true`).
   - `ccar-f-tool-design-and-mcp-integration-016`, `-019`: Re-cited from superseded revision `https://modelcontextprotocol.io/docs/2025-06-18/learn/server-concepts.md` to current pinned revision `https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts.md` per `certs/VENDORS.md` rules.
2. **Messages API `tool_choice` realignment (3 items)**:
   - `ccar-f-prompt-engineering-and-structured-output-013`, `ccar-f-tool-design-and-mcp-integration-013`, `ccar-f-tool-design-and-mcp-integration-014`: Re-cited from `https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls.md` to `https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools.md` § "Forcing tool use" (which documents `tool_choice` parameter semantics: `auto`, `any`, `tool`, `none`).

### Summary of dispositions

- **bump**: 112 questions (all pages re-read cold, claims intact, `sourceCheckedAt` bumped to `2026-09-17`).
- **re-cite**: 8 questions (claims intact, re-cited to current pinned or section-specific documentation, `sourceCheckedAt` bumped to `2026-09-17`).
- **rewrite**: 0 questions.
- **retire**: 0 questions.
- **Defect rate**: 0 / 120 = **0.0%**.

## Adversarial evaluation and confirmation — 2026-09-17

Targeted adversarial correctness pass evaluating `ccar-f-tool-design-and-mcp-integration-022` (the sole remaining `draft` question in the bank) following the `evaluate-questions` workflow, plus independent verification of the 8 items re-cited during the 2026-09-17 source drift audit.

### Scope covered and not covered

- **Scope covered**:
  - `ccar-f-tool-design-and-mcp-integration-022`: Independently cold-derived against `https://code.claude.com/docs/en/mcp.md` § "Scale with MCP tool search" and § "Server status detail".
  - 8 re-cited questions from the drift pass (`tool-...-006`, `-007`, `-009`, `-013`, `-014`, `-016`, `-019`, and `prompt-...-013`): Cold-derived against pinned MCP specification pages and `define-tools.md`.
- **Scope not covered**: Remaining 111 items already adjudicated and confirmed `reviewed` in prior adversarial passes (2026-09-10, 2026-09-11, 2026-09-14) were not re-litigated.

### Item evaluation: `ccar-f-tool-design-and-mcp-integration-022`

- **Cold derivation**: The question asks what architectural mechanism explains why Claude Code sessions start with minimal context token consumption despite connecting six MCP servers with over fifty tools. Official vendor documentation (`code.claude.com/docs/en/mcp.md` § "Scale with MCP tool search") documents that "Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start... Tool search is enabled by default: MCP tools are deferred and discovered on demand." Key `d` uniquely and correctly captures this.
- **Distractor quality**:
  - `a`: Plausible fixed-limit assumption, cleanly rebutted by docs stating Claude Code "doesn't impose a fixed per-server tool cap".
  - `b`: Plausible technical near-miss invoking the documented `MCP_DISCOVERY_CACHE`, which caches tool lists across sessions to defer server connections until first use, but does not defer tool schemas or eliminate them from context; cached tools remain available from turn 1.
  - `c`: Plausible architectural near-miss invoking vector search / embeddings, which Claude Code does not use (it relies on native model `tool_reference` blocks).
- **Free-text and claims check**: No unsourced figures or APIs; explanation and distractorNotes accurately reflect `mcp.md`.
- **Disposition**: **confirmed**. Promoted from `status: "draft"` to `status: "reviewed"`.

### Re-cited items audit (8 items)

All 8 items re-cited in the 2026-09-17 drift pass were cold-evaluated against their new target endpoints:
- `tool-...-006`, `-007`, `-009` (MCP tools spec): Confirmed protocol-level JSON-RPC error separation vs `isError: true` tool execution results and non-retryable policy rejections.
- `tool-...-013`, `-014`, and `prompt-...-013` (`define-tools.md` § "Forcing tool use"): Confirmed `tool_choice: {'type': 'tool', 'name': ...}`, `tool_choice: {'type': 'any'}`, and `tool_choice: {'type': 'auto'}` semantics.
- `tool-...-016`, `-019` (MCP concepts): Confirmed Resource URI exposure vs repetitive exploratory tool invocations, and Resources (application-controlled read-only) vs Tools (model-controlled executable) primitives.
- **Disposition**: **confirmed** (8 items).

### Summary of dispositions

- **confirmed**: 9 questions (promoted 1 from draft to reviewed; re-confirmed 8).
- **miskeyed**: 0 questions.
- **unsupported**: 0 questions.
- **weak-distractors**: 0 questions.
- **unsourced-claim**: 0 questions.
- **Defect rate**: 0 / 9 = **0.0%**.
- **Bank status**: 120 of 120 questions (100%) now confirmed `status: "reviewed"`.
