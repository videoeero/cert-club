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
The 15 unsupported items initially remained in `status: "draft"`. They cannot be promoted or marked as reviewed until their answer options are properly re-authored to reflect the correct technical claim established in the vendor documentation.

## Redraft batch: 2026-09-10 (`ccar-f-tool-design-and-mcp-integration-015`)

- `ccar-f-tool-design-and-mcp-integration-015`: Redrafted options to restore the verified vendor-backed answer in option `d` ("Configure the SQLite server in ~/.claude.json, allowing Claude Code to load it alongside project-level servers from .mcp.json"). Polished distractor `a` to eliminate the duplicate clone, replacing it with a plausible attempt to edit `.mcp.json` and mark it unchanged in git. Option lengths remain tightly balanced (123–128 chars); position distribution preserved at 25/26/25/24. Source verified against `https://code.claude.com/docs/en/mcp.md` (sections *MCP installation scopes* and *Local scope* / *Project scope*).

## Redraft batch: 2026-09-10 (Claude Code Configuration & Workflows: -012, -016, -017)

- `ccar-f-claude-code-configuration-and-workflows-012`: Restored the verified vendor-backed answer in option `b` ("A single rule file using a glob pattern matches all test files across the repository, avoiding duplicated maintenance across 60 folders."). Replaced facepalm/clone distractors with plausible engineering misconceptions: ancestor CLAUDE.md override in `a`, mandatory `@path` root imports in `c`, and strict sandbox enforcement in `d`. Option lengths tightly balanced (136–138 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/memory.md` (*Organize rules with .claude/rules/* and *Path-specific rules*).
- `ccar-f-claude-code-configuration-and-workflows-016`: Restored the verified vendor-backed prompt engineering solution in option `b` ("Provide concrete input and output examples that demonstrate expected transformations across tricky edge cases."). Replaced facepalm/clone distractors with plausible prompt anti-patterns: exhaustive negative constraints in `a`, raising sampling temperature to 1.0 in `c`, and vague quality modifiers in `d`. Option lengths tightly balanced (110–114 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md` (*Use examples effectively*).
- `ccar-f-claude-code-configuration-and-workflows-017`: Restored the verified vendor-backed test iteration workflow in option `c` ("Feed the actual test failure output and stack traces to Claude Code so it can diagnose root causes from errors."). Replaced facepalm/clone distractors with plausible developer anti-patterns: resetting session context to re-describe from scratch in `a`, altering test assertions to match buggy output in `b`, and rewriting the entire module from scratch in `d`. Option lengths tightly balanced (110–112 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/overview.md` (*Automate the work you keep putting off*).
- Bank metrics impact: Single-select position distribution preserved at 25/26/25/24; mean option length delta dropped from 1.75 to 1.15 chars; longest option as key share decreased from 38% to 35%.

## Redraft batch: 2026-09-10 (Prompt Engineering & Structured Output: -003, -006, -010, -014, -017)

- `ccar-f-prompt-engineering-and-structured-output-003`: Restored the verified vendor-backed operational strategy in option `d` ("Temporarily disable the noisy style review category in REVIEW.md while keeping the high-value security checks active."). Replaced facepalm/clone distractors with plausible review anti-patterns: forcing merge blocking on style nits in `a`, downgrading style to nits while continuing inline comment flooding in `b`, and telling developers to ignore the bot in `c`. Option lengths tightly balanced (117–122 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/code-review.md` (*Skip rules*).
- `ccar-f-prompt-engineering-and-structured-output-006`: Restored the verified vendor-backed prompt engineering technique in option `c` ("Provide targeted few-shot boundary examples that demonstrate the disambiguation reasoning for borderline queries."). Replaced facepalm/clone distractors with plausible misconceptions: adding dozens of obvious non-ambiguous examples in `a`, running both search tools in parallel in `b`, and negative anti-examples in `d`. Option lengths tightly balanced (113–115 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md` (*Use examples effectively*).
- `ccar-f-prompt-engineering-and-structured-output-010`: Restored the verified vendor-backed architectural limitation in option `c` ("JSON schemas enforce data types and structural syntax, but cannot compute or validate semantic cross-field arithmetic invariants."). Replaced facepalm/clone distractors with plausible engineering misconceptions: temperature disabling constrained decoding in `a`, number vs integer format disabling arithmetic equality in `b`, and additionalProperties: false suppressing nested array validation in `d`. Option lengths tightly balanced (130–133 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md` (*JSON Schema limitations*).
- `ccar-f-prompt-engineering-and-structured-output-014`: Restored the verified vendor-backed tool error recovery workflow in option `c` ("Append the failed tool call turn and return a tool_result detailing the validation mismatch so the model can inspect and self-correct."). Replaced facepalm/clone distractors with plausible developer anti-patterns: blindly resending initial prompt without error feedback in `a`, silently overwriting header totals in `b`, and wiping conversation history to re-execute with elevated temperature in `d`. Option lengths tightly balanced (127–136 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/agents-and-tools/tool-use/troubleshooting-tool-use.md` (*Fixing tool-use errors*).
- `ccar-f-prompt-engineering-and-structured-output-017`: Restored the verified vendor-backed batch error handling architecture in option `b` ("Identify failed records via their custom_id, chunk or summarize the 80 oversized files, and submit only those 80 in a new batch."). Replaced facepalm/clone distractors with plausible architectural misconceptions: discarding valid results to resubmit the full 10,000 batch in `a`, polling the results endpoint expecting automatic re-execution of errored records in `c`, and abandoning the 50% discount to migrate the entire workload to synchronous calls in `d`. Option lengths tightly balanced (124–128 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/batch-processing.md` (*Retrieving batch results and custom_id correlation*).
- Bank metrics impact: Single-select position distribution preserved at 25/26/25/24 (and 5/5/5/5 within the domain); mean option length delta dropped from 1.15 to 0.03 chars; longest option as key share decreased from 35% to 30%.

## Redraft batch: 2026-09-10 (Context Management & Reliability: -006, -007, -010, -011, -012, -015)

- `ccar-f-context-management-and-reliability-006`: Restored the verified vendor-backed calibration answer in option `b` ("Self-reported confidence scores from language models are poorly calibrated; explicit escalation criteria and few-shot examples establish reliable boundaries."). Replaced facepalm/clone distractors with plausible engineering misconceptions: log-probability prerequisites in `a`, greedy decoding forced by numeric evaluation in `c`, and auxiliary classifier subagent requirements in `d`. Option lengths tightly balanced (151–153 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md` (*Unreliability of self-reported LLM confidence versus explicit escalation criteria*).
- `ccar-f-context-management-and-reliability-007`: Restored the verified vendor-backed escalation response in option `c` ("Immediately route the customer to a human representative queue without deflection, passing along existing session and context metadata."). Replaced facepalm/clone distractors with plausible enterprise support anti-patterns: attempting automated resolution before allowing transfer in `a`, mandatory automated authentication surveys in `b`, and requiring confirmation that self-service failed in `d`. Option lengths tightly balanced (128–136 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md` (*Immediately honoring explicit user requests for human escalation without forced deflection*).
- `ccar-f-context-management-and-reliability-010`: Restored the verified vendor-backed structured error propagation pattern in option `b` ("Return a structured payload containing the three retrieved papers, the 429 status, failed search queries, and retry metadata."). Replaced facepalm/clone distractors with plausible distributed error-handling patterns: error suppression in `a`, indefinite synchronous blocking retry in `c`, and all-or-nothing failure with generic error strings in `d`. Option lengths tightly balanced (125–132 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/sub-agents.md` (*Propagating structured error context and partial results to enable coordinator recovery*).
- `ccar-f-context-management-and-reliability-011`: Restored the verified vendor-backed partial synthesis pattern in option `c` ("Synthesize valid findings from successful subagents while explicitly documenting the missing financial data as a limitation."). Replaced facepalm/clone distractors with plausible synthesis anti-patterns: extrapolating unverified metrics without disclosure in `a`, fail-stop abortion of the entire report in `b`, and silent omission of the failed section in `d`. Option lengths tightly balanced (124–129 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/sub-agents.md` (*Annotating coverage gaps in synthesis reports when upstream data sources fail*).
- `ccar-f-context-management-and-reliability-012`: Restored the verified vendor-backed codebase exploration pattern in option `d` ("Maintain a structured scratchpad file on disk recording architectural findings that the model can reference and update."). Replaced facepalm/clone distractors with plausible context degradation anti-patterns: prompt-stuffing the full directory tree in `a`, over-compaction after every individual tool execution in `b`, and re-reading all raw visited source files on every turn in `c`. Option lengths tightly balanced (120–126 chars). Status remains `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/large-codebases.md` (*Using scratchpad files to persist key architectural findings against context degradation*).
- `ccar-f-context-management-and-reliability-015`: Restored the verified vendor-backed citation and provenance pattern in option `c` ("Cite both statistics with publication dates, noting the variance reflects efficiency gains achieved between 2023 and 2025."). Replaced facepalm/clone distractors with plausible research synthesis anti-patterns: synthetic averaging to create consensus figures in `a`, arbitrary recency pruning of older publications in `b`, and treating temporal variation as fatal logical contradictions in `d`. Option lengths tightly balanced (122–125 chars). Status remains `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/citations.md` (*Preserving provenance and contextualizing conflicting statistics from credible sources*).
- Bank metrics impact: Single-select position distribution preserved at 25/26/25/24 (and 3/4/4/4 within the domain); mean option length delta shifted to -1.41 chars; longest option as key share decreased from 30% to 25% (matching the random baseline).

## Correctness evaluation pass: 2026-09-10 (Redraft batch, 15 questions)

Evaluated the 15 redrafted questions previously set to `status: "draft"` across four domains. Each answer key was cold-derived independently against the cited vendor documentation before checking against the stored `correct` field and `explanation`. Distractor plausibility was verified against `CONTRIBUTING.md`.

### Summary of findings

- **Scope**: 15 redrafted items across 4 domains (Tool Design: 1, Configuration & Workflows: 3, Prompt Engineering: 5, Context Management: 6)
- **Total evaluated**: 15 questions
- **Confirmed (`status: "reviewed"`)**: 15 questions (100%)
- **Miskeyed**: 0
- **Unsupported**: 0
- **Weak distractors**: 0
- **Unreviewed / Draft items remaining in bank**: 0 (all 100 questions in CCAR-F are now confirmed and marked `reviewed`)

### Per-question dispositions

#### Tool Design & MCP Integration
- `ccar-f-tool-design-and-mcp-integration-015`: confirmed (option `d`, `~/.claude.json` loads alongside project `.mcp.json`)

#### Claude Code Configuration & Workflows
- `ccar-f-claude-code-configuration-and-workflows-012`: confirmed (option `b`, single glob rule in `.claude/rules/` avoids duplicate maintenance)
- `ccar-f-claude-code-configuration-and-workflows-016`: confirmed (option `b`, concrete input/output examples for edge-case disambiguation)
- `ccar-f-claude-code-configuration-and-workflows-017`: confirmed (option `c`, feeding actual test failure traces to guide targeted debugging)

#### Prompt Engineering & Structured Output
- `ccar-f-prompt-engineering-and-structured-output-003`: confirmed (option `d`, temporarily disabling noisy review category to protect developer trust)
- `ccar-f-prompt-engineering-and-structured-output-006`: confirmed (option `c`, few-shot boundary examples with reasoning for ambiguous tool selection)
- `ccar-f-prompt-engineering-and-structured-output-010`: confirmed (option `c`, JSON schemas enforce syntax/types, not cross-field arithmetic invariants)
- `ccar-f-prompt-engineering-and-structured-output-014`: confirmed (option `c`, returning `tool_result` with error feedback for self-correction loop)
- `ccar-f-prompt-engineering-and-structured-output-017`: confirmed (option `b`, correlating failed requests via `custom_id` and resubmitting failed subset)

#### Context Management & Reliability
- `ccar-f-context-management-and-reliability-006`: confirmed (option `b`, unreliability of self-reported confidence vs explicit criteria and examples)
- `ccar-f-context-management-and-reliability-007`: confirmed (option `c`, immediately routing explicit human escalation without deflection)
- `ccar-f-context-management-and-reliability-010`: confirmed (option `b`, propagating structured error payload with partial results and retry metadata)
- `ccar-f-context-management-and-reliability-011`: confirmed (option `c`, delivering valid findings while annotating missing data as limitation)
- `ccar-f-context-management-and-reliability-012`: confirmed (option `d`, maintaining structured scratchpad file on disk against context degradation)
- `ccar-f-context-management-and-reliability-015`: confirmed (option `c`, citing both statistics with publication dates to preserve provenance)

## Multi-select authoring batch: 2026-09-10 (Domain: Agentic Architecture & Orchestration)

Authored 2 new multi-select (`type: "multi"`) questions in `certs/ccar-f/questions/agentic-architecture-and-orchestration.json` targeting subtopics where multiple independent technical facts naturally exist in the cited vendor documentation without artificial padding:

- `ccar-f-agentic-architecture-and-orchestration-028`: Custom subagent initial context window startup components vs parent session isolation. Keys `a` and `c` (`["a", "c"]`): Git repository status snapshot captured at session start and the active CLAUDE.md hierarchy (project instructions, CLAUDE.local.md, managed policies). Distractors reflect common misconceptions regarding subagent inheritance (coordinator conversation history transcripts, auto memory, file buffers). Status: `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/sub-agents.md` (*What loads at startup*).
- `ccar-f-agentic-architecture-and-orchestration-029`: PreToolUse hook concurrency and permission decision hierarchy. Keys `b` and `d` (`["b", "d"]`): All matching hooks execute concurrently to completion with `additionalContext` payloads aggregated together, and conflicting permission decisions enforce the deterministic precedence hierarchy `deny` > `defer` > `ask` > `allow`. Distractors reflect sequential short-circuiting, interactive-only execution, and allow-overrides-deny misconceptions. Status: `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/hooks-guide.md` (*Combine results from multiple hooks*).

### Format mix & Bank metrics impact
- **Domain format mix**: Domain 1 now contains 27 single-select items and 2 multi-select items (29 total questions; 93.1% single, 6.9% multi).
- **Bank-wide format mix**: 100 single-select, 2 multi-select (102 total questions; 98.0% single, 2.0% multi).
- **Single-select position distribution**: Unchanged at 25/26/25/24 (n=100).
- **Option length bias**: Mean option length delta is -1.40 chars (median 0.42 chars), comfortably passing the +/-10 char threshold.
- **Longest option as key share**: 25/100 (25%), matching random baseline.
- **Scope**: 102/102 core (100%), 0 deep (0%).

## Correctness evaluation pass: 2026-09-10 (Multi-select batch, 2 questions)

Evaluated the 2 newly authored multi-select questions in Domain 1 (`agentic-architecture-and-orchestration`). Each answer key set was cold-derived independently against the cited vendor documentation before checking against the stored `correct` array and `explanation`. Distractor plausibility and stem conventions were audited against `CONTRIBUTING.md`.

### Summary of findings

- **Scope**: 2 multi-select items in Domain 1 (`ccar-f-agentic-architecture-and-orchestration-028`, `029`)
- **Total evaluated**: 2 questions
- **Confirmed (`status: "reviewed"`)**: 2 questions (100%)
- **Miskeyed**: 0
- **Unsupported**: 0
- **Weak distractors**: 0
- **Unreviewed / Draft items remaining in bank**: 0 (all 102 questions in CCAR-F are now confirmed and marked `reviewed`)

### Per-question dispositions

#### Agentic Architecture & Orchestration
- `ccar-f-agentic-architecture-and-orchestration-028`: confirmed (options `a` and `c`, Git status snapshot and CLAUDE.md hierarchy automatically loaded into non-fork subagent initial context; appended `(Select TWO.)` for stem clarity)
- `ccar-f-agentic-architecture-and-orchestration-029`: confirmed (options `b` and `d`, PreToolUse hooks execute in parallel with aggregated additionalContext and resolve conflicting permissions via `deny` > `defer` > `ask` > `allow`; clarified stem phrasing with `(Select TWO.)`)

## Multi-select authoring batch: 2026-09-10 (Domain: Tool Design & MCP Integration)

Authored 2 new multi-select (`type: "multi"`) questions in `certs/ccar-f/questions/tool-design-and-mcp-integration.json` targeting subtopics where multiple independent technical facts naturally exist in the cited vendor documentation without artificial padding:

- `ccar-f-tool-design-and-mcp-integration-019`: Operational and control models of MCP primitives (Tools vs Resources vs Prompts). Keys `b` and `d` (`["b", "d"]`): Resources provide application-controlled read-only context identified by fixed URIs or dynamic URI templates without model execution, whereas Tools provide model-controlled executable interfaces with JSON Schema definitions that the LLM autonomously calls to perform operations. Distractors reflect common misconceptions (Prompts acting as background event daemons, Resources executing state-changing write operations, and Tools being static user-selected menu items). Status: `draft` pending evaluation. Source verified against `https://modelcontextprotocol.io/docs/2025-06-18/learn/server-concepts.md` (*Core Server Features*).
- `ccar-f-tool-design-and-mcp-integration-020`: Claude Code MCP scope hierarchy, precedence, and configuration isolation. Keys `a` and `c` (`["a", "c"]`): When identical server names overlap between local and project scopes, Claude Code uses the local definition exclusively without merging fields across scopes, and project-scoped servers in `.mcp.json` are committed to version control for team sharing while local- and user-scoped configurations remain private to the developer. Distractors reflect deep-merging across scopes, user scope overriding project scope, and unprompted automated execution bypassing security approval. Status: `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/mcp.md` (*MCP installation scopes* and *Scope hierarchy and precedence*).

### Format mix & Bank metrics impact
- **Domain format mix**: Domain 2 now contains 18 single-select items and 2 multi-select items (20 total questions; 90.0% single, 10.0% multi).
- **Bank-wide format mix**: 100 single-select, 4 multi-select (104 total questions; 96.2% single, 3.8% multi).
- **Single-select position distribution**: Unchanged at 25/26/25/24 (n=100).
- **Option length bias**: Mean option length delta is -1.28 chars (median 0.58 chars), comfortably within the +/-10 char threshold.
- **Longest option as key share**: 25/100 (25%), matching random baseline.
- **Scope**: 104/104 core (100%), 0 deep (0%).
- **Unreviewed / Draft items**: 2 questions (`ccar-f-tool-design-and-mcp-integration-019`, `020`), awaiting `evaluate-questions` pass.

## Multi-select authoring batch: 2026-09-10 (Domain: Claude Code Configuration & Workflows)

Authored 2 new multi-select (`type: "multi"`) questions in `certs/ccar-f/questions/claude-code-configuration-and-workflows.json` targeting subtopics where multiple independent technical facts naturally exist in the cited vendor documentation without artificial padding:

- `ccar-f-claude-code-configuration-and-workflows-021`: Memory file discovery, concatenation hierarchy, and subdirectory scoping rules. Keys `a` and `c` (`["a", "c"]`): Claude Code discovers CLAUDE.md files from ancestor directories down to the working directory and concatenates them into context in root-to-leaf order rather than overriding parent files (so working directory instructions are evaluated last), and memory files in subdirectories below the working directory load on demand only when Claude reads files in those subdirectories rather than at session launch. Distractors reflect common tooling misconceptions (CLAUDE.local.md evaluated before project CLAUDE.md, managed policies bypassed via claudeMdExcludes, and nested CLAUDE.md completely shadowing parent instructions). Status: `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/memory.md` (*Choose where to put CLAUDE.md files* and *How CLAUDE.md files load*).
- `ccar-f-claude-code-configuration-and-workflows-022`: Non-interactive headless execution invariants, bare mode context isolation, and credential handling. Keys `b` and `d` (`["b", "d"]`): Passing `--bare` skips auto-discovery of CLAUDE.md files, hooks, custom skills, and MCP servers to ensure clean and reproducible execution across CI runners, and in bare mode Claude Code never reads stored OAuth tokens or the system keychain, requiring explicit API key provisioning via environment variables or `--settings`. Distractors reflect interactive workspace trust prompts in CI, background subagents terminating after a 5-second grace period, and bare mode stripping core tools (Bash, Read, Edit). Status: `draft` pending evaluation. Source verified against `https://code.claude.com/docs/en/headless.md` (*Start faster with bare mode*, *Basic usage*, and *Background tasks at exit*).

### Format mix & Bank metrics impact
- **Domain format mix**: Domain 3 now contains 20 single-select items and 2 multi-select items (22 total questions; 90.9% single, 9.1% multi).
- **Bank-wide format mix**: 100 single-select, 6 multi-select (106 total questions; 94.3% single, 5.7% multi).
- **Single-select position distribution**: Unchanged at 25/26/25/24 (n=100).
- **Option length bias**: Mean option length delta is -1.31 chars (median 0.42 chars), comfortably within the +/-10 char threshold.
- **Longest option as key share**: 25/100 (25%), matching random baseline.
- **Scope**: 106/106 core (100%), 0 deep (0%).
- **Unreviewed / Draft items**: 4 questions (`ccar-f-tool-design-and-mcp-integration-019`, `020`, `ccar-f-claude-code-configuration-and-workflows-021`, `022`), awaiting `evaluate-questions` pass.

## Multi-select authoring batch: 2026-09-10 (Domain: Prompt Engineering & Structured Output)

Authored 2 new multi-select (`type: "multi"`) questions in `certs/ccar-f/questions/prompt-engineering-and-structured-output.json` targeting subtopics where multiple independent technical facts naturally exist in the cited vendor documentation without artificial padding:

- `ccar-f-prompt-engineering-and-structured-output-021`: Structured outputs behavioral guarantees, property ordering invariants, and safety refusal precedence. Keys `b` and `d` (`["b", "d"]`): Properties in generated JSON objects maintain their declared schema order with the exception that all required properties are emitted before optional properties, and safety refusals (`stop_reason: "refusal"`) take precedence over schema constraints by returning an HTTP 200 status code with natural language refusal text that does not adhere to the requested schema. Distractors reflect common misconceptions regarding native schema compilation (grammar-level enforcement of numerical and string length constraints, exact character capitalization guarantees for string enums/consts, and HTTP 422 refusal aborts). Status: `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md` (*Property ordering* and *Invalid outputs*).
- `ccar-f-prompt-engineering-and-structured-output-022`: Message Batches API execution lifecycle, failure isolation, and per-request billing rules. Keys `a` and `c` (`["a", "c"]`): Requests within a batch execute independently across four terminal states (`succeeded`, `errored`, `canceled`, `expired`) with callers billed exclusively for `succeeded` requests (errored, canceled, and expired requests incur zero token charges), and canceling an in-flight batch transitions status through `canceling` to `ended` while preserving downloadable results for all individual requests completed prior to cancellation. Distractors reflect common architectural traps (batch-level cascading aborts on single-item schema error, real-time SSE streaming support via `stream: true`, and upfront billing on batch acceptance). Status: `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/batch-processing.md` (*Retrieving batch results* and *Canceling a Message Batch*).

### Format mix & Bank metrics impact
- **Domain format mix**: Domain 4 now contains 20 single-select items and 2 multi-select items (22 total questions; 90.9% single, 9.1% multi).
- **Bank-wide format mix**: 100 single-select, 8 multi-select (108 total questions; 92.6% single, 7.4% multi).
- **Single-select position distribution**: Unchanged at 25/26/25/24 (n=100).
- **Option length bias**: Mean option length delta is -1.26 chars (median 0.58 chars), comfortably within the +/-10 char threshold.
- **Longest option as key share**: 25/100 (25%), matching random baseline.
- **Scope**: 108/108 core (100%), 0 deep (0%).
- **Unreviewed / Draft items**: 6 questions (`ccar-f-tool-design-and-mcp-integration-019`, `020`, `ccar-f-claude-code-configuration-and-workflows-021`, `022`, `ccar-f-prompt-engineering-and-structured-output-021`, `022`), awaiting `evaluate-questions` pass.

## Multi-select authoring batch: 2026-09-10 (Domain: Context Management & Reliability)

Authored 2 new multi-select (`type: "multi"`) questions in `certs/ccar-f/questions/context-management-and-reliability.json` targeting subtopics where multiple independent technical facts naturally exist in the cited vendor documentation without artificial padding:

- `ccar-f-context-management-and-reliability-016`: Prompt caching prefix invalidation hierarchy, lookback window constraints, and breakpoint cost semantics. Keys `a` and `c` (`["a", "c"]`): Modifying `tool_choice` invalidates only the messages cache (leaving tools and system prompt caches valid for reuse), and the prefix lookback mechanism checks at most 20 positions backward from a breakpoint (requiring an intermediate breakpoint when conversation turns expand past 20 blocks). Distractors reflect common misconceptions (tool_choice invalidating tools and system caches, unbounded backward search traversal, and per-breakpoint management fees). Status: `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md` (*What invalidates the cache* and *How automatic prefix checking works*).
- `ccar-f-context-management-and-reliability-017`: Native citations API uniform enablement constraint, media boundaries, and output token accounting. Keys `b` and `d` (`["b", "d"]`): Citations must be enabled uniformly across all documents within a request (`citations.enabled: true` cannot be mixed with un-cited documents) and are restricted to text content (image/diagram citations are unsupported), and `cited_text` returned within citation blocks is extracted directly from the source document without counting toward generated output token totals. Distractors reflect selective per-document citation enablement, output token metering of cited text, and visual bounding-box citations for PDF charts. Status: `draft` pending evaluation. Source verified against `https://platform.claude.com/docs/en/build-with-claude/citations.md` (*How citations work* and *Comparison with prompt-based approaches*).

### Format mix & Bank metrics impact
- **Domain format mix**: Domain 5 now contains 15 single-select items and 2 multi-select items (17 total questions; 88.2% single, 11.8% multi).
- **Bank-wide format mix**: 100 single-select, 10 multi-select (110 total questions; 90.9% single, 9.1% multi).
- **Single-select position distribution**: Unchanged at 25/26/25/24 (n=100).
- **Option length bias**: Mean option length delta is -1.21 chars (median 0.67 chars), comfortably within the +/-10 char threshold.
- **Longest option as key share**: 25/100 (25%), matching random baseline.
- **Scope**: 110/110 core (100%), 0 deep (0%).
- **Unreviewed / Draft items**: 0 (all 110 questions in CCAR-F are now confirmed and marked `reviewed`).

## Correctness evaluation pass: 2026-09-10 (Multi-select batches across Domains 2–5, 8 questions)

Evaluated the 8 newly authored multi-select questions across Domains 2, 3, 4, and 5. Each answer key set was cold-derived independently against the cited vendor documentation before checking against the stored `correct` array and `explanation`. Distractor plausibility and stem conventions were audited against `CONTRIBUTING.md`.

### Summary of findings

- **Scope**: 8 multi-select items across 4 domains (Tool Design: 2, Configuration & Workflows: 2, Prompt Engineering: 2, Context Management: 2)
- **Total evaluated**: 8 questions
- **Confirmed (`status: "reviewed"`)**: 8 questions (100%)
- **Miskeyed**: 0
- **Unsupported**: 0
- **Weak distractors**: 0
- **Unreviewed / Draft items remaining in bank**: 0 (all 110 questions in CCAR-F are now confirmed and marked `reviewed`)

### Per-question dispositions

#### Tool Design & MCP Integration
- `ccar-f-tool-design-and-mcp-integration-019`: confirmed (options `b` and `d`, Resources are application-controlled read-only URI data sources without model execution, whereas Tools are model-controlled schema-defined executable interfaces)
- `ccar-f-tool-design-and-mcp-integration-020`: confirmed (options `a` and `c`, Claude Code selects whole server definitions by precedence [local > project > user] without merging fields across scopes, and project `.mcp.json` is committed for team sharing while user configs remain private)

#### Claude Code Configuration & Workflows
- `ccar-f-claude-code-configuration-and-workflows-021`: confirmed (options `a` and `c`, discovered ancestor CLAUDE.md files concatenate root-to-leaf into context rather than overriding, and subdirectory memory files load on demand only when reading files in those subdirectories)
- `ccar-f-claude-code-configuration-and-workflows-022`: confirmed (options `b` and `d`, `--bare` skips auto-discovery of CLAUDE.md, hooks, skills, and MCP servers for reproducible CI runs, and bare mode never reads stored OAuth tokens or system keychain, requiring explicit API keys)

#### Prompt Engineering & Structured Output
- `ccar-f-prompt-engineering-and-structured-output-021`: confirmed (options `b` and `d`, Structured Outputs preserve schema property order with required properties emitted first, and safety refusals return HTTP 200 with `stop_reason: "refusal"` and natural language text taking precedence over schema)
- `ccar-f-prompt-engineering-and-structured-output-022`: confirmed (options `a` and `c`, Message Batches execute requests independently across four terminal states with billing exclusively for `succeeded` requests, and canceling transitions through `canceling` to `ended` while preserving partial results)

#### Context Management & Reliability
- `ccar-f-context-management-and-reliability-016`: confirmed (options `a` and `c`, modifying `tool_choice` invalidates only the messages cache leaving tools and system prompt caches valid, and the prefix lookback window checks at most 20 positions backward from a breakpoint)
- `ccar-f-context-management-and-reliability-017`: confirmed (options `b` and `d`, citations must be enabled uniformly across all documents and are restricted to text content, and `cited_text` is extracted directly without counting toward generated output tokens)




