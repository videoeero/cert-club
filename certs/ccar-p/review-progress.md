# Claude Certified Architect – Professional review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-12 based on the Claude Certified Architect –
Professional Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-P).

## Bank status: `draft`

`manifest.status` is `draft`. The bank currently contains 7 seed questions (1 per domain,
all `status: "draft"`, `scope: "core"`), authored to verify schema validity, blueprint
alignment, and public doc sourceability across all 7 domains.

Promote to `stable` only when coverage across the blueprint is complete and proportional,
judged per domain against manifest weights, and record that reasoning here.

## Recon verdict: `GO-WITH-CONSTRAINTS`

The certification assessment approved a **GO-WITH-CONSTRAINTS** verdict:
- The official exam guide is publicly accessible without credentials or registration.
- Domain weights are explicitly defined integers that sum to exactly 100%.
- Public, authoritative vendor documentation covers the technical competencies across all domains.
- Question format is standard single- and multiple-response, requiring no schema extensions.

**Named constraints:**
1. **Thin official sample question inventory**: The vendor exam guide provides only 3 illustrative sample questions in Section 8 (compared to 12 in CCAR-F). Cognitive level calibration relies additionally on third-party practice material under the calibration firewall.
2. **Domain 6 documentation anchoring**: Domain 6 (Stakeholder Communication & Lifecycle Management, 14%) covers discovery, architectural tradeoff communication, SLAs, and lifecycle phases. Authors must strictly anchor questions in Anthropic's public architectural guidance (e.g. "Building effective agents", deployment patterns, Enterprise/ZDR agreements) rather than unanchored enterprise consulting trivia.

## Blueprint and weights

The guide publishes exact domain weights in Section 6. Exact integers sum to 100%:

| Domain | Slug | Weight | Target (63) | Target (100) | Bank Seeds |
| --- | --- | ---: | ---: | ---: | ---: |
| Solution Design & Architecture | `solution-design-and-architecture` | 17% | 11 | 17 | 1 |
| Claude Models, Prompting & Context Engineering | `claude-models-prompting-and-context-engineering` | 13% | 8 | 13 | 1 |
| Integration | `integration` | 19% | 12 | 19 | 1 |
| Evaluation, Testing & Optimization | `evaluation-testing-and-optimization` | 16% | 10 | 16 | 1 |
| Governance, Safety & Risk Management | `governance-safety-and-risk-management` | 14% | 9 | 14 | 1 |
| Stakeholder Communication & Lifecycle Management | `stakeholder-communication-and-lifecycle-management` | 14% | 9 | 14 | 1 |
| Developer Productivity & Operational Enablement | `developer-productivity-and-operational-enablement` | 7% | 4 | 7 | 1 |
| **Total** | | **100%** | **63** | **100** | **7** |

Exam specs from blueprint:
- Total items: 63 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Multiple-choice and multiple-response items; each item states how many responses to select

### Skill breakdown

Section 6 lists detailed task objectives under each domain, but does not publish percentage weights below the domain level. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `ccar-f`, `az-900`, and `aws-clf-c02`.

## Source classification

Evaluated against the repository's two non-negotiable tests (Gate and Authority):

| Candidate Source | Gate | Authority | Disposition | Notes |
| --- | --- | --- | --- | --- |
| Official Exam Guide PDF (`everpath-course-content.s3-accelerate.amazonaws.com`) | Pass | Pass | **Citable** | Canonical vendor blueprint hosted on Anthropic's Everpath S3 CDN path. |
| Claude Platform documentation (`platform.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Primary vendor reference for Messages API, tool use, prompt caching, batch processing, data retention. Accessible as `.md`. |
| Claude Code documentation (`code.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Vendor reference for Claude Code CLI, memory hierarchy, hooks, subagents, and tools. Accessible as `.md`. |
| Anthropic Engineering Research & Posts (`anthropic.com/engineering/...`) | Pass | Pass | **Citable** | Authoritative vendor engineering publications on agentic workflows, multi-agent systems, and architecture. |
| Model Context Protocol Specification (`modelcontextprotocol.io`) | Pass | Pass | **Citable** | Official MCP open standard specification published by Anthropic. |
| Anthropic Partner Academy courses (`anthropic-partners.skilljar.com`) | Fail | Pass | **Excluded** | Gated behind partner/user login. The test is registration, not price. |
| Course landing pages / marketing syllabi | Pass | Pass | **Readable only** | Evidence of curriculum scope only; never cite for technical facts. |
| Legacy documentation (`docs.anthropic.com`) | Pass | Fail | **Excluded** | Legacy redirects and restructured paths that no longer establish specific claims. |
| Third-party dumps, GitHub mirrors, unofficial guides | Pass | Fail | **Excluded** | Unofficial third-party mirrors fail authority test. |

## Official sample question inventory

Section 8 of the CCAR-P exam guide provides 3 illustrative sample questions:

1. **Sample 1 · Domain 3 (Integration)**: A customer-support agent has tools for reading tickets, drafting replies, issuing refunds, and deleting user accounts, but staff only need to read and draft. Applying least-privilege principles, which change best reduces risk? Key: B (Remove refund and delete tools from the agent's configuration entirely).
2. **Sample 2 · Domain 2 (Claude Models, Prompting & Context Engineering)**: An application sends an 8,000-token system prompt and policy document on every request with dynamic user messages. Latency and cost are concerns. Key: C (Place static system prompt and policy before dynamic content and enable prompt caching).
3. **Sample 3 · Domain 4 (Evaluation, Testing & Optimization)**: A RAG system suddenly returns confident but incorrect answers after a document refresh while latency and model version are unchanged. Key: B (The retrieval/indexing step is returning irrelevant or stale chunks).

All 3 items emphasize architectural decision-making, root cause diagnosis, and structural tradeoffs over rote factual recall.

## Calibration principles and firewall

Calibration materials available for this bank:
- The 3 official sample questions from Section 8 of the exam guide.
- Matthew Purcell's 63-question practice exam set, published in a [LinkedIn post](https://www.linkedin.com/posts/purcellmatthew_claude-certified-architect-professional-practice-activity-7482176978008342528-204Q), written following Exam Guide v1.0 to mirror live exam difficulty and scenario style.

Standing calibration firewall from `certs/ccdv-f/review-progress.md`:

> **Calibration only.** No question, option, or rationale here derives from that set, or from any other third-party bank. It informed how deep and how scenario-shaped a question should be, never what a question says.

Cognitive level and depth anchors follow Anchor 2 strictly: items discriminate conceptually on failure modes, orchestration boundaries, lifecycle hooks, state persistence, and architectural tradeoffs. Named flags, API parameters, and headers appear as supporting detail inside options rather than trivia test points.

## Review and authoring history

### Seed questions (2026-09-12)

One `core` question seeded per domain to verify sourceability and schema validity:
- `ccar-p-solution-design-and-architecture-001`: Selecting prompt chaining workflow over autonomous agent for deterministic invoice validation (`anthropic.com/engineering/building-effective-agents`).
- `ccar-p-claude-models-prompting-and-context-engineering-001`: Prompt caching prefix ordering and placement of dynamic session metadata (`platform.claude.com/docs/en/build-with-claude/prompt-caching`).
- `ccar-p-integration-001`: Model Context Protocol (MCP) primitive roles: Resources for passive schemas vs Tools for executable updates (`modelcontextprotocol.io/docs/learn/architecture`).
- `ccar-p-evaluation-testing-and-optimization-001`: Asynchronous nightly compliance transcript evaluations using Message Batches API for 50% discount and dedicated throughput (`platform.claude.com/docs/en/build-with-claude/batch-processing`).
- `ccar-p-governance-safety-and-risk-management-001`: Zero Data Retention (ZDR) commercial arrangement for HIPAA-compliant clinical summaries (`platform.claude.com/docs/en/manage-claude/api-and-data-retention`).
- `ccar-p-stakeholder-communication-and-lifecycle-management-001`: Framing architectural tradeoffs of agentic autonomy vs simpler single-call workflows against SLAs (`anthropic.com/engineering/building-effective-agents`).
- `ccar-p-developer-productivity-and-operational-enablement-001`: Claude Code team governance using CLAUDE.md guidelines, auto memory for developer preferences, and PreToolUse hooks for blocking destructive operations (`code.claude.com/docs/en/memory.md`).
