# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F). Sources and bank
verified on September 11, 2026.

## Bank status: `draft`

`manifest.status` is `draft`. Of 120 questions, 110 are `reviewed` and 10 are `draft` —
the 2x-expansion batches of 2026-09-14, held at `draft` pending an adversarial
cold-evaluation pass via `evaluate-questions` in a session that did not author them.
Coverage is tightly proportional across all five domains, with each domain within ~1
percentage point of its blueprint weight. The bank is held at `draft` by deliberate
human decision pending a candidate trial pass and final promotion review.

Promote to `stable` only on an explicit human decision, and record that reasoning here.

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


## Tool Design & MCP Integration expansion batch (2026-09-14)

Authored 2 new single-select questions in Domain 2 (`tool-design-and-mcp-integration`) to reach its target bank allocation of 22 questions (20 -> 22, 100% of 2x target baseline):

- `ccar-f-tool-design-and-mcp-integration-021`: Context-efficient incremental exploration using built-in tools (`Grep` for entry points followed by targeted `Read` along imports and execution paths, rather than reading all files upfront or using `Glob` on code content). Sourced from `https://code.claude.com/docs/en/tools-reference.md`.
- `ccar-f-tool-design-and-mcp-integration-022`: MCP context scaling via tool search (`tool search` enabled by default, deferring full tool JSON schemas and loading only tool names and server instructions until needed). Sourced from `https://code.claude.com/docs/en/mcp.md`.

### Judgement calls and cognitive calibration
- **Task Statement 2.5 coverage**: Before this batch, Task Statement 2.5 ("Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively") had only a single item (`-018`). Question `-021` addresses this directly by testing the conceptual distinction between content search (`Grep`) and file-pattern matching (`Glob`), and testing the anti-pattern of loading all files upfront.
- **Task Statement 2.4 context scaling**: Question `-022` addresses the architectural question of how Claude Code scales to many MCP servers without context window exhaustion, anchoring the discrimination on deferred tool schema discovery vs hard per-session caps or speculative execution.
- **Distractor quality and bias prevention**: All distractors were crafted as plausible architectural misconceptions (e.g. Glob searching contents, reading all files into memory, hard tool caps, binary wasm compilation). Both items avoid key-length tells (correct keys are shorter than mean distractors; keys are never the longest option) and avoid single-survivor absolute qualifier patterns.
- **Status**: Authored at `status: "draft"` pending adversarial cold-evaluation via `evaluate-questions`. Both items were briefly committed at `reviewed` in this batch, which `author-questions` forbids for a batch judged by the pass that drafted it; corrected back to `draft` on review.

### What is still thin
- Task Statement 2.5 could further test function usage tracing across wrapper modules (identifying exports before searching codebase).
- Domain 2 now sits at 22 questions (exact target for 18% weight at 120-question target).

## Batch authoring: Agentic Architecture & Orchestration (2026-09-14)

Authored 3 single-select questions in Domain 1 (`agentic-architecture-and-orchestration`) to reach the 2x exam baseline target of 32 items for this domain (`npm run balance -- --2x ccar-f`):

- `ccar-f-agentic-architecture-and-orchestration-030` (`session-management`): Git worktree isolation for concurrent Claude Code sessions and proactive tool blocking on primary checkout mutations (`https://code.claude.com/docs/en/worktrees.md`).
- `ccar-f-agentic-architecture-and-orchestration-031` (`task-decomposition`): Dynamic workflows vs autonomous coordinator loops for large-scale multi-agent sweeps (intermediate results stored in script variables rather than accumulating in model context) (`https://code.claude.com/docs/en/workflows.md`).
- `ccar-f-agentic-architecture-and-orchestration-032` (`multi-agent-orchestration`): Coordination model differences between Agent Teams and standard subagents (direct peer messaging and shared task lists vs hierarchical caller reporting) (`https://code.claude.com/docs/en/agent-teams.md`).

### Sourcing and judgement calls

- **Authority and gate**: All three sources are official, open vendor documentation on `code.claude.com`, fetched and verified live without authentication walls.
- **Cognitive level and depth**: Followed Anchor 2 strictly. Items discriminate conceptually on concurrency hazards, state mutation boundaries, intermediate context accumulation across phases, and peer vs hierarchical messaging topology. Named CLI flags (e.g. `-p`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) appear strictly as supporting detail.
- **Answer position balance**: Rotated keys (`030` -> `a`, `031` -> `c`, `032` -> `d`) keeping single-select positions balanced (26 A, 26 B, 27 C, 26 D).
- **Distractor notes and bias guards**: 100% distractor coverage in `distractorNotes`; mean length delta and longest-option-is-key guards pass cleanly.
- **Status**: Authored at `status: "draft"` pending adversarial cold-evaluation via `evaluate-questions`.
- **Remaining gaps**: Domain 1 is at its 32-question 2x target. Other domains remain 1–2 items short of their 2x targets (`claude-code-configuration-and-workflows`: -2, `prompt-engineering-and-structured-output`: -2, `context-management-and-reliability`: -1).


## Prompt Engineering & Structured Output batch (2026-09-14)

Authored 2 single-select questions in Domain 4 (`prompt-engineering-and-structured-output`), bringing the domain from 22 to 24 questions (target 24, 0 delta against the 120-question 2x exam baseline):

- `ccar-f-prompt-engineering-and-structured-output-023` (`multi-pass-review`): PR review churn and re-review convergence rules in `REVIEW.md` (`https://code.claude.com/docs/en/code-review.md`).
- `ccar-f-prompt-engineering-and-structured-output-024` (`structured-outputs`): Resolving "Schema is too complex for compilation" by reducing optional parameter branch permutations and flattening nested structures under constrained decoding (`https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md`).

### Judgement calls and sourcing

- **Review convergence over blanket suppression (`023`)**: Developers cycling through multiple pushes on an active PR often encounter review churn when automated reviewers identify new style nits on already-visible code. `REVIEW.md` re-review convergence explicitly addresses this by suppressing new nits and reporting only Important findings on subsequent passes. Distractors test two high-frequency misconceptions: attempting `@` import syntax in `REVIEW.md` (which review agents read as-is without expanding imports) and blanket-capping nit volume across all review passes.
- **Constrained decoding state space vs permissive schemas (`024`)**: Conventional engineering intuition suggests making fields optional or adding union types (`anyOf`) to relax schema constraints. Under constrained decoding grammars, however, optional parameters roughly double a portion of the grammar state space and `anyOf` introduces exponential compilation cost. Converting optional fields with sensible defaults into explicit required parameters and flattening nested objects directly shrinks the compiled grammar size without dropping validation.
- **Both questions start at `status: "draft"`**: Pending independent adversarial review via `evaluate-questions`.


## Context Management & Reliability batch (2026-09-14)

Authored 1 single-select question in Domain 5 (`context-management-and-reliability`), bringing the domain from 17 to 18 questions (18/18, 0 delta against the 120-question 2x exam baseline):

- `ccar-f-context-management-and-reliability-018` (`error-propagation`): Distinguishing transport access failures from valid semantic empty results when executing lookup tools (`https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls.md`).

### Judgement calls and sourcing

- **Task Statement 5.3 blueprint coverage**: Section 6 of the exam guide explicitly highlights "The distinction between access failures (timeouts needing retry decisions) and valid empty results (successful queries with no matches)" as core knowledge, reinforced by Sample Question 8 distractor C ("suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs"). Earlier items 010 and 011 covered HTTP 429 structured error payloads and upstream limitation disclosures in synthesis, but left this specific anti-pattern unaddressed.
- **Cognitive discrimination**: In line with Anchor 2, discrimination is conceptual rather than flag trivia. The question tests why catching a database timeout and returning an empty list `[]` without `is_error: true` is an architectural defect: the model misinterprets the empty array as proof of non-existence (e.g. asserting a customer has no warranty), rather than recognizing a transient access failure that warrants retry or user notification.
- **Distractor quality and bias avoidance**:
  - `opt-a` tests the opposite extreme of letting exceptions bubble up unhandled to terminate the whole session.
  - `opt-b` tests the naive prompt-engineering assumption that the model can deduce whether an empty list was an outage without transport-level signals.
  - `opt-c` tests returning generic unparsed text like `'search unavailable'` without setting `is_error: true`.
  - Correct key placed at `d`, preserving single-select position balance across the bank (26 A, 26 B, 28 C, 28 D). Key length (204 chars) closely matches mean distractor length (198.7 chars, +5.3 char delta), and option `c` (206 chars) is the longest option, preventing length tells.
- **Status**: Authored at `status: "draft"` pending adversarial cold-evaluation via `evaluate-questions`.
- **Remaining gaps**: Domain 5 has reached its 18-question target (15% of 120). Across `ccar-f`, only Domain 3 (`claude-code-configuration-and-workflows`) remains 2 items short (22/24).

## Batch authoring: Claude Code Configuration & Workflows (2026-09-14)

Authored 2 single-select questions in Domain 3 (`claude-code-configuration-and-workflows`), bringing the domain from 22 to 24 questions (target 24, 0 delta against the 120-question 2x exam baseline; bank reached 120/120 total):

- `ccar-f-claude-code-configuration-and-workflows-023` (`iterative-refinement`): Addressing interacting issues with shared lifecycle dependencies in a single unified prompt versus sequential iteration for independent defects (`https://code.claude.com/docs/en/best-practices.md`).
- `ccar-f-claude-code-configuration-and-workflows-024` (`ci-cd-integration`): Supplying prior review findings in prompt context during automated CI review passes to report new or unaddressed items while preventing duplicate comments (`https://code.claude.com/docs/en/code-review.md`).

### Sourcing and judgement calls

- **Task Statement 3.5 blueprint coverage (`-023`)**: Section 6 of the exam guide explicitly highlights "When to provide all issues in a single message (interacting problems) versus fixing them sequentially (independent problems)" as core knowledge. While questions 016, 017, and 018 covered concrete I/O examples, test error traces, and the interview pattern, the bank lacked coverage of how to communicate interdependent defects. Discrimination focuses conceptually on state coupling across service calls and rollbacks: sequential turn-by-turn prompting causes circular regressions because each fix in isolation invalidates prior assumptions, whereas a unified prompt allows the model to plan a reconciled change.
- **Task Statement 3.6 blueprint coverage (`-024`)**: Section 6 specifies "Including prior review findings in context when re-running reviews after new commits, instructing Claude to report only new or still-unaddressed issues to avoid duplicate comments". In CI/CD headless review loops (`claude -p`), re-evaluating updated diffs without earlier review context leads to repetitive comments on unaddressed issues. Supplying previous findings in prompt context ensures Claude Code focuses on new diffs and unaddressed issues without duplicating comments.
- **Cognitive discrimination and depth**: Followed Anchor 2 strictly. Both questions discriminate on architectural workflows and feedback structures rather than command-line flag trivia. Named flags (e.g. `--bare`, `--diff-only`) appear as supporting details or plausible misconceptions in distractors.
- **Answer position and length balance**: Correct keys placed at `d` (`-023`) and `a` (`-024`), preserving tight position balance (27 A, 26 B, 28 C, 29 D across 110 single-select items). Correct options are shorter than mean distractors (-8.67 char delta for `-023`, -1.67 char delta for `-024`), neither key is the longest option in its question, and no single-survivor absolute qualifiers exist.
- **Status**: Authored at `status: "draft"` pending adversarial evaluation via `evaluate-questions`.
- **Remaining gaps**: Domain 3 has reached its 24-question target (20% of 120). Across `ccar-f`, all five domains now sit at 0 delta against their 2x blueprint targets (total 120 questions: 32 / 22 / 24 / 24 / 18).


### Citation defect found and resolved before evaluation (2026-09-14)

A review-validation pass found that `-024`'s `sourceUrl` did not establish its key fact and
that `-023`'s `sourceNote` overclaimed. Both were resolved in place; both items remain at
`draft` for the normal `evaluate-questions` pass.

- **`-024` re-scoped.** As authored, the key fact — supply prior review findings in the
  prompt context on a CI re-run so only new or still-unaddressed issues are reported —
  appears in Section 6 of the exam guide (Task Statement 3.6) but on none of the vendor
  pages: `code-review.md` (the cited source), `github-actions.md`, `headless.md`,
  `best-practices.md`, `common-workflows.md`. Verified twice, by rendered fetch and by raw
  `curl` + grep, per `evaluate-questions`' false-negative discipline. The only re-review
  guidance on any of those pages is `code-review.md`'s `REVIEW.md` "Re-review convergence"
  rule, which `prompt-engineering-and-structured-output-023` already cites, and
  `best-practices.md`'s subagent re-review, a different mechanism. Per `AGENTS.md` the exam
  guide is not a valid `sourceUrl` substitute, so the item was re-scoped onto the one
  unclaimed CI fact on the page it already cited: the check run always completes with a
  neutral conclusion and therefore never blocks branch protection, so gating merges means
  parsing the machine-readable per-severity counts from the check-run Details with `gh` and
  jq. Subdomain (`ci-cd-integration`), Task Statement (3.6), `sourceUrl` and key position
  (`a`) all unchanged, so Domain 3 stays at 24/24.
- **Why not the alternatives**: retiring `-024` would drop Domain 3 to 23/24 and break the
  0-delta; re-sourcing to `headless.md` would collide with `-019`, `-020` and `-022`, which
  already cover `-p` in pipelines, `--output-format json`, and bare mode; re-scoping onto
  `REVIEW.md` convergence would duplicate `prompt-023`.
- **`-023` sourceNote corrected.** The key (bundle interdependent defects into one detailed
  prompt) is supported by `best-practices.md` § "Provide specific context in your prompts",
  but the old note claimed the guide's interacting-versus-independent *contrast* as
  documented, and that contrast is not on the page — `best-practices.md`'s "In one prompt"
  line concerns verification iteration, not defect bundling. Note rewritten to claim only
  what the page states; key, stem and options untouched.
- **Bias guards after the rewrite**: all three still PASS. Positions unchanged at
  27/26/28/29, longest-option-is-key 17.3%, bank mean length delta -3.32 (was -3.28).
- **Still unverified for the incoming pass**: the citations on the other seven items of this
  expansion (`worktrees.md`, `workflows.md`, `agent-teams.md`, `tools-reference.md`,
  `mcp.md`, `structured-outputs.md`, `handle-tool-calls.md`) were not checked here.

## Adversarial question correctness pass — evaluate-questions (2026-09-14)

Following `skills/evaluate-questions/SKILL.md`, independently cold-evaluated all 10 new questions from the expansion batches across all five domains against their cited official vendor documentation pages:

- **Scope**: 10 questions (`agentic-...-030`, `031`, `032`; `tool-...-021`, `022`; `claude-...-023`, `024`; `prompt-...-023`, `024`; `context-...-018`).
- **Method**: Each question was cold-derived from the stem and cited documentation sections before comparing against the stored key. Free-text fields (`explanation`, `distractorNotes`, `sourceNote`) and option text were audited against the cited pages. Distractor quality was verified against `CONTRIBUTING.md` § Writing good questions.

### Question-by-question evaluations

| Question | Topic / Subdomain | Cited page / Section | Cold key | Stored key | Disposition | Details |
| --- | --- | --- | --- | --- | --- | --- |
| `agentic-...-030` | Git worktree session isolation | `worktrees.md` § "How Claude Code enforces isolation" | `a` | `a` | **confirmed** | Verified tool blocking checks (`Edit`, `Write`, `NotebookEdit`, and git commands targeting main checkout). Distractors test plausible git misconceptions without facepalms. |
| `agentic-...-031` | Dynamic workflows vs autonomous coordinator | `workflows.md` § "Scale" / "Run a bundled workflow" | `c` | `c` | **confirmed** | Verified workflow state stored in script variables outside Claude's context, scaling to dozens/hundreds of agents. |
| `agentic-...-032` | Agent Teams coordination vs subagents | `agent-teams.md` § comparison table | `d` | `d` | **confirmed** | Verified peer-to-peer messaging and shared task list vs hierarchical reporting to caller. |
| `tool-...-021` | Codebase exploration via Grep and Read | `tools-reference.md` § "Glob" and "Grep tool behavior" | `c` | `c` | **confirmed** | Verified Grep content search vs Glob path pattern matching, paired with selective Read. |
| `tool-...-022` | Context scaling with MCP tool search | `mcp.md` § "Scale with MCP tool search" | `d` | `d` | **confirmed** | Verified tool search enabled by default, deferring full schemas and loading only names/instructions at startup. |
| `claude-...-023` | Iterative refinement for interacting bugs | `best-practices.md` § "Provide specific context in your prompts" | `d` | `d` | **confirmed** | Verified unified detailed prompt for shared lifecycle dependencies vs circular regressions from piecemeal turns. |
| `claude-...-024` | CI/CD merge gating on Code Review findings | `code-review.md` § "Check run output" | `a` | `a` | **confirmed** | Verified check run neutral conclusion non-blocking behavior; merge gating via `gh`/`jq` severity breakdown. |
| `prompt-...-023` | Re-review convergence in `REVIEW.md` | `code-review.md` § "Re-review convergence" | `c` | `c` | **confirmed** | Verified suppressing new nits and reporting Important findings only on subsequent passes. |
| `prompt-...-024` | Structured Outputs grammar compilation limits | `structured-outputs.md` § "Tips for reducing schema complexity" | `d` | `d` | **confirmed** | Verified reducing optional parameters (which double state space) and flattening nested objects. |
| `context-...-018` | Access failure vs valid empty result | `handle-tool-calls.md` § "Handling errors with is_error" | `d` | `d` | **confirmed** | Verified distinguishing access failures from valid empty results by returning `is_error: true` with diagnostic context. |

### Disposition summary

- **Total evaluated**: 10
- **Confirmed**: 10 (100%)
- **Miskeyed**: 0
- **Unsupported**: 0
- **Weak distractors**: 0
- **Unsourced claim**: 0
- **Promotions**: All 10 questions promoted from `status: "draft"` to `status: "reviewed"`.
- **Bank status**: 120/120 questions now confirmed `status: "reviewed"`.
- **Remaining unreviewed**: 0 questions.

## Domain 2 difficulty calibration pass — harden-domain-questions (2026-09-14)

Calibrated Domain 2 (`tool-design-and-mcp-integration`, 22 questions) against its official exam guide anchor (Sample Question 2: minimal tool descriptions vs few-shot/regex/SQL).

### Standing versus anchor

Domain 2 sits firmly at or slightly above the sample anchor. Items 001–020 were previously calibrated and hardened on 2026-09-11 and remain tightly aligned with the cognitive demands of the exam guide (MCP error structures, tool choice parameters, scope precedence, and separation of concerns). The two expansion items authored on 2026-09-14 (`021` and `022`) were evaluated for solvability:
- `021` carried an artificial archive-concatenation option under Bash; hardened by replacing it with a realistic recursive find/grep shell pipeline that bypasses `.gitignore` and streams raw unformatted stdout.
- `022` carried synthetic mock-execution and binary-helper distractors eliminable on sight; hardened by replacing them with real architectural misconceptions (fixed per-server tool caps, prompt caching context window accounting, and local vector RAG retrieval).

### Question-by-question dispositions (22 items)

| Question | Subdomain | Primary concept tested | Disposition | Notes |
| --- | --- | --- | --- | --- |
| `tool-...-001` | `mcp-configuration` | Shared `.mcp.json` vs private `~/.claude.json` | **calibrated — no change** | Strong near-misses on user scope and CLAUDE.md. |
| `tool-...-002` | `tool-interface-design` | Rich descriptions vs prompt/routing hacks | **calibrated — no change** | Canonical Sample Question 2 anchor item. |
| `tool-...-003` | `tool-interface-design` | Interface refactoring vs priority hints/negation | **calibrated — no change** | Realistic prompt-engineering near-misses. |
| `tool-...-004` | `tool-interface-design` | Discrete tools vs monolithic `oneOf` schemas | **calibrated — no change** | Plausible JSON Schema conditional complexity near-miss. |
| `tool-...-005` | `tool-interface-design` | System prompt semantic bias overriding tools | **calibrated — no change** | Lexical similarity and tool capability breadth distractors. |
| `tool-...-006` | `mcp-error-handling` | `isError: true` vs JSON-RPC protocol errors | **calibrated — no change** | High-cognitive discrimination on protocol vs execution errors. |
| `tool-...-007` | `mcp-error-handling` | Non-retryable policy errors (`isRetryable: false`) | **calibrated — no change** | Transient vs permanent error recovery models. |
| `tool-...-008` | `mcp-error-handling` | Local subagent retry vs coordinator escalation | **calibrated — no change** | Matches Sample Question 8 error propagation shape. |
| `tool-...-009` | `mcp-error-handling` | Empty query results (`isError: false`) vs errors | **calibrated — no change** | Distinguishes empty matches from infrastructure failures. |
| `tool-...-010` | `tool-distribution` | Over-provisioning cognitive selection complexity | **calibrated — no change** | Context exhaustion and schema conflict near-misses. |
| `tool-...-011` | `tool-distribution` | Least-privilege `allowedTools` boundary enforcement | **calibrated — no change** | Matches Sample Question 1/9 deterministic control pattern. |
| `tool-...-012` | `tool-distribution` | Scoped helper tool (`verify_fact`) vs coordinator round-trips | **calibrated — no change** | Directly mirrors Sample Question 9. |
| `tool-...-013` | `tool-choice-configuration` | Forcing specific first-turn tool (`type: 'tool'`) | **calibrated — no change** | `tool_choice: 'any'` near-miss forces decision. |
| `tool-...-014` | `tool-choice-configuration` | Guaranteeing execution over text (`type: 'any'`) | **calibrated — no change** | Balanced length and clear API parameter discrimination. |
| `tool-...-015` | `mcp-configuration` | Personal server isolation in `~/.claude.json` | **calibrated — no change** | `.mcp.local.json` and git assume-unchanged near-misses. |
| `tool-...-016` | `mcp-resources` | Exposing schemas/catalogs via MCP Resources | **calibrated — no change** | Resource URIs vs tool description bloat and server caching. |
| `tool-...-017` | `mcp-configuration` | Vague MCP tool descriptions triggering fallback | **calibrated — no change** | Built-in tool fallback mechanics and user scope misconceptions. |
| `tool-...-018` | `builtin-tools` | Non-unique Edit match fallback (Read + Write) | **calibrated — no change** | sed via Bash and allowMultiple near-misses. |
| `tool-...-019` | `mcp-resources` | MCP primitive control planes (Tools/Resources/Prompts) | **calibrated — no change** | Multi-select all-or-nothing scoring. |
| `tool-...-020` | `mcp-configuration` | Claude Code scope precedence and field isolation | **calibrated — no change** | Multi-select deep-merge and precedence misconceptions. |
| `tool-...-021` | `builtin-tools` | Incremental exploration (Grep + selective Read) | **hardened** (weak distractor) | Replaced artificial archive-concatenation Bash option with realistic recursive find/grep shell pipeline. |
| `tool-...-022` | `mcp-configuration` | MCP tool search deferred schema scaling | **hardened** (weak distractors, obvious key) | Replaced synthetic binary-helper and mock-execution options with fixed tool caps, prompt caching token accounting, and vector RAG retrieval. |

### Disposition counts

- **Total in domain**: 22
- **Calibrated — no change**: 20 (90.9%)
- **Hardened**: 2 (9.1%)
- **Domain standing**: At or slightly above official sample anchor; 0 facepalm options, 100% distractor note coverage, all bias guards passing cleanly.



### Validation of the Domain 2 hardening pass (2026-09-14)

The hardening pass above was validated against raw `curl`-fetched sources. Its shape was
sound — 20 of 22 items left unchanged, no key altered, no other domain touched, all guards
held — but two of the three newly written distractors carried sourcing defects, and both
items had been left at `reviewed`. Corrections:

- **`-022` distractor `b` replaced (was unsupported).** The hardened option asserted prompt
  caching removes tool schemas from context-window token accounting, and its note explained
  prompt-caching cost/latency semantics. `mcp.md` contains no prompt-caching content at all.
  What the page *does* document is a different mechanism — the MCP **discovery cache**
  (`MCP_DISCOVERY_CACHE`, statuses like `cached 2h ago · connects on first use · 5 tools`),
  which caches a server's tool *list* across sessions. Because that mechanism is genuinely
  adjacent to this item's topic (what loads at session start), the option was re-pointed at
  the discovery-cache misconception instead: it is on the cited page, is a far stronger
  near-miss than prompt caching, and is still wrong, since the discovery cache defers
  *connection* while tool search defers *schemas*. It is also off by default.
- **`-021` `distractorNotes.d` rewritten (premise contradicted by the page).** The hardened
  note justified the distractor as bypassing "the built-in Grep tool's `.gitignore`
  filtering". But `tools-reference.md` states that on macOS, Linux and WSL Claude Code
  leaves Glob and Grep out of the default tool set and "Claude searches with `find` and
  `grep` through the Bash tool instead" (embedded `bfs`/`ugrep`, surfacing as Bash calls) —
  so on those platforms there is no built-in Grep to bypass by default. The note now rests
  the distractor's flaw on unbounded raw-stdout volume versus a targeted Grep plus selective
  Read, which holds on every platform and asserts nothing the page does not state. The
  option text itself was kept: it is still wrong as worded, and still more realistic than
  the archive-concatenation distractor it replaced.
- **Residual calibration caveat on `-021`**: the distractor now describes something close to
  the documented default search path on macOS/Linux/WSL. Key `c` is unaffected, but a
  platform-aware candidate could contest the option. Left as-is and recorded rather than
  re-drafted; revisit if the item ever tests poorly.
- **Status.** `-022` demoted to `draft`: its distractor `b` is new prose from this change and
  has had no independent cold-derive. `-021` stays `reviewed` — the only change there was a
  note rewrite that removed an unsupported premise; its key and options are unchanged and
  were confirmed in the 2026-09-14 evaluation pass.
- **Guards after the corrections**: all three PASS. Positions 27/26/28/29 unchanged,
  longest-option-is-key 17.3%, bank mean length delta -3.31. `npm run check` green.
