# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F). Sources and bank
verified on September 17, 2026.

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

| Domain                                 | Slug                                       |   Weight | Target (2x of 60) | Bank Questions |
| -------------------------------------- | ------------------------------------------ | -------: | ----------------: | -------------: |
| Agentic Architecture & Orchestration   | `agentic-architecture-and-orchestration`   |      27% |                32 |             32 |
| Tool Design & MCP Integration          | `tool-design-and-mcp-integration`          |      18% |                22 |             22 |
| Claude Code Configuration & Workflows  | `claude-code-configuration-and-workflows`  |      20% |                24 |             24 |
| Prompt Engineering & Structured Output | `prompt-engineering-and-structured-output` |      20% |                24 |             24 |
| Context Management & Reliability       | `context-management-and-reliability`       |      15% |                18 |             18 |
| **Total**                              |                                            | **100%** |           **120** |        **120** |

Exam specs from blueprint:

- Total items: 60 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Scenario-based multiple-choice (single-select) and multiple-response (multi-select)

### Skill breakdown

Section 6 of the exam guide outlines 30 task statements across the five domains (1.1–1.7, 2.1–2.5, 3.1–3.6, 4.1–4.6, 5.1–5.6), but does not publish individual percentage weights for task statements. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `az-900` and `aws-clf-c02`.

## Composition and coverage audit

Audited against the 120-question bank on 2026-09-14:

- **Distribution**: Proportional across all 5 domains (32 / 22 / 24 / 24 / 18, 0 delta against 2× target).
- **Item formats**: 110 single-select, 10 multi-select (all select-2; 2 per domain).
- **Difficulty breakdown**: 78 medium (71 single, 7 multi), 42 hard (39 single, 3 multi).
- **Sourcing**: 28 distinct authoritative documentation pages across 3 hosts (`platform.claude.com`, `code.claude.com`, `modelcontextprotocol.io`).
- **Single-select position distribution**: 27 A / 26 B / 28 C / 29 D across `a`–`d` (max 26.4%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is -3.28 characters (median -0.83 chars), well within the ±10 character ceiling.
- **Longest option as key share**: 19 of 110 single-select items (17.3%), comfortably below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 120 questions carry complete explanations in `distractorNotes`.
- **All three bias guards pass**: `positionBias`, `lengthBiasMeanDelta`, and `longestOptionIsKey`.

### Known coverage limits

- **Task-statement granularity**: The guide's 30 task statements carry no published percentage weights, so coverage is verified at domain level only, not below it.

## Source classification

Evaluated against the repository's two non-negotiable tests (Gate and Authority):

| Candidate Source                                                                | Gate | Authority | Disposition       | Notes                                                                                                              |
| ------------------------------------------------------------------------------- | ---- | --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Official Exam Guide PDF (`everpath-course-content.s3-accelerate.amazonaws.com`) | Pass | Pass      | **Citable**       | Canonical vendor blueprint hosted on official Skilljar CDN.                                                        |
| Claude Code documentation (`code.claude.com/docs/en/...`)                       | Pass | Pass      | **Citable**       | Authoritative vendor reference for Claude Code, CLI, subagents, and Agent SDK. Accessible as `.md`.                |
| Claude Platform documentation (`platform.claude.com/docs/en/...`)               | Pass | Pass      | **Citable**       | Authoritative vendor reference for Messages API, tool use, context windows, batch processing. Accessible as `.md`. |
| Model Context Protocol Specification (`modelcontextprotocol.io`)                | Pass | Pass      | **Citable**       | Official MCP open standard specification published by Anthropic.                                                   |
| Anthropic Partner Academy courses                                               | Fail | Pass      | **Excluded**      | Gated behind partner/user login. The test is registration, not price.                                              |
| Course landing pages / marketing syllabi                                        | Pass | Pass      | **Readable only** | Evidence of curriculum scope only; never cite for technical facts.                                                 |
| Third-party dumps, GitHub mirrors, unofficial guides                            | Pass | Fail      | **Excluded**      | Unverified third-party copies fail authority test.                                                                 |

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

## Authoring and expansion history

- **2026-09-10 (Seed)**: Seeded 5 core questions (`agentic-...-001`, `tool-...-001`, `claude-...-001`, `prompt-...-001`, `context-...-001`) verifying schema and sourceability.
- **2026-09-10 (100-batch)**: Authored 95 single-select questions to reach 100 items. Cold review confirmed 85 items; 15 items with padded distractor clobbers were redrafted, re-evaluated, and confirmed.
- **2026-09-10 (Multi-select)**: Added 10 select-2 items (2 per domain: `agentic-...-028/029`, `tool-...-019/020`, `claude-...-021/022`, `prompt-...-021/022`, `context-...-016/017`) targeting multi-fact mechanisms.
- **2026-09-11 (Difficulty calibration)**: Systematically applied `harden-domain-questions` across all domains, eliminating absurd throwaways and padding options into realistic technical near-misses.
- **2026-09-14 (120-batch expansion)**: Added 10 single-select items across all domains (`agentic-...-030`–`032`, `tool-...-021`–`022`, `claude-...-023`–`024`, `prompt-...-023`–`024`, `context-...-018`) to achieve the exact 2× exam baseline (32 / 22 / 24 / 24 / 18).

## Architectural and sourcing adjudications

- **`claude-...-024` (CI check-run merge gating)**: Re-scoped from blueprint task statement 3.6 onto documented GitHub check-run conclusion semantics: the check run completes with a neutral conclusion and never blocks branch protection, requiring CI pipelines to parse machine-readable per-severity counts via `gh` and `jq` (`code-review.md`).
- **`claude-...-023` (`best-practices.md`)**: Grounded on § "Provide specific context in your prompts" (bundling interdependent defects into a single prompt to reconcile changes across service calls).
- **`tool-...-021` (Exploration vs context)**: Distractor hardening replaced archive-concatenation with recursive shell search; contrasts raw stdout volume with targeted `Grep` + selective `Read`.
- **`tool-...-022` (MCP tool search)**: Documents deferred schema loading (`mcp.md`); distractor `b` hardened to reference `MCP_DISCOVERY_CACHE` (tool connection caching across sessions). Confirmed and promoted `reviewed` on 2026-09-17.
- **`tool-...-014` (`define-tools.md`)**: Re-cited from `handle-tool-calls.md` to `define-tools.md` § "Forcing tool use" (`tool_choice: "none"`).
- **`tool-...-017` (Jira operations)**: Confirmed as a Class 2 illustrative scenario parameter contrasting vague descriptions with descriptive schemas.
- **`tool-...-012` (Unsourced percentage fix)**: Removed unsourced "(85% of needs)" from explanation; grounded strictly on `sub-agents.md`.
- **MCP specification pinning**: 5 items (`tool-...-006`, `-007`, `-009`, `-016`, `-019`) pinned to `2026-07-28` specification and server concepts paths per `certs/VENDORS.md`.

## Maintenance audits

### Figure-bearing claims baseline (2026-09-13)

Evaluated all 10 figure-bearing questions against cited documentation:

- **Summary**: 9 confirmed intact (Class 1 verbatim facts: `prompt-...-001`, `-018`, `-022` [50% batch discount, 24-hr window]; Class 2 scenario parameters: `agentic-...-015`, `-020`, `context-...-014`, `-015`, `prompt-...-009`, `-014`). 1 defect identified and rewritten (`tool-...-012`, removed unsourced 85% claim).
- **True defect rate**: 1 / 10 = **10.0%**.

### Recurring source drift audit (2026-09-17)

Comprehensive drift pass across all 120 questions and 28 URLs:

- **Blueprint drift**: 0% drift. Exam guide v1.0 (July 2026) verified on CDN. 60 questions, 120 mins, 720 pass threshold, exact 27/18/20/20/15 domain weights.
- **Source liveness**: 0 failed URLs across 28 distinct pages (100% live HTTP 200).
- **Advisories & figures**: Advisory quote matches confirmed (`tool-...-014` re-cited to `define-tools.md`; `tool-...-017` scenario context). 10 figure-bearing claims re-confirmed intact.
- **Re-citations (8 items)**: 5 MCP items (`tool-...-006`, `-007`, `-009`, `-016`, `-019`) pinned to `2026-07-28` specification; 3 tool-use items (`tool-...-013`, `-014`, `prompt-...-013`) realigned to `define-tools.md`.
- **Dispositions**: 112 bump, 8 re-cite, 0 rewrite, 0 retire. True defect rate: 0 / 120 = **0.0%**.

### Adversarial evaluation pass (2026-09-17)

Targeted cold evaluation following drift updates:

- **`tool-...-022`**: Cold-derived against `code.claude.com/docs/en/mcp.md` § "Scale with MCP tool search". Promoted `draft` → `reviewed`.
- **Re-cited items (8 items)**: Independently verified against pinned MCP specifications and Messages API docs. All confirmed.
- **Bank status**: 120 of 120 questions (100%) confirmed `status: "reviewed"`. Defect rate: 0 / 9 = **0.0%**.
