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
