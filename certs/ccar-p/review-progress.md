# Claude Certified Architect – Professional review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-12 based on the Claude Certified Architect –
Professional Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-P). The last
bank-wide source drift audit was September 17, 2026; architectural judgement
renovation and independent correctness evaluation completed September 25, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-13 following coverage audit and human confirmation.
The bank contains 126 questions (all 126 `status: "reviewed"`, 0 `status: "draft"`),
achieving exactly 2× the 63-question exam baseline proportionally distributed across all 7 domains
according to blueprint weights with zero delta (21 / 16 / 24 / 20 / 18 / 18 / 9).
All 126 questions have undergone adversarial correctness evaluation (`evaluate-questions`)
and the earlier difficulty calibration (`harden-domain-questions`). The
2026-09-25 renovation supersedes that calibration where noted below; all
126 items were independently evaluated after authoring. All repository bias
guards pass cleanly. Coverage status remains `stable`; it is not a measured
claim of live-exam difficulty equivalence.

## Recon verdict: `GO-WITH-CONSTRAINTS`

The certification assessment approved a **GO-WITH-CONSTRAINTS** verdict:

- The official exam guide is publicly accessible without credentials or registration.
- Domain weights are explicitly defined integers that sum to exactly 100%.
- Public, authoritative vendor documentation covers the technical competencies across all domains.
- Question format is standard single- and multiple-response, requiring no schema extensions.

**Named constraints:**

1. **Thin official sample question inventory**: The vendor exam guide provides only 3 illustrative sample questions in Section 8. Cognitive level calibration relies additionally on third-party practice material under the calibration firewall.
2. **Domain 6 documentation anchoring**: Domain 6 (Stakeholder Communication & Lifecycle Management, 14%) covers discovery, architectural tradeoff communication, SLAs, and lifecycle phases. Authors must strictly anchor questions in Anthropic's public architectural guidance (e.g. "Building effective agents", deployment patterns, Enterprise/ZDR agreements) rather than unanchored enterprise consulting trivia.

## Blueprint and weights

The guide publishes exact domain weights in Section 6:

| Domain                                           | Slug                                                 |   Weight | Target (63) | Bank Questions (2×) |
| ------------------------------------------------ | ---------------------------------------------------- | -------: | ----------: | ------------------: |
| Solution Design & Architecture                   | `solution-design-and-architecture`                   |      17% |          11 |                  21 |
| Claude Models, Prompting & Context Engineering   | `claude-models-prompting-and-context-engineering`    |      13% |           8 |                  16 |
| Integration                                      | `integration`                                        |      19% |          12 |                  24 |
| Evaluation, Testing & Optimization               | `evaluation-testing-and-optimization`                |      16% |          10 |                  20 |
| Governance, Safety & Risk Management             | `governance-safety-and-risk-management`              |      14% |           9 |                  18 |
| Stakeholder Communication & Lifecycle Management | `stakeholder-communication-and-lifecycle-management` |      14% |           9 |                  18 |
| Developer Productivity & Operational Enablement  | `developer-productivity-and-operational-enablement`  |       7% |           4 |                   9 |
| **Total**                                        |                                                      | **100%** |      **63** |             **126** |

Exam specs from blueprint:

- Total items: 63 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Scenario-based multiple-choice (single-select) and multiple-response (multi-select, select-TWO)

## Composition and coverage audit before renovation

Historical baseline before the 2026-09-25 renovation; current figures are
recorded in that pass below:

- **Item formats**: 110 single-select, 16 multi-select (all select-TWO).
- **Difficulty breakdown**: 86 medium, 40 hard, 0 easy.
- **Sourcing**: 60 distinct authoritative documentation pages across 5 hosts (`platform.claude.com`, `code.claude.com`, `anthropic.com/engineering`, `modelcontextprotocol.io`, and the S3 CDN blueprint).
- **Single-select position distribution**: 29 A / 30 B / 26 C / 25 D across `a`–`d` (max 27.3%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is +0.70 characters (median +0.50 characters).
- **Longest option as key share**: 27 of 110 single-select items (24.5%), well below the 45% ceiling.
- **Heuristic baselines**: "Always longest" yields 26.4% expected score; "Eliminate absolutes" yields 28.9% expected score (uniquely solving 0 of 110 items).
- **Distractor notes coverage**: 100% of distractor options across all 126 questions carry complete explanations in `distractorNotes`.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

## Known coverage limits and deliberate boundaries

- **Deprecated MCP surface**: MCP revision `2026-07-28` (SEP-2577) classified Roots, Sampling, Logging, and Dynamic Client Registration as Deprecated; HTTP+SSE transport has been deprecated since revision `2025-03-26`. The bank tests the two current transports (stdio, Streamable HTTP) and non-deprecated primitives. Two items (`integration-011`, `023`) test Roots and Sampling because both remain in the specification until at least 2027-07-28; each explicitly notes the deprecation and migration path.
- **Deliberate perimeters and out-of-scope boundaries**:
  - _Domain 1 (Solution Design & Architecture)_: Focuses on canonical Anthropic workflows (prompt chaining, routing, parallel sectioning, orchestrator-workers, evaluator-optimizer), coordinator/subagent context isolation, and ACI tool consolidation. Excludes third-party multi-agent frameworks (LangGraph, AutoGen, CrewAI), multi-modal voice/audio real-time WebRTC agents, and Desktop/OS coordinate-level screen automation loops.
  - _Domain 2 (Claude Models, Prompting & Context Engineering)_: Focuses on prompt caching prefix ordering/breakpoints, extended thinking reasoning budgets, XML framing, structured tool outputs, and long-context ordering. Excludes vision tile token calculation formulas, custom model distillation, and self-service fine-tuning.
  - _Domain 3 (Integration)_: Focuses on MCP primitives (Resources, Tools, Prompts), stdio and Streamable HTTP transports, Messages API tool execution mechanics, Contextual Retrieval, context editing, and programmatic tool calling. Excludes WebSocket MCP transports and cloud-provider IAM wrapper policies (Bedrock / Vertex AI IAM).
  - _Domain 4 (Evaluation, Testing & Optimization)_: Focuses on multi-grader suites (code assertions + LLM judges), `pass^k` consistency gates, CI regression vs capability suite separation, transcript-versus-outcome grading, staged evaluation (automated evals in CI, A/B testing, production monitoring), and isolated LLM judges. Excludes statistical sample-size power formulas, named third-party eval frameworks (Ragas, TruLens, DeepEval), and automated prompt search algorithms (DSPy).
  - _Domain 5 (Governance, Safety & Risk Management)_: Focuses on Zero Data Retention (ZDR), indirect prompt injection defense, Claude Enterprise Inference Hooks, Agent SDK permissions and callbacks, regional data residency (`inference_geo`), CMEK KMS key revocation (1-hour cache TTL), Compliance API eDiscovery scopes, GDPR Article 17, and SCIM immutability. Excludes HIPAA BAA contract text, FedRAMP High packages, and SIEM query language syntax (Splunk SPL).
  - _Domain 6 (Stakeholder Communication & Lifecycle Management)_: Focuses on the simplicity principle during discovery, SLA metrics (TTFT via streaming), cost-per-task economics, HTTP 429 vs 529 root causes with jittered backoff, CLAUDE.md repository onboarding, Workspaces governance, and production feedback eval flywheels. Excludes generic corporate finance metrics (NPV, IRR) and formal change management frameworks (ADKAR, Kotter).
  - _Domain 7 (Developer Productivity & Operational Enablement)_: Focuses on Claude Code repository conventions (CLAUDE.md, `.claude/rules/`, `.claude/skills/`, `.claude/agents/`), PreToolUse hooks, MDM managed settings, git worktrees, `/compact` recovery, and stdio JSON-RPC framing corruption. Excludes IDE keyboard shortcuts and third-party CI/CD pipeline configuration syntax beyond CLI invocation flags.

## Source classification

Evaluated against the repository's two non-negotiable tests (Gate and Authority):

| Candidate Source                                                                | Gate | Authority | Disposition       | Notes                                                                                                                 |
| ------------------------------------------------------------------------------- | ---- | --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Official Exam Guide PDF (`everpath-course-content.s3-accelerate.amazonaws.com`) | Pass | Pass      | **Citable**       | Canonical vendor blueprint hosted on Anthropic's Everpath S3 CDN path.                                                |
| Claude Platform documentation (`platform.claude.com/docs/en/...`)               | Pass | Pass      | **Citable**       | Primary vendor reference for Messages API, tool use, prompt caching, batch processing, data retention. Bare URL form. |
| Claude Code documentation (`code.claude.com/docs/en/...`)                       | Pass | Pass      | **Citable**       | Vendor reference for Claude Code CLI, memory hierarchy, hooks, subagents, and tools. Bare URL form.                   |
| Anthropic Engineering Research & Posts (`anthropic.com/engineering/...`)        | Pass | Pass      | **Citable**       | Authoritative vendor engineering publications on agentic workflows, multi-agent systems, and architecture.            |
| Model Context Protocol Specification (`modelcontextprotocol.io`)                | Pass | Pass      | **Citable**       | Official MCP open standard specification published by Anthropic.                                                      |
| Anthropic Partner Academy courses (`anthropic-partners.skilljar.com`)           | Fail | Pass      | **Excluded**      | Gated behind partner/user login. The test is registration, not price.                                                 |
| Course landing pages / marketing syllabi                                        | Pass | Pass      | **Readable only** | Evidence of curriculum scope only; never cite for technical facts.                                                    |
| Legacy documentation (`docs.anthropic.com`)                                     | Pass | Fail      | **Excluded**      | Legacy redirects and restructured paths that no longer establish specific claims.                                     |
| Third-party dumps, GitHub mirrors, unofficial guides                            | Pass | Fail      | **Excluded**      | Unofficial third-party mirrors fail authority test.                                                                   |

## Official sample question inventory

Section 8 of the CCAR-P exam guide provides 3 illustrative sample questions:

1. **Sample 1 · Domain 3 (Integration)**: Customer-support agent has excessive tools (refund, delete account). Applying least-privilege principles: remove refund and delete tools from agent configuration entirely. Key: B.
2. **Sample 2 · Domain 2 (Claude Models, Prompting & Context Engineering)**: Static 8,000-token system prompt and policy document sent on every request with dynamic user messages: place static prompt before dynamic content and enable prompt caching. Key: C.
3. **Sample 3 · Domain 4 (Evaluation, Testing & Optimization)**: RAG system returns confident but incorrect answers after document refresh: retrieval/indexing step is returning irrelevant or stale chunks. Key: B.

## Calibration principles and distractor hardening

Cognitive depth is anchored to Anchor 2: discriminating conceptually on failure modes, orchestration boundaries, lifecycle hooks, state persistence, and architectural tradeoffs. Matthew Purcell's 63-question practice exam was used under the calibration firewall (informing depth and scenario shape, never question content).

The earlier systematic pass hardened soft distractors across all 7 domains
(67 hardened, 59 calibrated-no-change). This is a historical record, not the
current renovation disposition:

| Domain                                           |   Total | Hardened | Calibrated | Hardening Focus                                                                                                                                                               |
| ------------------------------------------------ | ------: | -------: | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solution Design & Architecture                   |      21 |        7 |         14 | Replaced length tells and strawmen with parallel voting consensus, compensating prompt traps, and spot-instance checkpointing gotchas.                                        |
| Claude Models, Prompting & Context Engineering   |      16 |        0 |         16 | Cleared Stage 0 untouched; already substantially above anchor (extended thinking token budgets, 5-minute TTL eviction, SKILL.md modularization).                              |
| Integration                                      |      24 |        7 |         17 | Replaced unindexed regex and raw TCP socket claims with mTLS DNS rebinding gotchas, in-context caching vs hierarchical RAG, and MCP sampling governance.                      |
| Evaluation, Testing & Optimization               |      20 |       15 |          5 | Replaced arbitrary retry loops and facepalms with `pass^k` consistency gates, OpenTelemetry distributed spans, and transcript-vs-outcome decoupling.                          |
| Governance, Safety & Risk Management             |      18 |       12 |          6 | Replaced crude bash tools and consumer terms with Agent SDK permission evaluation order, CMEK KMS key revocation, CASB forward proxies, and workspace trust in CI.            |
| Stakeholder Communication & Lifecycle Management |      18 |       17 |          1 | Replaced consulting strawmen with simplicity principle trade-offs, sub-second TTFT streaming, Workspaces spend limits, HTTP 429 vs 529 backoff, and golden eval flywheels.    |
| Developer Productivity & Operational Enablement  |       9 |        9 |          0 | Replaced claims of Claude Code file-reading inability with MDM `managed-settings.json`, `--bare` CI invocation, git worktrees, `/compact` focus, and stdio framing deadlocks. |
| **Total**                                        | **126** |   **67** |     **59** | **All 126 items meet or exceed sample cognitive depth; all bias guards pass.**                                                                                                |

## Historical architectural and sourcing adjudications

These decisions describe the pre-renovation bank. The 2026-09-25 renovation
below supersedes them where noted; model lineups, numeric limits, and original
item scenarios here are not current API guidance.

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
- **State persistence across host preemptions**: `sda-017` re-cited to `code.claude.com/docs/en/agent-sdk/sessions` § Resume across hosts, requiring custom session-store adapters for ephemeral/serverless environments.
- **Batches API deduplication**: Consolidated four overlapping Batches items into distinct competencies: `sda-008` (asynchronous workload choice), `eval-001` (terminal states: `succeeded`, `errored`, `canceled`, `expired`), `stake-010` (turnaround commitments for a 500,000-request workload split across batches), and `sda-020` (paired with fast models). The prior wording conflated that workload size with chunk size and called the expiration window an SLA; both are corrected in the 2026-09-25 pass.
- **Latency levers**: `eval-006` tests model tiering (Haiku 4.5) and prompt/output trimming; `eval-016` grounded on SSE streaming for perceived responsiveness.
- **Formatting normalizations**: 29 citations carrying `.md` extensions normalized to bare URLs; all 16 multi-select suffixes unified to `(Select TWO.)`.
- **Claim-checking findings resolved**:
  - `ccar-f-claude-code-003`: Re-grounded on `@path/to/import` with 4-hop recursion limit.
  - `ccar-p-stakeholder-018`: Updated page title quote to "Define success criteria and build evaluations".
  - `ccar-p-stakeholder-003`: Grounded on verbatim table quote "Compare on cost per completed task, not per token."
  - `ccar-p-claude-models-002`: Updated `output_config.effort` object notation.

## Figure-bearing claims adjudication and numeric precedent

Following reviews of figures and percentages across the bank, the repository established four numeric classes:

1. **Class 1 — Verbatim Vendor Facts** (`25% write premium`, `5-minute TTL`, `200,000 tokens`): Must match the cited page in substance, and quoted strings must match verbatim.
2. **Class 2 — Scenario Parameters** (`70% routine traffic`, `300,000 requests`): Permitted freely in stems, explanations, and notes to trace logic; must not be framed as vendor guidance.
3. **Class 3 — Cross-Page Distractor Facts** (`Batch API 50% discount`, `24-hour expiration`): Permitted in distractors to build authentic trade-offs; must not be falsely attributed to the cited page.
4. **Class 4 — Derived Figures and Mechanism Conversions** (`0.1x` ↔ `10% of base price`): Direct identity representations of stated mechanisms (`10% of base price`) are preferred over derived marketing figures (`90% discount`). Conflating derived rates with empirical benchmark ranges ("up to 90%") or asserting empirical ceilings as feature specifications is an authoring defect.

### Adjudications and baseline defect rate (2026-09-13)

- **Evaluated**: 29 figure-bearing questions across precedent and baseline passes (34 total items in bank).
- **Confirmed without change**: 24 items.
- **Defects rewritten (5 items)**:
  - `eval-019`: Restated from "90% discount" to `0.1x` / 10% of base input price.
  - `stake-003`: Note `opt-c` removed spurious "up to 90% read discount" hybrid.
  - `integration-021`: Fixed attribution converting empirical end-to-end task savings ("costs by up to 90%") to unit token pricing.
  - `integration-022`: Restated empirical ceiling ("up to 90%") to specify prefix billing at cache-read rate.
  - `stake-011`: Incidental rewrite replacing "90% discount" with cache-read rate in distractor `opt-d`.
- **Bank defect rate**: 5 / 29 = **17.2%** (or 4 / 29 = **13.8%** excluding incidental `stake-011`).

## Maintenance audits

### Recurring source drift audit (2026-09-17)

Comprehensive drift audit executed across all 126 questions and 60 source pages (64 citation URLs) following `audit-sources`:

- **Blueprint drift**: 0% drift. Exam guide v1.0 (July 2026, CCAR-P) re-verified on CDN. All 7 domain names, weights (17/13/19/16/14/14/7), 63 items, 120 minutes match `manifest.json` exactly.
- **Source liveness**: 0 failed URLs, 0 redirects across all 60 pages (100% HTTP 200).
- **Figure claims resolution (100 checks across 34 items)**:
  - 54 Class 1 verbatim facts confirmed (45 mechanically, 9 on `anthropic.com/engineering` posts).
  - 35 Class 2 scenario parameters / distractor rebuttals confirmed.
  - 10 Class 3 cross-page vendor facts confirmed.
  - 1 Class 4 derived option text confirmed (`eval-019` option `b`).
  - Specific tool-flagged findings resolved: `integration-003` ("over 85%" vs "over 85 percent" vendor fact confirmed), `developer-productivity-009` (15,000-token limit cross-page fact confirmed), `claude-models-016` (Base64 +33% math property confirmed), `eval-004` ("do not hallucinate" distractor rebuttal confirmed), and 25 figures verified on engineering posts (`building-effective-agents`, `demystifying-evals-for-ai-agents`, `contextual-retrieval`, `effective-context-engineering-for-ai-agents`).
- **Dispositions**: All 126 questions received an explicit **bump** disposition; `sourceCheckedAt` advanced to `2026-09-17`. 0 re-cite, 0 rewrite, 0 retire.
- **True defect rate**: 0 / 126 = **0.0%**.

### Architectural judgement renovation (2026-09-25)

**Reason for reopening the bank.** The CCAR-F renovation on this branch
demonstrated a failure mode that the earlier CCAR-P hardening pass did not
measure: an item can exceed the sample questions' difficulty, pass every bias
guard, and still give away its answer by naming the preferred architecture or
offering three implausible alternatives. Bank-wide triage found the same
pattern here, including in Domain 2, whose prior hardening disposition was
16 calibrated-no-change. Those historical dispositions are not evidence that
the current bank needs no further work.

**Target and scope.** Preserve the seven-domain, 126-item blueprint allocation
and existing single/select-two answer shapes. Replace recognition-only or
predetermined recommendations with a scenario, a goal, and explicit deciding
constraints. Alternatives should be real approaches that fail a particular
constraint, not fabricated capabilities, guaranteed performance, or obviously
reckless operational choices. Sound items may remain unchanged. Correctness
defects take priority over difficulty; harder must mean neither ambiguous nor
deeper than the blueprint.

**Anchor and limits.** The official CCAR-P guide v1.0 (July 2026) was fetched
from `manifest.examUrl` on 2026-09-25. Section 6's objectives and Sections 3–4's
experienced-architect profile support conceptual trade-off decisions. Section
8 supplies only three illustrative samples. CCAR-F's renovation informs the
decision structure, not CCAR-P facts or a claim of measured equivalence with
the live Professional exam. No confidential exam questions or third-party
question content informed these rewrites, and official sample wording must
not be copied. CCAR-F's guide-versus-current-docs adjudications are not
automatically applicable to CCAR-P.

**Method.** Each domain is authored in a separate agent context using
`author-questions`, with public official sources read before changes. A
different domain's author then applies `evaluate-questions`: derives the key
from stem, options and source before inspecting the stored key and rationale,
checks the entire answer set for multi-selects, and verifies explanatory
claims. Changed questions remain `draft` until that evaluation confirms them.
Per-question dispositions and the final composition below are the completion
record; this rationale alone is not a correctness certification.

#### Authoring dispositions

`Rewrite` changes a stem or its decision alternatives; `repair` fixes a
bounded claim or distractor while retaining the question's decision;
`replace` supplies a different scenario or discrimination within the domain
objective. `Keep` means content unchanged, not exempt from independent review.

| Domain | Items | Rewrite | Repair | Replace | Keep |
| --- | ---: | ---: | ---: | ---: | ---: |
| Solution Design & Architecture | 21 | 20 | 0 | 0 | 1 |
| Models, Prompting & Context | 16 | 16 | 0 | 0 | 0 |
| Integration | 24 | 17 | 5 | 1 | 1 |
| Evaluation, Testing & Optimization | 20 | 11 | 2 | 1 | 6 |
| Governance, Safety & Risk | 18 | 15 | 3 | 0 | 0 |
| Stakeholder & Lifecycle | 18 | 14 | 3 | 1 | 0 |
| Developer Enablement | 9 | 9 | 0 | 0 | 0 |
| **Total** | **126** | **102** | **13** | **3** | **8** |

The eight items retained by the authoring pass were Architecture `-017`, Integration `-016`, and
Evaluation `-002`, `-003`, `-007`, `-010`, `-012`, `-014`. Their prior
`sourceCheckedAt` dates remain unchanged despite review-time source reads.
Independent evaluation subsequently repaired some of their explanations or
options, as recorded below; authoring `keep` does not mean final text unchanged.
The 118 authored items cite sources actually read on 2026-09-25. Only
Architecture `-008` changes correct-option position (`d` to `a`), to correct
the deadline contradiction; preserving an option ID on other rewrites does
not imply its text or claim is unchanged.

#### Superseding correctness and sourcing decisions

- **Deadlines are not mechanism guarantees.** Architecture `-008` keeps its
  eight-hour deadline and selects a capacity-tested standard path rather than
  claiming a batch will finish in time. Architecture `-019`/`-020` and
  Stakeholder `-004` distinguish first-token responsiveness from a complete
  answer. Measured latency in a scenario is not a vendor performance promise.
  Stakeholder `-010` distinguishes batch expiration, terminal processing and
  successful per-request results. The current batch limit is 100,000 requests
  or 256 MB, not the processing-queue tier's 500,000 requests.
- **Do not hide missing evidence.** Evaluation `-001` separates quality of
  generated answers from operational completion and keeps missing requests
  visible in the release gate. Architecture `-013` preserves minority
  vulnerability candidates for triage while reserving disruptive blockers for
  corroborated findings; consensus does not maximize recall and precision
  simultaneously.
- **Caching and context are different boundaries.** Integration `-024` now
  places the stable-prefix breakpoint after the system policy: tools precede
  system content, so a final-tool marker cannot cache that later policy.
  Integration `-021` distinguishes corpus size from repeated per-chunk input
  and checks cache availability before concurrent reuse. Full-context
  retrieval in `-022` is justified by scenario measurements, not universal
  superiority over RAG. Evaluation `-019` now tests cache-duration selection,
  not a universal read-price multiplier; current pricing has model-specific
  exceptions.
- **Structured output is not factual correctness.** Prompting `-008` combines
  reasoning with response-schema enforcement rather than promising strict
  JSON from thinking isolation alone. Prompting `-010` and Evaluation `-011`
  treat token counts as estimates and allow headroom. Prompting `-015` tests
  source pointers, not cryptographic integrity or truth of every
  interpretation. Prompting `-016` pairs on-demand procedures with ambient
  invariants; moving all instructions into Skills would lose the latter.
- **Execution boundaries must be explicit.** Integration `-006` controls
  concurrency, not prerequisite ordering. Its application already enforces
  prerequisites. Integration `-015` does not claim client tools execute inside
  the remote code container. Messages API `is_error` and MCP `isError` remain
  distinct. Integration `-002` replaces its sample-adjacent support scenario
  with an original artifact-inventory decision and cites SDK permission
  semantics rather than attributing unsupported least-privilege wording to
  the engineering article.
- **Governance claims have product and policy scope.** Governance `-001`
  distinguishes a ZDR arrangement from HIPAA readiness and feature/legal
  exceptions; `-003` concerns Enterprise inline hooks, not arbitrary Platform
  API traffic. `-005` requires an actual operator callback decision under
  trusted ask rules. `-010` explicitly says historical telemetry did not
  capture content, because configured telemetry can do so. `-011` preserves
  unrelated chats by detaching them before retiring a project rather than
  demanding indiscriminate deletion.
- **CMEK's conflicting documentation is not silently adjudicated.**
  Governance `-007` tests prospective covered-data scope, exclusions and the
  up-to-one-hour revocation delay. The current page's opening destruction
  warning and its Limitations wording on permanent disabling do not align;
  the item promises neither reversibility nor that disabling destroys key
  material. Do not broaden it to all historical workspace data.
- **Spend controls are not interchangeable.** Governance `-013` concerns
  Enterprise member limits, not Platform workspace caps. Stakeholder `-012`
  distinguishes a usage-tier spend-cap 429 without `retry-after` from
  transient throughput limiting; retries alone cannot restore a spent
  allowance. Stakeholder `-017` now tests monthly versus throughput limits
  within the organization ceiling. Governance `-018` keeps directory and
  audit access separate from user-content access using verified scope
  semantics rather than inferred scope names.
- **Configuration is not a universal sandbox.** Developer `-001` tests a
  pre-execution approval-record check, `-002` configuration-discovery control
  in an already isolated runner, and `-003` managed permission policy rather
  than OS-wide confidentiality. `-004`/`-006` separate conversation context
  from filesystem isolation. `-007` uses reversible safe-mode diagnostics;
  `-008` distinguishes explicit-only invocation from subagent execution.
  `-009` tests MCP framing against observed stdout pollution, not a guaranteed
  client timeout response.

Source families re-read for the authored changes include Anthropic's
**Building effective agents**, **Effective context engineering**,
**Writing tools for agents**, **Contextual Retrieval**, and **Demystifying
evals** engineering articles; current Platform API, prompting, caching,
evaluation and enterprise-management pages; Claude Code configuration,
permissions, hooks, Skills, subagents and session guidance; and pinned MCP
specification pages. Each item's `sourceUrl` and section-level `sourceNote`
identify its own authority. Cross-page facts must retain their actual
attribution rather than being presented as facts from the primary citation.
MCP's standing historical/maintenance boundaries remain intentional.

#### Per-question authoring and independent evaluation

IDs below use each heading's full domain slug with the prefix `ccar-p-` and
the listed numeric suffix. **R** = rewrite, **P** = repair, **X** = replace,
**K** = keep in the authoring pass. **C** = independently confirmed,
**F** = fixed-and-confirmed by the independent evaluator. An F is a narrow
evaluation repair, not another unreviewed wholesale rewrite.

##### solution-design-and-architecture

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Fixed workflow with application-enforced validation before posting. |
| 002 | R | C | Evaluated routing versus cascades, voting and a unified model. |
| 003 | R | C | Parallel dimensional coverage within measured time and call budgets. |
| 004 | R | C | Dynamic decomposition with specialist concurrency and central reconciliation. |
| 005 | R | C | Feedback-driven bounded revision preserving approved wording. |
| 006 | R | C | Actual execution outcomes rather than intent-only tool feedback. |
| 007 | R | C | Exclude raw worker output from coordinator context, not merely cache it. |
| 008 | R | C | Eight-hour deadline requires a demonstrated path; batch key corrected d→a. |
| 009 | R | C | Keep a validated sufficient retrieval baseline under unchanged scope. |
| 010 | R | C | Descriptive contracts plus actionable execution feedback, not generic mediation. |
| 011 | R | C | Whole-run stopping conditions plus explicit approval-and-continue. |
| 012 | R | C | Route mixed input to the required parallel analyses without overdispatch. |
| 013 | R | C | Preserve minority candidates; corroborate disruptive blockers separately. |
| 014 | R | C | Select controlled information flow without a predetermined topology preference. |
| 015 | R | C | Target-environment parser/execution evidence versus model agreement. |
| 016 | R | C | Dependency-sensitive decomposition and shared-contract ownership, not a mandated DAG. |
| 017 | K | F | Durable sessions/checkpoints; repaired matching-cwd and unpersisted-work caveats, removed same-backend mandate. |
| 018 | R | C | Consolidate dependent profile lookups without broadening authorization. |
| 019 | R | C | Address measured prefill and UI buffering without promising a numeric deadline. |
| 020 | R | C | Validate interactive completion; reconcile incomplete asynchronous work. |
| 021 | R | C | Fresh scoped workers and evidence-bearing summaries versus inherited/raw context. |

##### claude-models-prompting-and-context-engineering

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Write a reusable stable prefix before changing request content. |
| 002 | R | C | Per-class manual thinking budgets under measured quality and latency needs. |
| 003 | R | C | Route by demonstrated task/model fit, not assumed tier performance. |
| 004 | R | C | Delimit content roles; schema enforcement solves a different problem. |
| 005 | R | C | Positive task scope with referral criteria, not guaranteed refusal suppression. |
| 006 | R | C | Representative boundary contrasts within a limited example budget. |
| 007 | R | F | Direct response-schema migration; exclude documented string enum/const capitalization exception. |
| 008 | R | F | One-call thinking plus schema enforcement; same enum/const scope correction. |
| 009 | R | C | Preserve cross-referenced originals with document-first ordering and quotation grounding. |
| 010 | R | C | Model-specific full-input estimates plus admission headroom. |
| 011 | R | C | Longer cache lifetime under sparse traffic and an accepted write-price tradeoff. |
| 012 | R | C | Shared static prefix and incremental conversation reuse have distinct goals. |
| 013 | R | F | Response schema with application-owned writes; exclude enum/const case guarantees. |
| 014 | R | C | Compaction plus durable incident state versus payload clearing alone. |
| 015 | R | C | Native source pointers, not tamper evidence or interpretation correctness. |
| 016 | R | C | On-demand procedures alongside concise always-loaded invariants. |

##### integration

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Application-attached reference context versus model-requested operations. |
| 002 | X | C | Original artifact-inventory scenario; remove definitions rather than preapprove or reject later. |
| 003 | R | C | Progressive discovery preserves cross-service reach without loading the full catalog. |
| 004 | R | C | Missing Origin validation is distinct from authentication and loopback binding. |
| 005 | R | F | Forced specific operation plus field/type enforcement; narrowed schema and completion exceptions. |
| 006 | P | C | At-most-one proposed call while preserving text; application still enforces prerequisites. |
| 007 | R | C | Matching failed tool result versus empty successful data or API transport failure. |
| 008 | R | C | Chunk-specific context before indexing, not expansion after a missed retrieval. |
| 009 | P | C | Mixed semantic/identifier retrieval under fixed context and allowed ranking latency. |
| 010 | R | C | Client-owned socket-free process versus independent network service lifecycle. |
| 011 | R | C | Explicit historical Roots advisory scope and Sampling client mediation. |
| 012 | P | F | Complete matching results before text; narrowed to client tools with no pending server-tool call. |
| 013 | R | C | Deferred references preserve the stable prefix while full definitions remain in the request catalog. |
| 014 | R | C | Clear old result payloads while retaining calls, arguments and recent evidence. |
| 015 | R | C | Variable code orchestration without intermediate model-context expansion. |
| 016 | K | F | Corrected per-parameter buffering and replaced fabricated streaming limits with real parser mistakes. |
| 017 | R | C | Integration choice follows required loop and infrastructure ownership. |
| 018 | R | C | Distinct user, application and model initiation points, with host mediation intact. |
| 019 | R | C | Resource-content notification versus catalog change; re-read for fresh content. |
| 020 | P | C | Contract-defined execution failure versus malformed protocol or lost transport. |
| 021 | R | C | Stable-prefix write and first-response availability before sibling cache reuse. |
| 022 | R | C | Validated full-context baseline within headroom and operating constraints. |
| 023 | R | C | Transitional Sampling prompt review and host-owned model/spend controls. |
| 024 | P | C | End-of-system static prefix plus incremental history; later policy is not in a tool breakpoint. |

##### evaluation-testing-and-optimization

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Separate generated-answer quality and missing-request completion evidence. |
| 002 | K | F | Mixed graders; narrowed reproducibility and lexical-metric claims. |
| 003 | K | F | All-trial consistency; removed future-reliability guarantee and temperature strawman. |
| 004 | R | C | Verify claim support rather than mere citation existence or agreement. |
| 005 | R | C | Calibrate rubric against expert labels while preserving necessary detail. |
| 006 | R | C | Task-validated faster model and concise complete responses, not truncation. |
| 007 | K | F | CI, live A/B and monitoring; corrected non-verbatim quotations and evidence overstatement. |
| 008 | R | C | Routing under interactive requirements and demonstrated low cache reuse. |
| 009 | R | C | Correlated spans without payload collection; logs can also correlate when configured. |
| 010 | K | F | Separate regression and capability gates; removed unsupported compute-cost claim. |
| 011 | R | C | Supported structured token-count inputs and headroom, not exact-fit assurance. |
| 012 | K | C | Poisoned-input red-teaming plus ongoing monitoring of layered controls. |
| 013 | R | C | Link retrieved evidence and final outcome per trial; both stages may fail. |
| 014 | K | F | Real final state; replaced style-judging distractor and unsourced failure-frequency claim. |
| 015 | P | F | Isolated dimensional rubrics; averaging does not guarantee variance cancellation. |
| 016 | R | C | Browser-visible incremental output rather than server-side streaming with buffering. |
| 017 | P | C | Held-out and fresh production evidence; paraphrases alone do not prove generalization. |
| 018 | R | C | Evaluate missed risk and unnecessary escalation against explicit queue limits. |
| 019 | X | C | Measured sparse reuse drives cache-duration choice, not price recall. |
| 020 | R | C | Measured per-stage model fit within interactive and serial-call constraints. |

##### governance-safety-and-risk-management

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | ZDR eligibility, overrides and exceptions are distinct from HIPAA readiness. |
| 002 | R | C | Preserve third-party text while separating its instruction authority. |
| 003 | R | C | Full inline enforcement and fail-closed policy versus shadow or partial rollout. |
| 004 | R | C | Traceable evidence and explicit uncertainty, not agreement alone. |
| 005 | R | C | Trusted ask rules plus an operative per-call operator decision. |
| 006 | P | C | Enforced inference-region restrictions versus defaults or storage geography. |
| 007 | R | C | Prospective covered-data encryption and revocation delay; permanence conflict avoided. |
| 008 | R | C | Bounded execution and environmental checkpoints versus unconstrained autonomy. |
| 009 | R | C | Serial pre-screen gating; parseable output is not accurate classification. |
| 010 | R | C | Retained historical content export without deletion authority or prior payload telemetry. |
| 011 | R | C | Authorized erasure while detaching unrelated retained chats before project retirement. |
| 012 | R | C | Replace and explicitly revoke organization keys without interrupting provisioning. |
| 013 | R | C | Temporary Enterprise member override with restoration of inherited policy. |
| 014 | P | C | Explicit headless hook control and informed interactive trust within stated precedence. |
| 015 | R | C | Provider refusal signals versus HTTP failure or independent classifier judgment. |
| 016 | R | C | Screen tool output before consumption, not concurrently or after execution. |
| 017 | R | C | IdP-owned membership versus direct-group or expanded-scope workarounds. |
| 018 | P | C | Metadata/directory/activity reads without content-bearing audit scopes. |

##### stakeholder-communication-and-lifecycle-management

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Selective complexity for measured exceptions while retaining routine SLAs. |
| 002 | R | C | Task-specific multidimensional acceptance criteria rather than convenient proxies. |
| 003 | R | C | Full-workflow cost per successful task, including failed attempts. |
| 004 | P | C | Stakeholder agreement required to change completion SLA to responsiveness criteria. |
| 005 | R | C | Variable bounded subtasks with controlled dispatch, not justify-a-given-design. |
| 006 | R | C | Establish task feasibility before negotiating quality-versus-latency compromises. |
| 007 | R | C | ZDR browser handoff through backend while retaining eligible caching. |
| 008 | R | C | Reviewed repository guidance with ambient loading, not enforced model obedience. |
| 009 | R | C | Workspace partitioning and credential scope across units and environments. |
| 010 | P | C | Batch expiration is not a guaranteed result-delivery commitment. |
| 011 | R | C | Measured effort tradeoffs and a reliable verifier before retry-based savings. |
| 012 | R | C | Usage-tier spend exhaustion versus transient throughput limiting or vendor overload. |
| 013 | R | C | Pilot evidence favors targeted critique over independent voting within agreed timing. |
| 014 | R | C | Revise superseded expectations while retaining still-valid regression evidence. |
| 015 | R | C | Deterministic ledger processing versus unnecessary agent mediation. |
| 016 | P | C | Replay consistency does not establish novel-input semantic reliability. |
| 017 | X | C | Monthly and short-term throughput controls under a shared organization ceiling. |
| 018 | R | C | Expert-triaged negative feedback becomes regression evidence, not automatic truth. |

##### developer-productivity-and-operational-enablement

| Suffix | Author | Evaluation | Decision or adjudication |
| --- | --- | --- | --- |
| 001 | R | C | Dynamic approval-record check before execution, not a static pattern prohibition. |
| 002 | R | C | Bare-mode discovery suppression with explicit trusted inputs in an isolated runner. |
| 003 | R | C | Managed policy precedence, not blanket OS-level file confidentiality. |
| 004 | R | C | Restricted independent audit context versus ordinary skill/rule/fork loading. |
| 005 | R | C | Preserve plan and diff while changing the oversized read that causes thrashing. |
| 006 | R | C | Concurrent filesystem isolation versus context-only separation or serialized stash. |
| 007 | R | C | Reversible disabled-customization baseline retaining authentication and managed policy. |
| 008 | R | C | Developer-only invocation is separate from execution context and tool authorization. |
| 009 | R | C | Protocol-valid stdout versus flushing, serialization or merely valid JSON. |

#### Independent evaluation outcome and current composition

All **126** complete answer sets were independently derived before reading
the stored keys and explanations. The author of a domain did not evaluate
that same domain. **113 confirmed; 13 fixed-and-confirmed; 0 unresolved; 0
post-authoring miskeys.** All items end `reviewed`. The zero miskey count
describes this evaluation of the rewritten bank, not the original bank:
Architecture `-008` had already been corrected during authoring.

The 13 review repairs are Architecture `-017`; Prompting `-007`, `-008`,
`-013`; Integration `-005`, `-012`, `-016`; and Evaluation `-002`, `-003`,
`-007`, `-010`, `-014`, `-015`. These removed residual unsupported guarantees,
quotation/provenance problems, weak alternatives and omitted documented
exceptions. Structured-output items explicitly avoid the current string
enum/const capitalization exception; normal completion alone does not remove
that limitation. No review repair changes the tested objective or key set.
After these repairs **125 items have content changes** relative to the
pre-renovation bank; Evaluation `-012` alone remains unchanged. This differs
from the authoring totals because seven author-kept items needed narrow
evaluation repairs.

Final `npm run metrics -- ccar-p` figures:

- **Coverage and format unchanged:** 126 questions; domain counts
  21 / 16 / 24 / 20 / 18 / 18 / 9, zero delta against the 2× target;
  110 single-select and 16 select-two.
- **Difficulty labels:** 59 medium (55 single, 4 multi), 67 hard
  (55 single, 12 multi). Labels reflect the revised decisions, not measured
  candidate pass rates.
- **Sources:** 59 distinct normalized primary pages; 118 authored items dated
  2026-09-25 and eight retaining their earlier 2026-09-17 source dates.
  Review-only reads and repairs did not masquerade as a citation-age audit.
- **Single-select positions:** 30 A / 30 B / 26 C / 24 D; maximum 27.3%.
- **Option-length bias:** mean key-minus-distractor delta -0.93 characters;
  median -0.33; uniquely longest key 23/110 (20.9%).
- **Heuristic baselines:** always-longest 23.8%; eliminate-absolutes then
  guess 24.7%, uniquely solving 0/110.
- **Distractor notes:** 100% coverage. All three bank bias guards pass.

Every question has an author disposition and independent evaluation above.
The professional blueprint, public-source boundary, item IDs, domain
allocation, answer shapes and option counts are preserved. This establishes
source-grounded, constraint-based practice, not empirical equivalence to an
unseen live exam.

**Regression-test maintenance.** Four claim-scanner tests depended on the
old CCAR-P wording containing particular numbers or quoted passages. Their
historical claim shapes are now fixed test inputs in
`test/check-claims.test.mjs`, preserving range, provenance-field and verbatim
quotation coverage without requiring practice questions to retain obsolete
claims. The scanner implementation is unchanged.
