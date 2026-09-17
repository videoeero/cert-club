# Claude Certified Architect – Professional review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-12 based on the Claude Certified Architect –
Professional Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-P).

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-13 following coverage audit and human confirmation.
The bank contains 126 questions (all 126 `status: "reviewed"`, 0 `status: "draft"`),
achieving exactly 2× the 63-question exam baseline proportionally distributed across all 7 domains
according to blueprint weights with zero delta. All 126 questions have undergone adversarial correctness
evaluation (`evaluate-questions`) and difficulty calibration (`harden-domain-questions`) against official
sample anchors. All three repository bias guards pass cleanly.

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

| Domain | Slug | Weight | Target (63) | Bank Questions (2×) |
| --- | --- | ---: | ---: | ---: |
| Solution Design & Architecture | `solution-design-and-architecture` | 17% | 11 | 21 |
| Claude Models, Prompting & Context Engineering | `claude-models-prompting-and-context-engineering` | 13% | 8 | 16 |
| Integration | `integration` | 19% | 12 | 24 |
| Evaluation, Testing & Optimization | `evaluation-testing-and-optimization` | 16% | 10 | 20 |
| Governance, Safety & Risk Management | `governance-safety-and-risk-management` | 14% | 9 | 18 |
| Stakeholder Communication & Lifecycle Management | `stakeholder-communication-and-lifecycle-management` | 14% | 9 | 18 |
| Developer Productivity & Operational Enablement | `developer-productivity-and-operational-enablement` | 7% | 4 | 9 |
| **Total** | | **100%** | **63** | **126** |

Exam specs from blueprint:
- Total items: 63 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Multiple-choice (single-select) and multiple-response (multi-select, select-TWO)

## Composition and coverage audit

Audited against the 126-question bank:
- **Item formats**: 110 single-select, 16 multi-select (all select-TWO).
- **Difficulty breakdown**: 86 medium, 40 hard, 0 easy.
- **Sourcing**: 60 distinct authoritative documentation pages (bare URL format normalized).
- **Single-select position distribution**: 29 A / 30 B / 26 C / 25 D across `a`–`d` (max 27.3%, comfortably below the 50% ceiling).
- **Option length delta**: Mean correct-option length minus distractor length is +0.70 characters (median +0.50 characters).
- **Longest option as key share**: 27 of 110 single-select items (24.5%), below the 45% ceiling.
- **Heuristic baselines**: "Always longest" yields 26.4% expected score; "Eliminate absolutes" yields 28.9% expected score (uniquely solving 0 of 110 items).
- **Distractor notes coverage**: 100% of distractor options across all 126 questions carry complete explanations in `distractorNotes`.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

## Known coverage limits and deliberate boundaries

- **Deprecated MCP surface**: MCP revision `2026-07-28` (SEP-2577) classified Roots, Sampling, Logging, and Dynamic Client Registration as Deprecated, and HTTP+SSE transport has been deprecated since revision `2025-03-26`. The bank tests the two current transports (stdio, Streamable HTTP) and non-deprecated primitives. Two items (`integration-011`, `023`) test Roots and Sampling because both remain in the specification until at least 2027-07-28; each explicitly notes the deprecation and migration path.
- **Deliberate perimeters and out-of-scope boundaries**:
  - *Domain 1 (Solution Design & Architecture)*: Focuses on canonical Anthropic workflows (prompt chaining, routing, parallel sectioning, orchestrator-workers, evaluator-optimizer), coordinator/subagent context isolation, and ACI tool consolidation. Excludes third-party multi-agent frameworks (LangGraph, AutoGen, CrewAI), multi-modal voice/audio real-time WebRTC agents, and Desktop/OS coordinate-level screen automation loops.
  - *Domain 2 (Claude Models, Prompting & Context Engineering)*: Focuses on prompt caching prefix ordering/breakpoints, extended thinking reasoning budgets, XML framing, structured tool outputs, and long-context ordering. Excludes vision tile token calculation formulas, custom model distillation, and self-service fine-tuning.
  - *Domain 3 (Integration)*: Focuses on MCP primitives (Resources, Tools, Prompts), stdio and Streamable HTTP transports, Messages API tool execution mechanics, Contextual Retrieval, context editing, and programmatic tool calling. Excludes WebSocket MCP transports and cloud-provider IAM wrapper policies (Bedrock / Vertex AI IAM).
  - *Domain 4 (Evaluation, Testing & Optimization)*: Focuses on multi-grader suites (code assertions + LLM judges), `pass^k` consistency gates, CI regression vs capability suite separation, transcript-versus-outcome grading, staged evaluation (automated evals in CI, A/B testing, production monitoring), and isolated LLM judges. Excludes statistical sample-size power formulas, named third-party eval frameworks (Ragas, TruLens, DeepEval), and automated prompt search algorithms (DSPy).
  - *Domain 5 (Governance, Safety & Risk Management)*: Focuses on Zero Data Retention (ZDR), indirect prompt injection defense, Claude Enterprise Inference Hooks, Agent SDK permissions and callbacks, regional data residency (`inference_geo`), CMEK KMS key revocation (1-hour cache TTL), Compliance API eDiscovery scopes, GDPR Article 17, and SCIM immutability. Excludes HIPAA BAA contract text, FedRAMP High packages, and SIEM query language syntax (Splunk SPL).
  - *Domain 6 (Stakeholder Communication & Lifecycle Management)*: Focuses on the simplicity principle during discovery, SLA metrics (TTFT via streaming), cost-per-task economics, HTTP 429 vs 529 root causes with jittered backoff, CLAUDE.md repository onboarding, Workspaces governance, and production feedback eval flywheels. Excludes generic corporate finance metrics (NPV, IRR) and formal change management frameworks (ADKAR, Kotter).
  - *Domain 7 (Developer Productivity & Operational Enablement)*: Focuses on Claude Code repository conventions (CLAUDE.md, `.claude/rules/`, `.claude/skills/`, `.claude/agents/`), PreToolUse hooks, MDM managed settings, git worktrees, `/compact` recovery, and stdio JSON-RPC framing corruption. Excludes IDE keyboard shortcuts and third-party CI/CD pipeline configuration syntax beyond CLI invocation flags.

## Source classification

Evaluated against the repository's two non-negotiable tests (Gate and Authority):

| Candidate Source | Gate | Authority | Disposition | Notes |
| --- | --- | --- | --- | --- |
| Official Exam Guide PDF (`everpath-course-content.s3-accelerate.amazonaws.com`) | Pass | Pass | **Citable** | Canonical vendor blueprint hosted on Anthropic's Everpath S3 CDN path. |
| Claude Platform documentation (`platform.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Primary vendor reference for Messages API, tool use, prompt caching, batch processing, data retention. Bare URL form. |
| Claude Code documentation (`code.claude.com/docs/en/...`) | Pass | Pass | **Citable** | Vendor reference for Claude Code CLI, memory hierarchy, hooks, subagents, and tools. Bare URL form. |
| Anthropic Engineering Research & Posts (`anthropic.com/engineering/...`) | Pass | Pass | **Citable** | Authoritative vendor engineering publications on agentic workflows, multi-agent systems, and architecture. |
| Model Context Protocol Specification (`modelcontextprotocol.io`) | Pass | Pass | **Citable** | Official MCP open standard specification published by Anthropic. |
| Anthropic Partner Academy courses (`anthropic-partners.skilljar.com`) | Fail | Pass | **Excluded** | Gated behind partner/user login. The test is registration, not price. |
| Course landing pages / marketing syllabi | Pass | Pass | **Readable only** | Evidence of curriculum scope only; never cite for technical facts. |
| Legacy documentation (`docs.anthropic.com`) | Pass | Fail | **Excluded** | Legacy redirects and restructured paths that no longer establish specific claims. |
| Third-party dumps, GitHub mirrors, unofficial guides | Pass | Fail | **Excluded** | Unofficial third-party mirrors fail authority test. |

## Official sample question inventory

Section 8 of the CCAR-P exam guide provides 3 illustrative sample questions:

1. **Sample 1 · Domain 3 (Integration)**: Customer-support agent has excessive tools (refund, delete account). Applying least-privilege principles: remove refund and delete tools from agent configuration entirely. Key: B.
2. **Sample 2 · Domain 2 (Claude Models, Prompting & Context Engineering)**: Static 8,000-token system prompt and policy document sent on every request with dynamic user messages: place static prompt before dynamic content and enable prompt caching. Key: C.
3. **Sample 3 · Domain 4 (Evaluation, Testing & Optimization)**: RAG system returns confident but incorrect answers after document refresh: retrieval/indexing step is returning irrelevant or stale chunks. Key: B.

## Calibration principles and distractor hardening

Cognitive depth is anchored to Anchor 2: discriminating conceptually on failure modes, orchestration boundaries, lifecycle hooks, state persistence, and architectural tradeoffs. Matthew Purcell's 63-question practice exam was used under the calibration firewall (informing depth and scenario shape, never question content).

A systematic pass hardened soft distractors across all 7 domains (67 hardened, 59 calibrated-no-change):

| Domain | Total | Hardened | Calibrated | Hardening Focus |
| --- | ---: | ---: | ---: | --- |
| Solution Design & Architecture | 21 | 7 | 14 | Replaced length tells and strawmen with parallel voting consensus, compensating prompt traps, and spot-instance checkpointing gotchas. |
| Claude Models, Prompting & Context Engineering | 16 | 0 | 16 | Cleared Stage 0 untouched; already substantially above anchor (extended thinking token budgets, 5-minute TTL eviction, SKILL.md modularization). |
| Integration | 24 | 7 | 17 | Replaced unindexed regex and raw TCP socket claims with mTLS DNS rebinding gotchas, in-context caching vs hierarchical RAG, and MCP sampling governance. |
| Evaluation, Testing & Optimization | 20 | 15 | 5 | Replaced arbitrary retry loops and facepalms with `pass^k` consistency gates, OpenTelemetry distributed spans, and transcript-vs-outcome decoupling. |
| Governance, Safety & Risk Management | 18 | 12 | 6 | Replaced crude bash tools and consumer terms with Agent SDK permission evaluation order, CMEK KMS key revocation, CASB forward proxies, and workspace trust in CI. |
| Stakeholder Communication & Lifecycle Management | 18 | 17 | 1 | Replaced consulting strawmen with simplicity principle trade-offs, sub-second TTFT streaming, Workspaces spend limits, HTTP 429 vs 529 backoff, and golden eval flywheels. |
| Developer Productivity & Operational Enablement | 9 | 9 | 0 | Replaced claims of Claude Code file-reading inability with MDM `managed-settings.json`, `--bare` CI invocation, git worktrees, `/compact` focus, and stdio framing deadlocks. |
| **Total** | **126** | **67** | **59** | **All 126 items meet or exceed sample cognitive depth; all bias guards pass.** |

## Architectural adjudications and source drift resolutions

Key technical corrections and drift adjudications across review passes:

- **MCP transports & wire methods**:
  - `integration-010`: Re-authored from deprecated HTTP+SSE onto stdio + Streamable HTTP (`specification/2026-07-28/basic/transports`).
  - `integration-004`: Origin validation, localhost-binding, and DNS-rebinding controls restated over Streamable HTTP.
  - `integration-019`: Wire method rewritten from removed `resources/subscribe` to `subscriptions/listen` + `notifications.resourceSubscriptions`.
  - `integration-011`: Clarified that Roots communicate intended boundaries to servers rather than enforce them (real isolation requires OS sandboxing/permissions).
  - `developer-...-009`: Re-cited to `/specification/2026-07-28/basic/transports/stdio` for the rule that servers must not write non-JSON-RPC data to `stdout` (`stderr` reserved for logging).
- **Model generation currency**: All retired 3.5/3.7 model references were updated to current models (Claude Haiku 4.5, Sonnet 4.5, Sonnet 5, Opus 5, Mythos 5.1, Fable 5.1).
- **API migrations & restrictions**:
  - `prompting-002`, `008`: Manual extended thinking (`budget_tokens`) noted as deprecated on 4.6 and returning HTTP 400 on 4.7+; `002` scoped to Sonnet 4.5 and `008` re-authored onto Opus 5 adaptive thinking (`output_config.effort`).
  - `integration-005`: Forced tool use (`tool_choice: "any"`/`"tool"`) returns HTTP 400 on Fable 5.1 and Mythos 5.1; stem explicitly scopes Sonnet 5 as a supporting model and records the manual extended thinking restriction.
  - `prompting-007`, `013`: Prefilling assistant turns returns HTTP 400 from Claude 4.6 onward; re-keyed onto Structured Outputs (`output_config.format`). Clarified that Structured Outputs enforces JSON schemas and cannot emit XML (`prompting-007`).
- **Prompt injection & eval design**:
  - `prompting-004`: Reframed from obsolete XML injection defence to prompt section disambiguation (untrusted inputs belong exclusively in `tool_result` blocks).
  - `eval-012`: Re-authored onto red-teaming validation and continuous monitoring to evaluate indirect prompt injection, preventing overlap with `gov-002`.
  - `eval-013`: Replaced Ragas metrics with transcript-versus-outcome grading to decouple retrieval from generation.
- **State persistence across host preemptions**: `sda-017` was re-cited to `code.claude.com/docs/en/agent-sdk/sessions` § Resume across hosts, requiring custom session-store adapters for ephemeral/serverless environments.
- **Batches API deduplication**: Consolidated four overlapping Batches items into distinct competencies: `sda-008` (architectural asynchronous choice), `eval-001` (per-request terminal states: `succeeded`, `errored`, `canceled`, `expired`), `stake-010` (publishing 24-hr SLA commitments with 500k request batch chunking), and `sda-020` (paired with fast models).
- **Latency levers**: `eval-006` re-authored to test model tiering (Haiku 4.5) and prompt/output trimming; `eval-016` grounded on SSE streaming for perceived responsiveness.
- **Formatting normalizations**: 29 citations carrying `.md` extensions were normalised to the bare URL format; all 16 multi-select suffixes were unified to `(Select TWO.)`.

## Figure-bearing claims adjudication and numeric precedent

Following repeated reviews of figures and percentages across the bank, the repository established four numeric classes:
1. **Class 1 — Verbatim Vendor Facts** (`25% write premium`, `5-minute TTL`, `200,000 tokens`): Must match the cited page in substance, and quoted strings must match verbatim.
2. **Class 2 — Scenario Parameters** (`70% routine traffic`, `300,000 requests`): Permitted freely in stems, explanations, and notes to trace logic; must not be framed as vendor guidance.
3. **Class 3 — Cross-Page Distractor Facts** (`Batch API 50% discount`, `24-hour expiration`): Permitted in distractors to build authentic trade-offs; must not be falsely attributed to the cited page.
4. **Class 4 — Derived Figures and Mechanism Conversions** (`0.1x` ↔ `10% of base price`): Direct identity representations of stated mechanisms (`10% of base price`) are preferred over derived marketing figures (`90% discount`). Conflating derived rates with empirical benchmark ranges ("up to 90%") or asserting empirical ceilings as feature specifications is an authoring defect.

### Adjudications and bank defect rate

- **Evaluated**: 29 figure-bearing questions (6 initial precedent pass, 1 incidental, 22 baseline pass).
- **Confirmed without change**: 24.
- **Defects rewritten**: 5 items:
  - `eval-019`: Explanation and distractor notes restated from "90% discount" to `0.1x` / 10% of base input price.
  - `stake-003`: Distractor note `opt-c` removed spurious "up to 90% read discount" hybrid.
  - `integration-021`: Fixed attribution converting empirical end-to-end task savings ("costs by up to 90%") to unit token pricing.
  - `integration-022`: Restated empirical ceiling ("up to 90%") to specify prefix billing at cache-read rate.
  - `stake-011`: Incidental rewrite replacing "90% discount" with cache-read rate in distractor `opt-d`.
- **Bank defect rate**: 5 / 29 = **17.2%** (or 4 / 29 = **13.8%** excluding incidental `stake-011`).
- **Mechanical detection**: A pinned mechanical sweep identified 34 total figure-bearing items in `ccar-p` (62 corpus-wide).

## Tooling and claim-checking findings (`check-claims`)

Evaluation of automated quote and identifier checking across the corpus:
- **Corpus precision**: Evaluated across 360 in-scope citations, yielding 9.3% precision (4 true findings, 39 false positives / 90.7% noise). Driven by non-vendor scenario nouns, prompt fragments, and distractor configs. Hard checks were demoted to advisory.
- **Per-bank split**: `ccar-p` achieved 75.0% precision (3/4), while `ccar-f` had 2.9% (1/35) and `ccdv-f` 0.0% (0/4).
- **Four true findings resolved across corpus**:
  - `ccar-f-claude-code-...-003`: Taught invented `@import` directive; re-grounded on `@path/to/import` with 4-hop recursion limit.
  - `ccar-p-stakeholder-...-018`: Quoted outdated page title `'Develop tests and evaluations'`; re-grounded on "Define success criteria and build evaluations".
  - `ccar-p-stakeholder-...-003`: Quoted `'Compare models on cost per completed task, not per token.'`; re-grounded on verbatim table text without inserted word "models".
  - `ccar-p-claude-models-...-002`: Backticked `output_config.effort`; matched page's object notation `output_config: {effort: ...}`.

## Source audit — 2026-09-14

Scope was limited to the CCAR-P bank. The official Version 1.0 exam guide
(Effective July 2026) was re-read first; its version, date, domains, weights,
item count, duration, and format still match `manifest.json`, so no blueprint
revision was needed.

All 60 normalized CCAR-P source pages (64 citation URLs, including anchored
variants) were re-read independently. Every page returned HTTP 200, no cited
URL moved through a redirect, and no source was stale. The 126 questions
received an explicit **bump** disposition and their `sourceCheckedAt` values
were advanced to `2026-09-14`. No question required re-citation, rewriting, or
retirement.

### Figure adjudication for this pass

`check-claims` returned 100 figure checks across this bank's 34
figure-bearing questions: 44 present on the cited page, 31 absent, and 25 on
`www.anthropic.com` which the automated tool cannot read (`inconclusive: out-of-scope host`).
All 100 checks were fully adjudicated and verified against the cited pages
and official documentation, classified by the repository's four numeric classes:

| Disposition | n | Basis |
| --- | --- | --- |
| Class 1 — Verbatim vendor fact on cited page | 54 | 44 confirmed mechanically by `check-claims`; 1 confirmed by manual page read (`integration-003` "over 85%", documented on the cited `tool-search-tool` page as "over 85 percent"); and 9 confirmed on `www.anthropic.com` engineering posts (`eval-010` 100% regression pass rate [2], `integration-008` 50–100 token chunk prefix [1], `integration-009` 49% and 67% retrieval failure reductions [2], `integration-022` 200,000-token in-context threshold [2], `solution-design-014` 1,000–2,000 token subagent summary [2]). |
| Class 2 — Scenario parameter / distractor rebuttal / math property | 35 | Figures introduced in stems and echoed in explanations or distractor notes to trace scenario arithmetic (21 via tool, e.g. `300ms`, `80%`/`20%`, `70%`/`150%`, `8,000-token`, `48-hour`, `2-second`, `1.5-second`, `15 minutes`, `8-hour`, `30,000-token`, `4-second`; 13 on `www.anthropic.com` posts, e.g. `5%` offline gain in `eval-007`, `8,000 tokens` in `integration-008`, `25,000 tokens` in `integration-021`, `150,000 tokens` [2] in `integration-022`, `30-second` in `sda-003`, `5-second` [2] in `sda-012`, `300ms` in `stake-001`, `100%` precision/invariance [4] in `stake-015`/`stake-016`). Two more are rhetorical thresholds (`-001` "beyond 10,000 tokens", `stakeholder-004` "truncating to 50 tokens"), and one is a general arithmetic property (`claude-models-016` Base64 4/3 byte expansion / roughly +33% volume). |
| Class 3 — Cross-page vendor fact | 10 | Genuine Anthropic facts used in distractor notes to build authentic trade-offs, none attributed to the question's own `sourceUrl`: Batch API 24-hour turnaround and 50% discount (`eval-006`, `eval-019`, `eval-020`, `governance-012`, `integration-021`), the 200,000-token context window (`governance-004`, `integration-022`), prompt caching 5-minute default / 1-hour max TTL (`solution-design-017`), and Claude Code's 15,000-token subagent description startup warning limit (`developer-productivity-009`, verified on `code.claude.com/docs/en/sub-agents`). |
| Class 4 — Derived, in option text | 1 | `eval-019` option `b` inverts the cache-read mechanism into a "90% discount". Permitted in option text per `CONTRIBUTING.md` because computing the consequence is the item's point. |
| **Total** | **100** | **All 100 checks resolved; 0 open.** |

### Adjudication of tool-flagged items

- `integration-003`: Resolved. The explanation states progressive tool discovery
  reduces context overhead "by over 85%". On the cited `tool-search-tool` page,
  Anthropic explicitly writes: *"Tool search typically reduces this by over 85 percent,
  loading only the 3–5 tools Claude needs for a given request."* The tool flagged
  it solely due to percent sign vs. spelled-out "percent". Verbatim vendor fact (Class 1).
- `developer-productivity-009`: Resolved. Note `b` references a "15,000-token limit
  ... on subagent descriptions at startup". Verified on `code.claude.com/docs/en/sub-agents`:
  *"When the combined descriptions of all your subagents, except the built-in ones,
  exceed 15,000 tokens, Claude Code shows a warning at startup with the total token count"*.
  Cross-page vendor fact used in a distractor note (Class 3).
- `claude-models-016`: Resolved. Note `a` explains Base64 "increases token volume by
  roughly 33%". Standard computer science 4/3 byte expansion (+33.3%) correctly
  rebutting the distractor's claim that Base64 compresses text (Class 2 distractor rebuttal).
- `evaluation-testing-and-optimization-004`: Advisory quote mismatch (`"do not hallucinate"`)
  is a distractor rebuttal example of a negative constraint, not a vendor attribution.
- The 25 figures on `www.anthropic.com` across 13 questions were verified by hand
  against the 4 cited engineering posts (`building-effective-agents`,
  `demystifying-evals-for-ai-agents`, `contextual-retrieval`, and
  `effective-context-engineering-for-ai-agents`), confirming 9 Class 1 vendor facts,
  13 Class 2 scenario parameters, and 3 Class 3 cross-page facts.

This pass did not perform page-level review of the other certification banks,
did not change any manifest domain names or weights, and did not treat source
liveness alone as evidence of claim correctness. The Anthropic vendor profile
was re-confirmed for the cited model, platform, Claude Code, engineering, and
MCP hosts and re-dated accordingly.

## Source audit — 2026-09-17

Scope was limited to the CCAR-P bank. The official Version 1.0 exam guide
(Effective July 2026, Exam code: CCAR-P) was re-read first; its version, date,
domains, weights (17%, 13%, 19%, 16%, 14%, 14%, 7%), item count (63),
duration (120 minutes), and question format still match `manifest.json`, so no
blueprint revision was needed.

Repo-wide triage via `check-sources` verified 248 source URLs across all banks:
0 stale and 0 network failures (11 documented redirects on AWS documentation and
unversioned MCP docs in other banks). For CCAR-P specifically, all 60 normalized
source pages (64 citation URLs, including anchored variants) were re-read
independently. Every page returned HTTP 200, no cited URL moved through a
redirect, and no citation was stale. All 126 questions received an explicit
**bump** disposition and their `sourceCheckedAt` values were advanced to
`2026-09-17`. No question required re-citation, rewriting, or retirement.

### Figure adjudication for this pass

`check-claims` returned 100 figure checks across CCAR-P's 34 figure-bearing
questions: 45 present on the cited page (including `integration-003` "over 85%",
which matches the page text "over 85 percent" following the matcher's spelled-out
percent enhancement), 30 absent, and 25 on `www.anthropic.com` which the
automated tool cannot read (`inconclusive: out-of-scope host`). All 100 checks
were fully adjudicated and verified against the cited pages and official
documentation, classified by the repository's four numeric classes:

| Disposition | n | Basis |
| --- | --- | --- |
| Class 1 — Verbatim vendor fact on cited page | 54 | 45 confirmed mechanically by `check-claims` on cited `.md` pages; and 9 confirmed on `www.anthropic.com` engineering posts (`eval-010` 100% regression pass rate [2], `integration-008` 50–100 token chunk prefix [1], `integration-009` 49% and 67% retrieval failure reductions [2], `integration-022` 200,000-token in-context threshold [2], `solution-design-014` 1,000–2,000 token subagent summary [2]). |
| Class 2 — Scenario parameter / distractor rebuttal / math property | 35 | Figures introduced in stems and echoed in explanations or distractor notes to trace scenario arithmetic (22 absent figures in stems/distractor rebuttals such as `300ms`, `80%`/`20%`, `70%`/`150%`, `8,000-token`, `48-hour`, `2-second`, `1.5-second`, `15 minutes`, `8-hour`, `30,000-token`, `4-second`, `10,000 tokens`, `50 tokens`, `33%` Base64 expansion; 13 confirmed on `www.anthropic.com` engineering posts: `eval-007` [1], `integration-008` [1], `integration-021` [1], `integration-022` [2], `solution-design-003` [1], `solution-design-012` [2], `stakeholder-001` [1], `stakeholder-015` [2], `stakeholder-016` [2]). |
| Class 3 — Cross-page vendor fact | 10 | Genuine Anthropic facts used in distractor notes to build authentic trade-offs, none attributed to the question's own `sourceUrl`: 7 absent figures in distractor rebuttals (Batch API 24-hr turnaround [`eval-006`, `governance-012`], Batch API 50% discount [`eval-019`], 200,000-token context window [`governance-004`], prompt caching 5-minute / 1-hour TTLs [`solution-design-017`], Claude Code 15,000-token subagent description warning limit [`developer-productivity-009`]); 3 confirmed on `www.anthropic.com` engineering posts (Batch API 50% discount [`eval-020`, `integration-021`], 200,000-token context window [`integration-022`]). |
| Class 4 — Derived, in option text | 1 | `eval-019` option `b` inverts the cache-read mechanism into a "90% discount". Permitted in option text per `CONTRIBUTING.md` because computing the consequence is the item's point. |
| **Total** | **100** | **All 100 checks resolved; 0 open.** |

### Adjudication of tool-flagged items

- `evaluation-testing-and-optimization-004`: Advisory quote mismatch (`"do not hallucinate"`)
  is a distractor rebuttal example in note `d` of a negative constraint, not a
  vendor attribution.
- The 25 figures on `www.anthropic.com` across 13 questions were verified by hand
  against the 4 cited engineering posts (`building-effective-agents`,
  `demystifying-evals-for-ai-agents`, `contextual-retrieval`, and
  `effective-context-engineering-for-ai-agents`), confirming 9 Class 1 vendor facts,
  13 Class 2 scenario parameters, and 3 Class 3 cross-page facts.

This pass did not perform page-level review of the other certification banks
(`ccdv-f`, `ccar-f`, `az-900`, `aws-clf-c02`), did not change any manifest domain
names or weights, and did not treat source liveness alone as evidence of claim
correctness. The Anthropic vendor profile in `certs/VENDORS.md` was re-confirmed
for the cited model, platform, Claude Code, engineering, and MCP hosts and
re-dated accordingly.
