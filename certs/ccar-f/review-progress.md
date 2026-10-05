# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F). Sources and bank
verified on October 5, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-14 following complete blueprint coverage and explicit human confirmation.
With 120 questions against a 60-question live exam, the bank provides exactly 2× exam coverage
proportionally distributed across all five domains to match blueprint weights with zero delta (32 / 22 / 24 / 24 / 18).
All 120 questions are `reviewed`. All quality, balance, and bias guards pass cleanly.

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

Audited against the 120-question bank (post-renovation and 2026-10-05 drift pass):

- **Distribution**: Proportional across all 5 domains (32 / 22 / 24 / 24 / 18, 0 delta against 2× target).
- **Item formats**: 110 single-select, 10 multi-select (all select-2; 2 per domain).
- **Difficulty breakdown**: 63 medium (56 single, 7 multi), 57 hard (54 single, 3 multi).
- **Sourcing**: 24 distinct authoritative pages across 3 documentation hosts (`platform.claude.com`, `code.claude.com`, `modelcontextprotocol.io`) and the official exam guide PDF. 34 items bank-wide cite the guide.
- **Single-select position distribution**: 24 A / 29 B / 28 C / 29 D (max 26.4%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is +3.36 characters (median +1.33 chars), within the ±10 character ceiling.
- **Longest option as key share**: 41 of 110 single-select items (37.3%), comfortably below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 120 questions carry complete explanations.
- **Bias guards**: All three pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

### Known coverage limits

- **Task-statement granularity**: The guide's 30 task statements carry no published percentage weights, so coverage is verified at domain level only.

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

_Originality note_: Bank analogues matching sample questions (`tool-...-002` for Q2, `tool-...-012` for Q9) use fresh scenarios to avoid verbatim copying while testing the identical cognitive level and mechanism per CONTRIBUTING guidelines.

## Calibration principles, deliberate headroom, and trade-off architecture

The bank calibrates against the live exam reality and the official sample questions under strict quality boundaries:

- **Empirical difficulty calibration**: Real-exam candidate feedback (~740/1000 and 764/1000 passing scores) indicated that the live CCAR-F exam is significantly harder than the sample items, with scenario options much closer to each other. For CCAR-F, this empirical signal outranks the sample questions as the difficulty anchor.
- **Standing calibration firewall**: Calibration only. No question, option, or rationale derives from live exam forms or third-party banks. It informs depth and scenario shape, never what a question says.
- **Architectural trade-off structure**: Stems establish a scenario, goal, and constraint ("X while keeping Y"). All four options are real approaches, and distractors fail the stated constraint for documented reasons (over-engineered, solves a different problem, probabilistic where deterministic is required, or wrong architectural layer) rather than being transparent strawmen or invented syntax.
- **Deliberate headroom**: 57 hard items (47.5%) provide intentional headroom above easy samples so learners find the live exam comfortable. Distractor options require recalling specific documented rules or evaluating subtle trade-offs rather than transparent elimination.

## Architectural and sourcing adjudications

- **Guide-wins rule over documentation**: Where the exam guide and current vendor documentation disagree about a mechanism the blueprint lists as exam content, the exam guide wins because exams are graded against the blueprint. Divergences are recorded in item explanations and distractor notes so learners understand both:
  - _Memory troubleshooting_ (`claude-...-005`): Guide TS 3.1 tests `/memory` to verify loaded memory files; current `memory.md` recommends `/context` (which is distractor `b`). Key remains `/memory`.
  - _Skill tool restrictions_ (`claude-...-008`): Guide TS 3.2 tests `allowed-tools` to restrict access; current `skills.md` documents `disallowed-tools` for removal (distractor `d`). Key remains `allowed-tools`.
  - _Skill argument prompting_ (`claude-...-009`): Guide TS 3.2 describes `argument-hint` prompting for missing parameters; current `skills.md` defines it as autocomplete hint. Key remains `argument-hint`.
  - _Splitting vs consolidating tools_ (`tool-...-003`, `-004`): Guide TS 2.1 specifies splitting monolithic tools into purpose-specific tools; `define-tools.md` recommends consolidating operations into single tools with action parameters. Guide wins.
  - _Forced tool selection_ (`tool-...-013`, `-014`, `prompt-...-013`): Guide tests forced tool execution; `define-tools.md` notes `tool_choice: "any"` / `"tool"` returns 400 on newer models under extended thinking. Guide wins.
  - _Grep-then-Read pattern_ (`tool-...-021`): Guide tests Grep then Read; `tools-reference.md` omits Grep/Glob from default tools on macOS/Linux/WSL.
  - _Task vs Agent tool rename_ (`agentic-...-011`, `-012`): Guide TS 1.3 tests `Task` tool; Claude Code v2.1.63 renamed it to `Agent`, preserving `Task(...)` as an alias. Guide terminology preserved with divergence noted.
  - _MCP resources_ (`tool-...-016`): Guide TS 2.4 specifies resources reduce exploratory tool calls.
- **Distractor design principles**: Distractors must use authentic vendor mechanisms misapplied to the wrong scope, layer, or constraint, rather than inventing nonexistent flags, config files, or syntax (e.g. replacing invented `.claude/config.json` with local scope in `~/.claude.json`, or replacing invented `@include` with `@path`).
- **Telemetry vs context redaction** (`agentic-...-021` vs `-022`): When model context is the sole concern, a PostToolUse hook updating output suffices (`-022`). When exported telemetry must also be redacted, PostToolUse is insufficient because telemetry captures raw output before the hook; PreToolUse or gateway redaction is required (`-021`).
- **CI check-run merge gating** (`claude-...-024`): Documented GitHub check-run completes with a neutral conclusion and never blocks branch protection; CI pipelines must parse machine-readable per-severity counts via `gh` and `jq` (`code-review.md`).
- **Context bundling** (`claude-...-023`): Bundling interdependent defects into a single prompt reconciles changes across service calls (`best-practices.md`).
- **MCP server configuration and scope isolation** (`tool-...-001`, `-015`): Project `.mcp.json` requires per-developer approval; personal MCP servers isolate in user-scoped `~/.claude.json` without field-merging scopes.
- **Subagent tool restriction** (`tool-...-011`): Subagent frontmatter tool restriction field is `tools`, not `allowedTools`.
- **MCP tool search** (`tool-...-022`): Documents deferred schema loading via MCP tool search (`mcp.md`).
- **MCP specification pinning**: MCP items (`tool-...-006`, `-007`, `-009`, `-016`, `-019`) pinned to `2026-07-28` specification paths per `certs/VENDORS.md`.

## Maintenance audits

### Figure-bearing claims baseline (2026-09-13)

Evaluated all 10 figure-bearing questions against vendor documentation:

- 9 confirmed intact (Class 1 verbatim facts: `prompt-...-001`, `-018`, `-022`; Class 2 scenario parameters: `agentic-...-015`, `-020`, `context-...-014`, `-015`, `prompt-...-009`, `-014`).
- 1 defect rewritten: `tool-...-012` (removed unsourced 85% claim).
- **True defect rate**: 1 / 10 = **10.0%**.

### Architectural judgement renovation & cold evaluation (2026-09-24 – 2026-09-25)

Comprehensive bank-wide calibration and cold evaluation following real-exam candidate feedback:

- **Trade-off renovation**: 46 items across all five domains renovated into scenario-grounded trade-offs under constraints (Domain 1: 22, Domain 2: 11, Domain 3: 7, Domain 4: 4, Domain 5: 2). Difficulty shifted to 63 medium / 57 hard.
- **Cold evaluation**: All 46 renovated items and untouched bank items independently evaluated and confirmed against sources and blueprint task statements.
- **Blueprint-vs-documentation adjudication**: Restored guide-prescribed keys for Domain 3 items (`claude-...-005`, `-008`, `-009`) and re-cited 34 items whose tested facts derived from blueprint task statements rather than docs pages.
- **Bank status**: All 120 items confirmed `status: "reviewed"` (0 defect).

### Recurring source drift audit (2026-10-05)

Comprehensive `audit-sources` pass across all 120 questions following the renovation:

- **Blueprint drift: None (0%)**. Guide v1.0 (July 2026, CCAR-F) re-verified on CDN. All 5 domains (27/18/20/20/15) and 30 task statements intact.
- **Source liveness: 0 failed URLs**. All 24 distinct cited pages (guide + 23 docs pages) returned HTTP 200.
- **Dispositions (120)**: 29 re-cite (to guide task statements), 7 rewrite (factual precision in `tool-...-001`, `-011`, `-015`, `claude-...-012`, `-017`, `prompt-...-005`, `-009`), 0 retire, 84 bump-only.
- **True defect rate**: 0 / 120 = **0.0%**. All 120 questions re-dated to `2026-10-05` and confirmed `status: "reviewed"`. All bias guards pass cleanly.
