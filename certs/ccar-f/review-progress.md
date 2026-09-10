# Claude Certified Architect – Foundations review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-10 based on the Claude Certified Architect –
Foundations Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-F).

## Bank status: `draft`

`manifest.status` is `draft`. The bank currently holds 5 seed questions (1 per domain)
authored during the initial recon to verify sourceability and schema compliance.

Promote to `stable` only when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here.

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
| Agentic Architecture & Orchestration | `agentic-architecture-and-orchestration` | 27% | 27 | 27 |
| Tool Design & MCP Integration | `tool-design-and-mcp-integration` | 18% | 18 | 18 |
| Claude Code Configuration & Workflows | `claude-code-configuration-and-workflows` | 20% | 20 | 20 |
| Prompt Engineering & Structured Output | `prompt-engineering-and-structured-output` | 20% | 20 | 20 |
| Context Management & Reliability | `context-management-and-reliability` | 15% | 15 | 15 |
| **Total** | | **100%** | **100** | **100** |

Exam specs from blueprint:
- Total items: 60 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Scenario-based multiple-choice (single-select) and multiple-response (multi-select)

### Skill breakdown

Section 6 of the exam guide outlines 30 task statements across the five domains (1.1–1.7, 2.1–2.5, 3.1–3.6, 4.1–4.6, 5.1–5.6), but does not publish individual percentage weights for task statements. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `az-900` and `aws-clf-c02`.

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

## Calibration

The authoring bank has no third-party practice set. Calibration relies strictly on the 12 official sample questions in the exam guide as the primary cognitive-level anchor.

Standing calibration firewall from `certs/ccdv-f/review-progress.md`:

> **Calibration only.** No question, option, or rationale here derives from that set, or from any other third-party bank. It informed how deep and how scenario-shaped a question should be, never what a question says.

## Seed questions

One `core` question seeded per domain to verify sourceability and schema validity:
- `ccar-f-agentic-architecture-and-orchestration-001`: Subagent context isolation and explicit context passing (`https://code.claude.com/docs/en/sub-agents.md`).
- `ccar-f-tool-design-and-mcp-integration-001`: Project-level `.mcp.json` configuration and environment variable expansion (`https://code.claude.com/docs/en/mcp.md`).
- `ccar-f-claude-code-configuration-and-workflows-001`: Path-specific rules in `.claude/rules/` with YAML frontmatter `paths` glob patterns (`https://code.claude.com/docs/en/memory.md`).
- `ccar-f-prompt-engineering-and-structured-output-001`: Message Batches API 50% discount and SLA considerations for synchronous vs asynchronous workloads (`https://platform.claude.com/docs/en/build-with-claude/batch-processing.md`).
- `ccar-f-context-management-and-reliability-001`: Trimming tool outputs to prevent context rot over long conversations (`https://platform.claude.com/docs/en/build-with-claude/context-windows.md`).

## Batch record: 2026-09-10 (Target 100 questions)

Authored 95 new questions across all five domains to reach the 100-question target, proportional to the manifest domain weights:

- `agentic-architecture-and-orchestration`: 26 new items (27 total, 27% share vs 27% blueprint weight)
- `tool-design-and-mcp-integration`: 17 new items (18 total, 18% share vs 18% blueprint weight)
- `claude-code-configuration-and-workflows`: 19 new items (20 total, 20% share vs 20% blueprint weight)
- `prompt-engineering-and-structured-output`: 19 new items (20 total, 20% share vs 20% blueprint weight)
- `context-management-and-reliability`: 14 new items (15 total, 15% share vs 15% blueprint weight)

### Sources cited

Every question cites authoritative, open vendor documentation verified live on 2026-09-10:
- Claude Platform documentation (`https://platform.claude.com/docs/en/...`): Messages API tool use, handling stop reasons, context windows, batch processing, structured outputs, prompt engineering best practices, citations.
- Claude Code documentation (`https://code.claude.com/docs/en/...`): subagents, MCP configuration, memory and rules, custom skills, hooks, code review, headless mode, large codebases.
- Model Context Protocol specifications (`https://modelcontextprotocol.io/docs/2025-06-18/...`): server architecture, resources, error handling (`isError` and retry semantics).

### Judgement calls and bias controls

1. **Cognitive level and depth anchors**: Followed Anchor 2 strictly. Items discriminate conceptually on failure modes, error recovery boundaries, lifecycle hooks, state persistence, and architectural tradeoffs. Named flags (e.g. `-p`, `--output-format json`, `allowed-tools`, `stop_reason`) appear as supporting detail inside options rather than trivia test points.
2. **Key length and distractor padding**: Padded distractors with realistic technical qualifying clauses to eliminate length bias. Final bank metrics:
   - Mean length delta: +0.72 characters (well below the 10.0 character ceiling).
   - Longest option is key share: 34% (well below the 45% ceiling).
3. **Key rotation**: Position distribution across single-select answers is evenly balanced: 25 A (25%), 26 B (26%), 25 C (25%), 24 D (24%), strictly avoiding position bias (ceiling 50%).
4. **Distractor notes**: 100% of distractors have complete `distractorNotes` entries detailing why the alternative is plausible but incorrect against the cited vendor documentation.
5. **Format and thin areas**: All 100 items are currently single-select. Future authoring passes can introduce multi-select items (select-2 / select-3) to further test multi-aspect architectural decisions.

## Correctness evaluation pass: 2026-09-10 (Full bank, 100 questions)

Conducted an adversarial per-question correctness evaluation across all 100 questions in the CCAR-F bank. Each answer key was cold-derived independently against the cited vendor documentation before comparing against the stored `correct` field and `explanation`. Distractor quality was audited against `CONTRIBUTING.md` to eliminate facepalm options and near-duplicate distractors.

### Summary of findings

- **Scope**: Full bank (100 single-select items across 5 domains)
- **Total evaluated**: 100 questions
- **Confirmed (`status: "reviewed"`)**: 85 questions (85%)
  - Clean confirmed: 76 questions
  - Confirmed with distractor polish: 9 questions (rewrote near-duplicate or facepalm distractors into plausible alternatives while maintaining length balance)
- **Unsupported (`status: "draft"`)**: 15 questions (15%)
  - **Defect pattern**: An authoring/balancing artifact clobbered the intended correct answer option with a padded clone of a distractor. Consequently, the true architectural solution articulated in the explanation is completely missing from the ballot, and the stored `correct` key points to an incorrect distractor that actively teaches the wrong practice.
  - Per skill constraints, unsupported questions cannot be repaired by key-swapping; they require re-authoring or option reconstruction via `author-questions` and remain `draft`.

### Disposition counts by domain

| Domain | Total | Confirmed (Reviewed) | Unsupported (Draft) |
| --- | ---: | ---: | ---: |
| Agentic Architecture & Orchestration | 27 | 27 (100%) | 0 (0%) |
| Tool Design & MCP Integration | 18 | 17 (94%) | 1 (6%) |
| Claude Code Configuration & Workflows | 20 | 17 (85%) | 3 (15%) |
| Prompt Engineering & Structured Output | 20 | 15 (75%) | 5 (25%) |
| Context Management & Reliability | 15 | 9 (60%) | 6 (40%) |
| **Total** | **100** | **85** | **15** |

### Per-question dispositions

#### Agentic Architecture & Orchestration (27 items)
- `ccar-f-agentic-architecture-and-orchestration-001`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-002`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-003`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-004`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-005`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-006`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-007`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-008`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-009`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-010`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-011`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-012`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-013`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-014`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-015`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-016`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-017`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-018`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-019`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-020`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-021`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-022`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-023`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-024`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-025`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-026`: confirmed
- `ccar-f-agentic-architecture-and-orchestration-027`: confirmed

#### Tool Design & MCP Integration (18 items)
- `ccar-f-tool-design-and-mcp-integration-001`: confirmed
- `ccar-f-tool-design-and-mcp-integration-002`: confirmed
- `ccar-f-tool-design-and-mcp-integration-003`: confirmed (rewrote duplicate distractor a to set temperature 0.0)
- `ccar-f-tool-design-and-mcp-integration-004`: confirmed
- `ccar-f-tool-design-and-mcp-integration-005`: confirmed
- `ccar-f-tool-design-and-mcp-integration-006`: confirmed
- `ccar-f-tool-design-and-mcp-integration-007`: confirmed
- `ccar-f-tool-design-and-mcp-integration-008`: confirmed
- `ccar-f-tool-design-and-mcp-integration-009`: confirmed
- `ccar-f-tool-design-and-mcp-integration-010`: confirmed
- `ccar-f-tool-design-and-mcp-integration-011`: confirmed
- `ccar-f-tool-design-and-mcp-integration-012`: confirmed
- `ccar-f-tool-design-and-mcp-integration-013`: confirmed
- `ccar-f-tool-design-and-mcp-integration-014`: confirmed
- `ccar-f-tool-design-and-mcp-integration-015`: unsupported (real answer [configure personal server in ~/.claude.json] missing from options; key teaches brittle git index manipulation)
- `ccar-f-tool-design-and-mcp-integration-016`: confirmed
- `ccar-f-tool-design-and-mcp-integration-017`: confirmed
- `ccar-f-tool-design-and-mcp-integration-018`: confirmed (rewrote duplicate distractor a to delete file and regenerate)

#### Claude Code Configuration & Workflows (20 items)
- `ccar-f-claude-code-configuration-and-workflows-001`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-002`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-003`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-004`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-005`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-006`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-007`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-008`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-009`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-010`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-011`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-012`: unsupported (real answer [single glob rule vs 60 duplicate files] missing from options; key teaches directory CLAUDE.md forbidden by git)
- `ccar-f-claude-code-configuration-and-workflows-013`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-014`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-015`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-016`: unsupported (real answer [provide concrete input/output examples] missing from options; key teaches repeating prompt 4 times in all-caps)
- `ccar-f-claude-code-configuration-and-workflows-017`: unsupported (real answer [feed actual test failure stack traces] missing from options; key teaches describing app from memory)
- `ccar-f-claude-code-configuration-and-workflows-018`: confirmed (rewrote duplicate distractor b to benchmark open source caching)
- `ccar-f-claude-code-configuration-and-workflows-019`: confirmed
- `ccar-f-claude-code-configuration-and-workflows-020`: confirmed

#### Prompt Engineering & Structured Output (20 items)
- `ccar-f-prompt-engineering-and-structured-output-001`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-002`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-003`: unsupported (real answer [temporarily disable noisy review category] missing from options; key teaches forcing developers to fix all style issues before merge)
- `ccar-f-prompt-engineering-and-structured-output-004`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-005`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-006`: unsupported (real answer [targeted few-shot boundary examples] missing from options; key teaches adding 50 obvious non-ambiguous examples)
- `ccar-f-prompt-engineering-and-structured-output-007`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-008`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-009`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-010`: unsupported (real answer [JSON schema enforces syntax/types not cross-field arithmetic] missing from options; key teaches integer formatting disabled validation in schema engine)
- `ccar-f-prompt-engineering-and-structured-output-011`: confirmed (rewrote duplicate distractor b to remove field descriptions)
- `ccar-f-prompt-engineering-and-structured-output-012`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-013`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-014`: unsupported (real answer [append failed turn and validation error feedback] missing from options; key teaches resending exact prompt without error context)
- `ccar-f-prompt-engineering-and-structured-output-015`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-016`: confirmed
- `ccar-f-prompt-engineering-and-structured-output-017`: unsupported (real answer [match failed records via custom_id and resubmit only failed subset] missing from options; key teaches discarding entire 10k batch)
- `ccar-f-prompt-engineering-and-structured-output-018`: confirmed (rewrote facepalm postal mail distractors a and b to plausible cloud/gateway alternatives)
- `ccar-f-prompt-engineering-and-structured-output-019`: confirmed (rewrote facepalm quantum hardware distractors b and c to plausible API/temperature alternatives)
- `ccar-f-prompt-engineering-and-structured-output-020`: confirmed

#### Context Management & Reliability (15 items)
- `ccar-f-context-management-and-reliability-001`: confirmed
- `ccar-f-context-management-and-reliability-002`: confirmed
- `ccar-f-context-management-and-reliability-003`: confirmed (rewrote duplicate distractor a to retain full raw transcripts)
- `ccar-f-context-management-and-reliability-004`: confirmed (rewrote duplicate distractor a to strip formatting/headers)
- `ccar-f-context-management-and-reliability-005`: confirmed
- `ccar-f-context-management-and-reliability-006`: unsupported (real answer [self-reported confidence unreliability vs explicit criteria] missing from options; key teaches Claude cannot output numerals 1-10)
- `ccar-f-context-management-and-reliability-007`: unsupported (real answer [immediately honor human escalation] missing from options; key teaches refusing escalation and forcing diagnostic questions)
- `ccar-f-context-management-and-reliability-008`: confirmed (rewrote duplicate distractor a to invent arbitrary discount)
- `ccar-f-context-management-and-reliability-009`: confirmed
- `ccar-f-context-management-and-reliability-010`: unsupported (real answer [return structured error with partial results] missing from options; key teaches discarding results and returning generic error)
- `ccar-f-context-management-and-reliability-011`: unsupported (real answer [report valid findings while documenting coverage gaps] missing from options; key teaches fabricating financial figures)
- `ccar-f-context-management-and-reliability-012`: unsupported (real answer [maintain structured scratchpad file on disk] missing from options; key teaches repeating entire directory tree in every prompt)
- `ccar-f-context-management-and-reliability-013`: confirmed
- `ccar-f-context-management-and-reliability-014`: confirmed
- `ccar-f-context-management-and-reliability-015`: unsupported (real answer [attribute both figures with publication dates] missing from options; key teaches silently calculating mathematical average)

### Remaining unreviewed / Draft items
The 15 unsupported items remain in `status: "draft"`. They cannot be promoted or marked as reviewed until their answer options are properly re-authored to reflect the correct technical claim established in the vendor documentation.
