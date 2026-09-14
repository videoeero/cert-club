# Claude Certified Architect – Professional review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-12 based on the Claude Certified Architect –
Professional Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-P).

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-13 following coverage audit and human confirmation.
The bank contains 126 questions (all 126 `status: "reviewed"`, 0 `status: "draft"`, all `scope: "core"`),
achieving exactly 2× the 63-question exam baseline proportionally distributed across all 7 domains
according to blueprint weights with zero delta. All 126 questions have undergone adversarial correctness
evaluation (`evaluate-questions`) and difficulty calibration (`harden-domain-questions`) against official
sample anchors. All four repository bias guards pass cleanly.

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

| Domain | Slug | Weight | Target (63) | Target (100) | Target (126) | Bank Questions |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Solution Design & Architecture | `solution-design-and-architecture` | 17% | 11 | 17 | 21 | 21 |
| Claude Models, Prompting & Context Engineering | `claude-models-prompting-and-context-engineering` | 13% | 8 | 13 | 16 | 16 |
| Integration | `integration` | 19% | 12 | 19 | 24 | 24 |
| Evaluation, Testing & Optimization | `evaluation-testing-and-optimization` | 16% | 10 | 16 | 20 | 20 |
| Governance, Safety & Risk Management | `governance-safety-and-risk-management` | 14% | 9 | 14 | 18 | 18 |
| Stakeholder Communication & Lifecycle Management | `stakeholder-communication-and-lifecycle-management` | 14% | 9 | 14 | 18 | 18 |
| Developer Productivity & Operational Enablement | `developer-productivity-and-operational-enablement` | 7% | 4 | 7 | 9 | 9 |
| **Total** | | **100%** | **63** | **100** | **126** | **126** |

Exam specs from blueprint:
- Total items: 63 questions
- Duration: 120 minutes
- Passing standard: 720 scaled score (scale 100–1,000)
- Format: Multiple-choice and multiple-response items; each item states how many responses to select

### Skill breakdown

Section 6 lists detailed task objectives under each domain, but does not publish percentage weights below the domain level. Consequently, manifest domain entries do not declare `skills`, matching the pattern in `ccar-f`, `az-900`, and `aws-clf-c02`.

## Composition and coverage audit

Audited against the 126-question bank on 2026-09-13. `npm run validate`, `npm run balance -- ccar-p`, `npm run metrics -- ccar-p --markdown`, and `npm run check` all clean.

Composition is fully proportional across all seven domains at 2× the 63-question live exam target (126 questions), with zero delta across every domain:

| Domain | Slug | Core | Target (2x) | Δ | Share | Weight |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Solution Design & Architecture | `solution-design-and-architecture` | 21 | 21 | 0 | 16.7% | 17% |
| Claude Models, Prompting & Context Engineering | `claude-models-prompting-and-context-engineering` | 16 | 16 | 0 | 12.7% | 13% |
| Integration | `integration` | 24 | 24 | 0 | 19.0% | 19% |
| Evaluation, Testing & Optimization | `evaluation-testing-and-optimization` | 20 | 20 | 0 | 15.9% | 16% |
| Governance, Safety & Risk Management | `governance-safety-and-risk-management` | 18 | 18 | 0 | 14.3% | 14% |
| Stakeholder Communication & Lifecycle Management | `stakeholder-communication-and-lifecycle-management` | 18 | 18 | 0 | 14.3% | 14% |
| Developer Productivity & Operational Enablement | `developer-productivity-and-operational-enablement` | 9 | 9 | 0 | 7.1% | 7% |
| **Total** | | **126** | **126** | **0** | **100%** | **100%** |

### Format mix and pattern review

- **Item formats**: 110 single-select, 16 multi-select (all select-2).
- **Difficulty breakdown**: 86 medium, 40 hard, 0 easy.
- **Sourcing**: 58 distinct authoritative documentation pages across official vendor documentation; 100% `core` scope.
- **Single-select position distribution**: 27 A / 28 B / 28 C / 27 D across `opt-a`–`opt-d` (24.5%–25.5%, max 25.5%, well below the 50% ceiling).
- **Option length delta**: Mean correct-option length minus distractor length is +0.67 characters (median +0.50 characters, n=126), well within the ±10.0 character ceiling.
- **Longest option as key share**: 29 of 110 single-select items (26.4%), comfortably below the 45% ceiling and virtually at the 25% random baseline.
- **Distractor notes coverage**: 100% of distractor options across all 126 questions carry complete explanations in `distractorNotes`.
- **Heuristic baselines**: "Always pick the longest option" yields 27.7% expected score (n=110); "Eliminate absolute qualifiers, then guess" yields 28% expected score, uniquely identifying the key in 0 of 110 items.
- **All four bias guards pass**: `positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`, and `scopeCoreShare`.

### Question review status

- **Reviewed**: 126 of 126 questions (100%) across all 7 domains have undergone adversarial evaluation and difficulty calibration.
- **Draft**: 0 questions remain `status: "draft"`. All 126 questions in `ccar-p` are `status: "reviewed"`.

### Known coverage limits and deliberate boundaries

- **Depth**: 0/126 `deep`-scope questions (100% `core`). The entire bank is provisioned to support two non-overlapping 63-question mock exams at the cognitive level of the exam guide.
- **Deprecated MCP surface**: MCP revision `2026-07-28` (SEP-2577) classified Roots, Sampling, Logging,
  and Dynamic Client Registration as Deprecated, and the HTTP+SSE transport has been deprecated since
  revision `2025-03-26`. The bank tests the two current transports (stdio, Streamable HTTP) and the
  non-deprecated primitives. Two items (`ccar-p-integration-011`, `ccar-p-integration-023`) still test
  Roots and Sampling because both remain in the specification until at least 2027-07-28; each names the
  deprecation in its explanation. **Re-confirmed on 2026-09-13** against
  `/specification/2026-07-28/deprecated`: both are still Deprecated-not-removed, with earliest removal
  the first revision released on or after 2027-07-28, and nothing has been removed under the policy yet.
  Both items stand. Revisit again at the `audit-sources` pass following the first 2027 revision.
- **Task-statement granularity**: Section 6 of the CCAR-P exam guide outlines task statements under each domain without sub-percentage weights; coverage is balanced and verified at the domain level.
- **Deliberate perimeters and out-of-scope boundaries**:
  - *Domain 1 (Solution Design & Architecture)*: Focuses on canonical Anthropic workflows (prompt chaining, routing, parallel sectioning, orchestrator-workers, evaluator-optimizer), coordinator/subagent context isolation, and ACI tool consolidation. Excludes third-party multi-agent frameworks (LangGraph, AutoGen, CrewAI, LlamaIndex), multi-modal voice/audio real-time WebRTC agents, and Desktop/OS GUI coordinate-level screen automation loops.
  - *Domain 2 (Claude Models, Prompting & Context Engineering)*: Focuses on prompt caching prefix ordering/breakpoints, extended thinking reasoning budgets, XML framing, structured tool outputs, and long-context needle-in-haystack ordering. Excludes vision/image tile token calculation formulas, custom model distillation, and self-service fine-tuning (which is bespoke enterprise-only).
  - *Domain 3 (Integration)*: Focuses on MCP primitives (Resources, Tools, Prompts), the stdio and Streamable HTTP transports, Messages API tool execution mechanics, Contextual Retrieval (hybrid BM25 + dense + reranking), context editing (`clear_tool_uses`), and programmatic tool calling. Excludes WebSocket MCP transports, custom streaming JSON fragment parsing algorithms, and cloud-provider-specific IAM wrapper policies (Bedrock / Vertex AI IAM).
  - *Domain 4 (Evaluation, Testing & Optimization)*: Focuses on multi-grader suites (code assertions + LLM judges), `pass^k` consistency gates, CI regression vs capability suite separation, transcript-versus-outcome grading, staged evaluation (automated evals in CI, A/B testing, production monitoring), per-dimension rubrics graded by isolated LLM judges, prompt caching economics, and OpenTelemetry spans. Excludes formal statistical sample-size power formulas, named third-party eval frameworks (Ragas, TruLens, DeepEval), and automated prompt search algorithms (DSPy).
  - *Domain 5 (Governance, Safety & Risk Management)*: Focuses on Zero Data Retention (ZDR), indirect prompt injection defense, Claude Enterprise Inference Hooks, Agent SDK permissions and callbacks, regional data residency (`inference_geo`), CMEK KMS key revocation, Compliance API eDiscovery scopes, GDPR Article 17 conflict resolution, and SCIM immutability. Excludes HIPAA BAA legal contract negotiation text, FedRAMP High boundary documentation packages, and SIEM-specific query language syntax (Splunk SPL).
  - *Domain 6 (Stakeholder Communication & Lifecycle Management)*: Focuses on the simplicity principle during discovery, SLA metrics (TTFT via streaming), cost-per-task economics, HTTP 429 vs 529 root causes with jittered backoff, CLAUDE.md repository onboarding, Workspaces governance, and production feedback eval flywheels. Excludes generic enterprise corporate finance metrics (NPV, IRR, CAPEX/OPEX accounting) and formal organizational change management frameworks (ADKAR, Kotter).
  - *Domain 7 (Developer Productivity & Operational Enablement)*: Focuses on Claude Code repository conventions (CLAUDE.md, `.claude/rules/`, `.claude/skills/`, `.claude/agents/`), PreToolUse hooks, MDM managed settings, git worktrees, `/compact` recovery, and stdio JSON-RPC framing corruption. Excludes IDE keyboard shortcuts and third-party CI/CD pipeline configuration syntax (GitHub Actions YAML) beyond CLI invocation flags.

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

The bank was developed, reviewed, and calibrated across four coordinated phases:
1. **Scaffold and seed (2026-09-12)**: Bank scaffolded; 1 question seeded per domain to verify sourceability and schema conformity.
2. **Authoring to 2× baseline (2026-09-12)**: Systematically authored across two expansion phases to reach exactly 126 questions (2× the 63-question exam baseline) proportionally distributed across all 7 domains to match blueprint weights with zero delta.
3. **Adversarial correctness evaluations (2026-09-13)**: Every question was cold-derived independently against cited vendor sources (`platform.claude.com`, `code.claude.com`, `modelcontextprotocol.io`, and `anthropic.com/engineering`) before comparing against stored keys. 122 questions confirmed immediately; 4 required substantive technical corrections (detailed below).
4. **Difficulty calibration and distractor hardening (2026-09-13)**: Domain-by-domain calibration against the official sample questions lifted 67 soft questions into rigorous architectural near-misses while leaving 59 calibrated items untouched. All 126 questions confirmed at `status: "reviewed"`. Bank promoted to `manifest.status: "stable"`.

5. **Currency review (2026-09-13)**: A `code-review` pass over the promotion diff checked the bank
   against live vendor sources. It found one key that had gone wrong against the current MCP
   specification, one key teaching a request shape that current models reject, and an arithmetic error
   in the hardening table. All are corrected below; the bank remains at 126 questions with all four
   bias guards passing.

### Currency corrections (2026-09-13)

The promotion diff was reviewed against live sources before the `stable` flag was trusted. Six items
and one table were corrected:

- `ccar-p-integration-010`: the key selected "HTTP with SSE" as the networked transport per "the MCP
  specification". That transport was replaced by Streamable HTTP in revision `2025-03-26` and is
  formally deprecated, so the key was **wrong against the live specification**. Re-authored to
  stdio + Streamable HTTP, with legacy HTTP+SSE demoted to a distractor; re-anchored to
  `specification/2026-07-28/basic/transports`.
- `ccar-p-integration-004`: stem premised the deprecated HTTP+SSE transport. The Origin-validation,
  localhost-binding and DNS-rebinding controls it tests carry over verbatim into Streamable HTTP, so the
  key stood; stem and citation restated over the current transport.
- `ccar-p-integration-011`, `ccar-p-integration-023`: test Roots and Sampling, both Deprecated as of
  `2026-07-28`. Both remain in the specification for at least twelve months, so the keys stand; stems now
  scope the revision under test and both explanations name the deprecation and its migration path.
- `ccar-p-claude-models-prompting-and-context-engineering-008`: the key and explanation taught
  `thinking: {"type": "enabled", "budget_tokens": N}` with no model named. That shape is deprecated on the
  4.6 models and **returns a 400 on Claude 4.7 and later**. Re-authored onto Claude Opus 5 with adaptive
  thinking and `output_config.effort`; the tested fact (reasoning isolated into a separate thinking block)
  is unchanged.
- `ccar-p-claude-models-prompting-and-context-engineering-007`: tested prefill as the technique to
  eliminate preambles, anchored at `#migrating-away-from-prefilled-responses` — a section arguing the
  opposite. Re-framed as the migration question that section answers: prefill on the last assistant turn
  returns a 400 from Claude 4.6 onward, and the documented replacement is Structured Outputs.
- `ccar-p-evaluation-testing-and-optimization-015`: the stem asked which method "eliminates position
  bias" while framing the symptom as an inflated aggregate win rate, which left 50/50 order randomisation
  defensible against the dual-pass key. Stem now asks for per-comparison order independence.
- **Hardening table**: the totals row read 52 hardened / 74 calibrated, contradicting its own column sums
  (7+0+7+15+12+17+9 = 67 and 14+16+17+5+6+1+0 = 59). Every per-domain row was internally consistent, so
  the totals were the error. Corrected to 67 / 59 here and in the phase summary.

Two consistency cleanups landed in the same pass: the five pages cited in both bare and `.md` form were
normalised to the bank's majority bare form (distinct source pages 62 → 58), and the four 4-option
select-2 items were padded to five options so every multi-select carries the same 1-in-10 guess floor.

### Substantive adversarial review adjudications

Across the bank's cold-review passes, four questions required substantive technical corrections before confirmation:

- `ccar-p-solution-design-and-architecture-018`: Option `opt-d` contained a facepalm distractor ("Instruct the model in the system prompt to hallucinate missing employee details..."). Replaced with a realistic architectural failure mode: "Inject the organization's complete employee directory table into the system prompt context on each request to eliminate runtime tool calling." Updated `distractorNotes` to explain token overhead, context saturation, and data privacy risks. Key `opt-c` reconfirmed.
- `ccar-p-claude-models-prompting-and-context-engineering-007`: Tested assistant turn prefilling to eliminate conversational preambles. Because prefilled assistant responses return HTTP 400 on Claude 4.6+ and later models (per Anthropic migration guidance), the stem was updated to explicitly specify "Claude 3.5 Sonnet", the explanation was updated to clarify model compatibility boundaries, and the source anchor was updated to `#migrating-away-from-prefilled-responses`. Key `opt-b` reconfirmed. **Superseded:** the currency pass recorded above re-framed this item away from Claude 3.5 Sonnet entirely, onto the Claude 4.6 migration that the cited section actually answers. The stem no longer names a 3.5-generation model.
- `ccar-p-governance-safety-and-risk-management-015`: Question originally drafted around inspecting free-form text for safety refusals. Re-authored to accurately reflect Anthropic Messages API structured refusals, where the API sets `stop_reason: "refusal"` alongside structured `stop_details: RefusalStopDetails` (`type: "refusal"`, `category`, `explanation`), which enterprise gateways inspect directly. Promoted to `reviewed`.
- `ccar-p-governance-safety-and-risk-management-018`: Question asked for least-privilege Compliance API auditing scopes without chat or file access. The original option relied on `read:org_audit`, but Anthropic documentation explicitly defines `read:org_audit` as granting access to all Compliance API read endpoints, which includes user chat transcripts and files. Re-authored to specify granular scopes (`read:members`, `read:compliance_activities`, `read:compliance_org_data`) that permit org and audit inspection while omitting `read:compliance_user_data`. Promoted to `reviewed`.

### Difficulty calibration and distractor hardening

The vendor exam guide provides only 3 illustrative sample questions, each representing foundational concept recall with transparently bad distractors (e.g. deleting tools, prefix ordering, retrieval vs generation failure). As with `ccdv-f`, the bank's headroom above this sample anchor is **deliberate intent, not a defect**: practicing above the sample bar ensures candidates are robustly prepared for live exam scenarios.

A systematic pass across all 7 domains hardened soft distractors into authentic architectural near-misses representing real mechanisms, documented gotchas, or common engineering traps:

| Domain | Total | Hardened | Calibrated (No Change) | Hardening Focus |
| --- | ---: | ---: | ---: | --- |
| Solution Design & Architecture | 21 | 7 | 14 | Replaced length tells and strawmen with parallel voting consensus, compensating prompt traps, and spot-instance checkpointing gotchas. |
| Claude Models, Prompting & Context Engineering | 16 | 0 | 16 | Cleared Stage 0 untouched; already substantially above anchor (extended thinking token budgets, 5-minute TTL eviction, SKILL.md modularization). |
| Integration | 24 | 7 | 17 | Replaced unindexed regex and raw TCP socket claims with mTLS DNS rebinding gotchas, in-context caching vs hierarchical RAG, and MCP sampling governance. |
| Evaluation, Testing & Optimization | 20 | 15 | 5 | Replaced arbitrary retry loops and facepalms with `pass^k` consistency gates and OpenTelemetry distributed spans. (Two topics landed here — ASR vs FRR trade-offs and dual-pass position swapping — were later found to be non-vendor vocabulary absent from their cited pages, and were re-authored out in the third source-drift pass.) |
| Governance, Safety & Risk Management | 18 | 12 | 6 | Replaced crude bash tools and consumer terms with Agent SDK permission evaluation order, CMEK KMS key revocation, CASB forward proxies, and workspace trust in CI. |
| Stakeholder Communication & Lifecycle Management | 18 | 17 | 1 | Replaced comical consulting strawmen with simplicity principle trade-offs, sub-second TTFT streaming, Workspaces spend limits, HTTP 429 vs 529 backoff, and golden eval flywheels. |
| Developer Productivity & Operational Enablement | 9 | 9 | 0 | Replaced claims of Claude Code file-reading inability with MDM `managed-settings.json`, `--bare` CI invocation, git worktrees, `/compact` focus, and stdio framing deadlocks. |
| **Total** | **126** | **67** | **59** | **All 126 items meet or exceed sample cognitive depth; all bias guards pass.** |

All hardening edits strictly preserved tested facts, answer keys, and cited source URLs. Distractor lengths were balanced using qualifying clauses, maintaining mean correct-option length delta at +0.67 characters and longest-option-as-key share at 26.4% (well below the 45% ceiling).

## Source drift pass — 2026-09-13

First `audit-sources` pass over the bank, run the day after promotion. Scope and
findings below; what was **not** covered is stated as explicitly as what was.

### Scope covered

- **Mechanical triage**: repo-wide `npm run check-sources` (all five banks, one
  shared URL set). For `ccar-p`: 58 distinct source pages, **0 stale** (oldest
  1 day against the 180-day threshold), **0 dead**. One redirect, handled below.
  No page was reported missing, so stage 2's false-negative discipline had
  nothing to adjudicate — no `sourceUrl` was changed on the strength of a failed
  fetch, because there were none.
- **Blueprint re-read**: `manifest.examUrl` re-fetched and converted. The guide
  is still **Version 1.0 · Effective July 2026 · Exam code: CCAR-P**, still 63
  items / 120 minutes / 720 scaled on 100–1,000, and Section 6 still publishes
  17/13/19/16/14/14/7 under the same seven domain names. **No blueprint drift**;
  every balance judgement recorded above remains valid on its original
  arithmetic.
- **Page-level drift, scoped by host**: `modelcontextprotocol.io` (8 pages, 8
  questions) audited in full — it was the only host carrying revision-scoped
  URLs and the only one where the record had left standing questions. The other
  three hosts (`platform.claude.com` 34 pages, `code.claude.com` 12,
  `www.anthropic.com` 4) were re-confirmed live by a second method
  (direct `curl -sL`, independent of the triage fetcher) with no redirects and
  no truncated bodies.

### Dispositions

Six items, all in Domain 3. Every `sourceCheckedAt` moved below was moved
because its page was actually re-read on this date.

| Item | Disposition | Reason |
| --- | --- | --- |
| `ccar-p-integration-019` | **rewrite** | Cited the `2024-11-05` revision, and the key named `resources/subscribe` — a request method the current `2026-07-28` revision no longer has. Re-anchored to `/specification/2026-07-28/server/resources`; key rewritten onto the `subscriptions/listen` + `notifications.resourceSubscriptions` pattern that replaced it. The `subscribe` capability flag and the `notifications/resources/updated` notification both survive unchanged, so the tested concept (push notification, not polling) is intact — only the wire method moved. |
| `ccar-p-integration-018` | **re-cite** | Key `opt-c` (Prompts user-controlled / Resources application-driven / Tools model-controlled) confirmed verbatim in the current spec, but it no longer lives on `learn/architecture`, which now covers only the primitive definitions. Re-cited to `/docs/2026-07-28/learn/server-concepts`, which carries all three mappings and the slash-command example. |
| `ccar-p-integration-020` | **re-cite** | Cited the `2024-11-05` revision. The Protocol Errors vs Tool Execution Errors split and `isError: true` are unchanged in `2026-07-28`, so the key stands; re-cited to the current revision. |
| `ccar-p-integration-001` | **re-cite** | Cited the *unversioned* `/docs/learn/architecture`, which 302s to the current revision — the bank's only floating MCP citation, against six pinned ones. Pinned to `/docs/2026-07-28/learn/architecture` to match. Resources-vs-Tools key re-confirmed on the page. |
| `ccar-p-integration-011` | **bump** | Page re-read, key (`Roots` + `Sampling`) intact. Its `2025-06-18` citation is deliberately pinned to a superseded revision because the stem names that revision, so it is correct as cited. |
| `ccar-p-integration-023` | **bump** | Page re-read; both controls still stated as client-side (`Clients SHOULD implement user approval controls`, `SHOULD implement rate limiting`). |

No retirements, and no manifest weight or domain-name change — neither stop-and-ask
gate was reached. The bank remains 126 questions with composition and all four
bias guards untouched.

### Correctness wrinkle fixed in passing

`ccar-p-integration-011`'s stem asked which primitives "enforce" the controls,
and option `opt-b` said Roots "define the explicit filesystem directory
boundaries". The cited page is emphatic that they do not: *"While roots
communicate intended boundaries, they do not enforce security restrictions"* —
servers **SHOULD** respect them, and real isolation must come from OS
permissions or sandboxing. The key was never in doubt (nothing else among the
five options is close), but the stem asserted something its own source
contradicts. Stem and `opt-b` re-worded to "communicate … are expected to
operate within", and the explanation now states the coordination-not-enforcement
distinction outright. Key, source, and option count unchanged.

Three stale `(stdio, SSE)` parentheticals in `distractorNotes` on
`ccar-p-integration-001`, `-011` and `-020` were corrected to Streamable HTTP,
finishing the transport cleanup the 2026-09-13 currency pass began in the stems.

### Not covered by this pass

- **No cold re-answer of the 118 non-MCP items.** Their keys were cold-derived
  against live sources one day earlier during the promotion review, and every
  cited page re-confirmed live here; re-deriving them the next day would measure
  nothing. The next pass should treat `platform.claude.com` and
  `code.claude.com` as **unaudited since 2026-09-13** and start there — the
  Claude Code surface (`sub-agents`, `skills`, `managed-settings`, `worktrees`)
  moves fastest and carries 16 questions.
- **`www.anthropic.com/engineering/building-effective-agents` is the bank's
  single largest concentration of risk**: 25 questions, one page, one host. It
  was confirmed live but its content was not re-read claim-by-claim. If that
  post is ever revised or retired, roughly a fifth of the bank moves at once.
  Budget a full read of it into the next pass regardless of staleness age.
- **Other banks' findings observed but not acted on.** The repo-wide triage
  flagged nine `docs.aws.amazon.com` / `aws.amazon.com` redirects in
  `aws-clf-c02`, several landing on section roots rather than the cited page
  (e.g. `lambda/latest/dg/security-shared-responsibility.html` →
  `lambda/latest/dg/`), which is the shape that stops establishing a specific
  claim. That is an `aws-clf-c02` pass, not this one, and nothing in that bank
  was touched here.

## Source drift pass — 2026-09-13 (second pass, non-MCP hosts)

Second `audit-sources` pass of the day. The first pass swept
`modelcontextprotocol.io` and named two things it had deliberately left
undone: the `platform.claude.com` / `code.claude.com` surface was never
cold-re-answered, and `building-effective-agents` had been confirmed live but
never re-read claim-by-claim. This pass took the second of those in full and
the Claude Code half of the first.

### Scope covered

- **Mechanical triage**: repo-wide `npm run check-sources`. For `ccar-p`: 58
  distinct pages, **0 stale** (max age 1 day against the 180-day threshold),
  **0 dead**, **0 redirects**. The two unversioned `modelcontextprotocol.io`
  redirects the run reported belong to `ccdv-f`
  (`questions/tools-and-mcps.json`), not to this bank; they are that bank's
  pass to make. Nothing here rested on a failed fetch, so stage 2 again had no
  false-negative call to adjudicate.
- **Blueprint re-read**: guide re-fetched from `manifest.examUrl` and converted
  with `pdftotext`. Still **Version 1.0 · Effective July 2026 · Exam code:
  CCAR-P**, still 63 items / 120 minutes / 720 scaled on 100–1,000, and
  Section 6 still publishes 17/13/19/16/14/14/7 under the same seven domain
  names. Document Control still lists only the initial publication. **No
  blueprint drift.**
- **`www.anthropic.com` — all 4 pages, all 37 questions, read claim-by-claim.**
  This was the concentration of risk the last pass flagged and it earned the
  budget: see below.
- **`code.claude.com` — all 12 pages, all 16 questions.** Every page
  re-confirmed live by a second method (direct `curl -sL … .md`, independent of
  the triage fetcher), no redirects, no truncated bodies. Fifteen of the
  sixteen keys re-derived cold and matched.

### The page that moved: `building-effective-agents`

The post has been **revised since the bank was authored**, and now opens with a
vendor note of its own:

> *Note: Much of the tooling landscape described in this post has changed since
> December 2024. For our current approach, see how we built Claude Managed
> Agents and the Managed Agents documentation.*

Two concrete changes followed from that. The frameworks list was rewritten —
it now reads Claude Agent SDK / Strands Agents SDK by AWS / Rivet / Vellum,
where it previously named LangGraph and Bedrock's agent framework. And the
routing example's models were refreshed from the 3.5 generation to **Claude
Haiku 4.5 and Claude Sonnet 4.5**; those are now the only model names on the
page.

What did **not** change is the part the bank actually leans on. The
workflow-versus-agent distinction, the simplicity principle, the five workflow
patterns, the ground-truth and stopping-condition guidance for agents, and the
whole of Appendix 2 on agent-computer interfaces are intact, most of them
verbatim. Seventeen of the twenty-five questions on this page re-derived cold
against it with no change needed. **No question cites the frameworks list**,
so that rewrite cost the bank nothing — but it is the clearest possible
warning about the concentration, and the standing advice from the last pass
stands: re-read this page in full every pass, regardless of staleness age.

### Dispositions

Nine items. Every `sourceCheckedAt` moved on this pass was moved because its
page was actually read on this date.

| Item | Disposition | Reason |
| --- | --- | --- |
| `ccar-p-evaluation-testing-and-optimization-009` | **rewrite** | Key taught OpenTelemetry distributed tracing, cited to `building-effective-agents`. That page contains no occurrence of `OpenTelemetry`, `tracing`, `span` or `observab` — and never did; this was a mis-citation from authoring, not drift. Re-anchored to `code.claude.com/docs/en/monitoring-usage` § Traces (beta), which states the claim exactly ("spans that link each user prompt to the API requests and tool executions it triggers"); stem re-scoped onto an Agent SDK agent so the citation genuinely establishes the key. Key `opt-d` unchanged, domain unchanged. |
| `ccar-p-evaluation-testing-and-optimization-007` | **rewrite** | Key was "shadow deployment"; the word `shadow` appears **zero** times on the cited evals post, which is unambiguous that the layered methods are automated evals, production monitoring, A/B testing, user feedback and human review. The key was not vendor-sourced. Re-authored onto the post's explicit stage mapping — automated evals pre-launch and in CI as first line of defence, A/B testing once traffic suffices, production monitoring post-launch for drift — with the Swiss Cheese framing. New key `opt-b`. |
| `ccar-p-evaluation-testing-and-optimization-013` | **rewrite** | Keyed on Context Recall, Context Precision and Faithfulness, cited to `contextual-retrieval`. That page uses only `recall@20` and contains no `precision` and no `faithful`; the three named metrics are Ragas vocabulary, which this bank's own Domain 4 perimeter excludes. Re-authored onto the transcript-versus-outcome distinction the evals post does define, which decouples retrieval from generation for the same diagnostic purpose. Multi-select and five options preserved, so the 1-in-10 guess floor and the format mix are unchanged. |
| `ccar-p-evaluation-testing-and-optimization-018` | **re-cite** | Key `opt-c` (calibrate the escalation threshold against an expert-labelled set) stands, but `building-effective-agents` says nothing about thresholds, labelled data, precision or recall. Re-cited to the evals post, which does carry threshold-weighted scoring and the requirement that judge graders be closely calibrated with human experts; explanation restated over what that page actually says. |
| `ccar-p-developer-productivity-and-operational-enablement-009` | **re-cite** | Key (arbitrary stdout corrupts JSON-RPC framing) is correct, but `code.claude.com/docs/en/mcp` contains no occurrence of `JSON-RPC` and never states the stdout-purity rule. Re-cited to the specification that does, `/specification/2026-07-28/basic/transports/stdio`: *"The server **MUST NOT** write anything to its `stdout` that is not a valid MCP message"*, with `stderr` explicitly allowed for logging. |
| `ccar-p-solution-design-and-architecture-014` | **re-cite** | Key turns on context hygiene through isolating intermediate tool transcripts; `building-effective-agents` has no `isolat` and no discussion of sub-agent context. Re-cited to `effective-context-engineering-for-ai-agents` § Sub-agent architectures, which states it directly. |
| `ccar-p-solution-design-and-architecture-017` | **re-cite** | Key is persisting task state outside the context window so workers can reconstitute after a restart; the cited page has no `persist` and no state-durability guidance. Re-cited to `effective-context-engineering-for-ai-agents` § Structured note-taking. |
| `ccar-p-solution-design-and-architecture-002` | **rewrite** | Key and options intact and correct, but the explanation quoted the routing example as naming Claude 3.5 Haiku and Claude 3.5 Sonnet. The page now names Haiku 4.5 and Sonnet 4.5, so the explanation misdescribed its own source. Model names refreshed; nothing else touched. |
| `ccar-p-evaluation-testing-and-optimization-020` | **rewrite** | Same drift, deeper: the 3.5 model names ran through the stem, every option and the explanation. Refreshed to Claude Haiku 4.5 / Claude Sonnet 4.5 throughout. The tested fact — route cheap stages to the small model, keep the frontier model for the hard ones — is unchanged. |

The remaining 44 questions on these two hosts were **bumped**: page re-read,
claim intact, `sourceCheckedAt` advanced. No retirements and no manifest weight
or domain-name change, so neither stop-and-ask gate was reached. The bank
remains 126 questions, 110 single / 16 select-2, zero delta on every domain,
and all four bias guards pass (`longestOptionIsKey` 27.3%, mean length delta
+1.82 chars). Distinct source pages 58 → 59.

### The pattern worth naming

Five of the nine dispositions are the same defect: **a sound key hung on a page
that does not establish it.** None of them were drift — the pages had not
changed — and none would ever be caught by link checking, staleness ages, or
`npm run check`, all of which were green throughout. They were only visible
because the claim was read against the cited section. `building-effective-agents`
attracted four of the five, which is what a page cited by a fifth of the bank
does: it becomes the default citation for anything agent-shaped, including
claims it never made. Future passes should treat any page carrying an outsized
share of a bank as a mis-citation magnet and re-read its questions against it
even when nothing about the page has moved.

### Not covered by this pass

- **`platform.claude.com` is untouched: 34 pages, 65 questions — over half the
  bank.** The last pass confirmed its pages live but did not read them; this
  pass did not either, having spent its budget on the two hosts that pass named.
  It should be treated as **unaudited since authoring** and is the unambiguous
  first priority for the next pass. Given that five of nine findings here were
  mis-citations rather than drift, the expected yield on 65 unread questions is
  not low.
- **`modelcontextprotocol.io` was not re-read.** The earlier pass today covered
  all 8 of its questions in full; re-deriving them hours later would measure
  nothing. The one MCP change made here was a re-cite *into* that host from
  `code.claude.com`, verified against the spec page directly.
- **`ccdv-f`'s two unversioned MCP citations were observed and not acted on**
  — see triage above. That is a `ccdv-f` pass.

## Source drift pass — 2026-09-13 (third pass, `platform.claude.com`)

Closes the gap both earlier passes named: `platform.claude.com` — 34 pages, 65
questions, over half the bank — had never been read claim-by-claim since
authoring. It is now audited. **Every host in this bank has been read at least
once**, so the next pass starts from a complete baseline rather than a known
hole.

### Scope covered

- **Liveness by a second method**: all 34 pages fetched directly with
  `curl -sL …​.md`, independent of the triage fetcher. **34/34 returned 200 with
  no redirect** — every page still answers at the exact URL cited. No
  `sourceUrl` was changed on the strength of a failed fetch, because there were
  none.
- **Claim-by-claim read of all 65 questions**, prioritised by concentration:
  prompt caching (6), develop tests (6), prompting best practices (5), batch
  processing (4), reduce latency (4), mitigate jailbreaks (4), then the
  remaining 36 across 28 pages.

### What actually moved

Three distinct kinds of drift, and only the first is the kind a link checker
could ever have hinted at.

**1. The model lineup turned over underneath the bank.** The prompt-caching
pricing table now lists Claude Fable 5.1, Opus 5, Sonnet 5 and Haiku 4.5 as
current; **Claude 3.5 Sonnet is gone from it entirely, and Claude Haiku 3.5 is
marked retired**. Seven questions still named 3.5- and 3.7-generation models. In
most the name was incidental colour, but in two it was load-bearing.

**2. Two APIs the bank teaches have been superseded in place.** Manual extended
thinking (`thinking.type: "enabled"` with `budget_tokens`) now carries a
deprecation banner: deprecated on the Claude 4.6 models, and **rejected with a
400 on Claude 4.7 and later**. And forced tool use has grown a restriction
table — on Claude Fable 5.1 and Mythos 5.1, `tool_choice` values of `any` and
`tool` **return a 400**, with `auto` plus strict tool use, or structured
outputs, named as the substitutes. This is the identical trap the 2026-09-13
currency pass caught on `…-008` (thinking) and `…-007` (prefill); two more
instances of it were still in the bank.

**3. Guidance has been rewritten, not merely extended.** The prompt-caching page
now documents **automatic caching** and a **20-block lookback window**, and its
recommendation for a growing conversation is the *final* block or automatic
caching — the phrase "second-to-last" appears nowhere on it. The structured
outputs page has moved to `output_config.format`, and `tool_choice` appears
**zero** times on it. And `mitigate-jailbreaks` has gained a full indirect
prompt injection section whose guidance is to put untrusted content **only** in
`tool_result` blocks, "never in `system` prompts or plain user `text` blocks" —
which retires the XML-tags-as-injection-defence pattern one question still
taught, and which that same question contradicted against
`ccar-p-governance-safety-and-risk-management-002` elsewhere in this bank.

### Dispositions

Fifteen items. Every `sourceCheckedAt` moved was moved because its page was
read on this date.

| Item | Disposition | Reason |
| --- | --- | --- |
| `ccar-p-claude-models-prompting-and-context-engineering-002` | **rewrite** | Stem named Claude 3.7 Sonnet (retired) and keyed on `budget_tokens`, which is now deprecated on 4.6 and 400s on 4.7+. Re-scoped to Claude Sonnet 4.5 — active, and manual-thinking-only, so `budget_tokens` is exactly right there — with the deprecation boundary stated in the explanation. Key unchanged. |
| `ccar-p-claude-models-prompting-and-context-engineering-003` | **rewrite** | Every model in the key and distractors was retired (3 Opus, 3.5 Haiku, 3.5/3.7 Sonnet). Re-keyed onto the current lineup using the model page's own descriptions: Haiku 4.5 "the fastest model with near-frontier intelligence", Sonnet 5 "the best combination of speed and intelligence". |
| `ccar-p-claude-models-prompting-and-context-engineering-004` | **rewrite** | Keyed XML tags as the mitigation for indirect prompt injection. The current guidance answers that scenario differently and explicitly — untrusted content goes in `tool_result` blocks, never in system prompts or plain user text — so the item taught a superseded defence *and* contradicted `governance-safety-and-risk-management-002`, which teaches the current one. Re-authored onto what the prompting page does establish: XML tags disambiguate a prompt that mixes instructions, context, examples and variable input. Injection stays with the jailbreaks page, where it belongs. |
| `ccar-p-claude-models-prompting-and-context-engineering-012` | **rewrite** | Key option said "second-to-last user turn". That phrase no longer appears on the page, which now teaches placing `cache_control` on the last block whose prefix is stable, or using automatic caching. Key re-worded to the current guidance; a distractor re-pointed at the 20-block lookback limit, which is a real and newly-documented failure mode. |
| `ccar-p-claude-models-prompting-and-context-engineering-013` | **rewrite** | Key was the tool-as-schema trick via `tool_choice`. `tool_choice` occurs **zero** times on the structured outputs page, which now documents JSON outputs through `output_config.format` (response shape) and strict tool use (tool inputs) as the two features. Re-keyed onto `output_config.format`, the documented answer for this stem. |
| `ccar-p-evaluation-testing-and-optimization-012` | **rewrite** | Keyed on Attack Success Rate and False Refusal Rate — neither phrase occurs on the cited page, and neither is Anthropic vocabulary. Re-authored onto the four layered controls the page does document for indirect prompt injection, with the two documented anti-patterns (untrusted text in the system prompt; your own instructions inside a tool result) as distractors. |
| `ccar-p-evaluation-testing-and-optimization-015` | **rewrite** | Position bias and pairwise comparison do not appear on the cited `develop-tests` page at all — the whole subject was unsourced, and the 2026-09-13 currency pass rewrote the stem without checking that. Re-cited to `demystifying-evals-for-ai-agents` and re-authored onto guidance it states directly: structured rubrics per dimension, each graded by an isolated LLM-as-judge rather than one judge scoring all dimensions. |
| `ccar-p-evaluation-testing-and-optimization-016` | **rewrite** | Stale model name only; key (SSE streaming for perceived latency) confirmed. The page itself now recommends "a faster model like Claude Haiku 4.5". |
| `ccar-p-governance-safety-and-risk-management-007` | **rewrite** | Stem demanded the ability to "instantly" revoke. The page records a **revocation delay of up to 1 hour** (the cache TTL), with in-flight requests still succeeding in that window — so the stem asked for something the control does not provide. Re-framed to ask what the runbook should record, with the 1-hour delay in the key. The permanent-inaccessibility claim is confirmed verbatim. |
| `ccar-p-governance-safety-and-risk-management-010` | **re-cite** | Key names the `read:compliance_user_data` scope, which does not appear on the cited `compliance-api` page; that page defers scopes to `compliance-api-access`, where the scope table lives. Re-cited there. Key unchanged. |
| `ccar-p-integration-005` | **rewrite** | Key (`tool_choice` + `strict: true`) is correct on models that support forced tool use, but the page has grown a restriction table: on Fable 5.1 and Mythos 5.1 those `tool_choice` values 400. Explanation now states the boundary and the documented substitutes. Key and options unchanged. |
| `ccar-p-solution-design-and-architecture-019` | **rewrite** | Built on Claude 3.5 Sonnet and 3.5 Haiku across stem and options; both retired. Refreshed. Key (prompt caching on the static prefix + SSE streaming) confirmed. |
| `ccar-p-solution-design-and-architecture-020` | **rewrite** | Stale model name in the explanation. Batch API facts re-confirmed verbatim: 50% discount on all usage, 24-hour expiration, and batch usage does not affect Messages API rate limits. |
| `ccar-p-stakeholder-communication-and-lifecycle-management-003` | **rewrite** | Stale model names. Key confirmed verbatim against the page's own heading — "Compare models on cost per completed task, not per token". |
| `ccar-p-stakeholder-communication-and-lifecycle-management-010` | **rewrite** | Stale model name in a distractor. Key (Batches API, 50% discount, asynchronous turnaround) confirmed. |

The other 50 platform questions were **bumped**: page re-read, claim intact.
Several re-confirmed verbatim and are worth recording as solid — CMEK's
no-backout-path warning, the 409 "chats attached to it" project-deletion
conflict, the `RefusalStopDetails` schema, `inference_geo` with
`allowed_inference_geos`, the inference-hooks allow/deny verdict flow, the
`tool_result` / `is_error` contract, tool-result-before-text ordering, and the
long-context "longform data at the top, ground responses in quotes" pair.

No retirements and no manifest weight or domain-name change, so neither
stop-and-ask gate was reached. The bank remains 126 questions, 110 single /
16 select-2, zero delta on every domain.

### A quality regression I introduced and then fixed

The first cut of these rewrites pushed the mean correct-option length delta from
+0.67 to **+3.17 characters** and the "always pick the longest" baseline to 30%,
because a re-authored key that has to name four controls is naturally longer than
the distractors it replaced. Four items had become solvable by length alone.
Options were rebalanced with qualifying clauses on the distractors rather than by
hedging the keys, returning the bank to **+0.70 mean delta, 26.4%
longest-option-as-key, and 28.2% for the longest-option heuristic**. The
repository's absolute-qualifier guard also caught the `evaluation-testing-and-optimization-012`
rewrite, where the key had become the only option with no absolute qualifier;
fixed by softening a distractor, not by weakening the key. **Lesson for the next
pass: re-authoring during an audit is where bias creeps back in — run
`npm run metrics` before and after, not just `npm run check`.**

### Not covered by this pass

- **`platform.claude.com` deep links were checked as pages, not as anchors.**
  Several citations carry `#fragment` anchors; the pass verified the claim lives
  on the page, not that each anchor still resolves to the section named. A page
  can reorganise its headings without changing any prose.
- **Model currency is now a standing liability, not a closed finding.** Seven
  questions needed refreshing this pass because the lineup turned over. Nothing
  in `npm run check` tests for a retired model name. A cheap guard —
  grep the bank for model names and diff against the current models page —
  would catch this class mechanically and is worth building before the next
  lineup change.
- **`ccdv-f`'s two unversioned MCP citations remain unaddressed** across all
  three passes. That is a `ccdv-f` pass, and it is now the oldest outstanding
  item in the repository.

## Independent review of the source-drift dispositions — 2026-09-13

The three passes above were all made by one agent. This pass re-reviews the 24
questions that took a disposition in commit `26cc4d8`, by a reviewer who did not
make them, treating that agent's reasoning as unverified. Every key was
re-answered **cold** from its cited source before the stored key was consulted.

Verdicts: **17 confirmed, 6 needing fixes, 1 rejected rewrite.** Eight questions
changed. One further defect was found outside the reviewed 24 and fixed.

### What the earlier passes got right

Most of it. The re-cites in particular hold up under a cold read, and three are
better than their write-ups claimed:

- `evaluation-testing-and-optimization-009` → `monitoring-usage` § Traces
  (beta). The quoted span sentence is verbatim, and the page carries three
  separate Agent SDK paragraphs, so the stem's Agent SDK scoping genuinely
  makes a Claude Code citation valid. The span-hierarchy section answers the
  stem's "which step consumed the time" directly.
- `governance-safety-and-risk-management-010` → `compliance-api-access`. The
  scope table states the key verbatim, and the key-type table explicitly names
  "sessions (in apps such as Cowork and Claude Code)", which is the half of the
  stem the old citation could not reach at all.
- `governance-safety-and-risk-management-007`. The stem fix was necessary and
  the rewrite is exact: "permanently inaccessible, with no backout path" and
  "Key revocation can take up to 1 hour (the cache TTL)" are both verbatim.

`claude-models-prompting-and-context-engineering-012` (prompt caching) is the
best-sourced item in the set — the key takeaway, the 4-breakpoint cap, the
"breakpoints don't add any cost" rule and the 20-block lookback are each
confirmed on the page.

### The defect class the passes did not catch

**They verified keys, not explanation numerics.** Three of the six fixes are
figures asserted as vendor-documented that appear nowhere on the cited page:

| Item | The claim | Occurrences on the cited page |
| --- | --- | --- |
| `solution-design-and-architecture-019` | "up to an 80%+ reduction in TTFT and 90% cost savings" | `80%` 0, `90%` 0, `85` 0, `cost savings` 0 |
| `evaluation-testing-and-optimization-016` | "(typically under 800ms)" | `800` 0 |
| `claude-models-prompting-and-context-engineering-002` | "temperature must remain 1.0 when extended thinking is enabled" | `temperature` 0 |

The first is real drift, not authoring sloppiness: the prompt-caching page used
to carry those percentages and has replaced them with the concrete pricing
multiplier (cache reads at 10% of base input, 2.5% on Fable 5.1 and Mythos 5.1).
The third pass read that page claim-by-claim, re-confirmed the key, and walked
past the number in the explanation. **A key-only cold read is not enough: read
the explanation and the distractorNotes against the page too, because that is
where unsourced numbers hide.**

### Dispositions

| Item | Disposition | Reason |
| --- | --- | --- |
| `ccar-p-evaluation-testing-and-optimization-012` | **reject and re-author** | The rewrite's sourcing was impeccable — all four controls verbatim — but it landed on the same section of the same page as `governance-safety-and-risk-management-002`, which already keys on tool_result delivery plus a system-prompt untrusted policy. Even the distractors rhymed: gov-002's delimiters-in-system-prompt ≈ this item's `opt-b`, gov-002's regex filter ≈ this item's `opt-c`. Domain fit regressed too: an item in Domain 4 came to test Domain 5 architectural controls, where the retired version at least tested evaluation metrics. And the key was the only option that was a *combination* when the stem asked for one — a format tell no length metric can see. Re-authored onto the same page's validation guidance ("Red-team your own agent… test your workflow with documents, emails, and tool outputs that deliberately contain injection attempts") plus § Continuous monitoring. That is genuinely Domain 4 and does not overlap gov-002. |
| `ccar-p-solution-design-and-architecture-017` | **re-cite and rescope** | The worst instance of the very defect the audit was chartered to find. Re-cited to `effective-context-engineering` § Structured note-taking, a technique for surviving a **context reset** — but the question is about surviving **machine preemption**. On that page: `checkpoint` 0, `resume` 0, `restart` 0, `durab` 0, `crash` 0, `queue` 0. Re-cited to `code.claude.com/docs/en/agent-sdk/sessions` § Resume across hosts, which states it: "Session files are local to the machine that created them", and for "a different host (CI workers, ephemeral containers, serverless)" attach a session-store adapter "so the SDK mirrors transcripts to your own backend and another host can resume them". Stem rescoped onto an Agent SDK agent. `opt-a` improved from a generic RAM-and-disk distractor into the trap the page actually warns about: relying on the default local session files and `continue`. A stale "5-minute rolling TTL" in `opt-c`'s note corrected to the 5-minute default with a 1-hour maximum. |
| `ccar-p-solution-design-and-architecture-014` | **explanation** | Only one of the key's three clauses is on the cited page. "the detailed search context remains isolated within sub-agents" is there; `swarm`, `control flow` and `cascade` are each 0. The explanation attributed "predictable control flow, explicit auditability, bounded iteration loops" to guidance that page never gives — those live on `building-effective-agents` ("workflows offer predictability and consistency", "the potential for compounding errors", "stopping conditions… to maintain control"). The schema allows one `sourceUrl`, so the citation stays and the explanation now quotes what that page says and marks the rest as structural corollary. The item's discriminating power never rested on those clauses: all three distractors are false statements, so the key wins on being the only true option. |
| `ccar-p-integration-005` | **stem** | The explanation stated the Fable 5.1 / Mythos 5.1 400 boundary correctly, but the stem named no model — so the key was a configuration the docs say returns a 400 on the flagship models, and the explanation had to apologise for it. Stem now names Claude Sonnet 5 as "a model that supports forced tool use". The explanation also now records the second documented exclusion it had omitted: `any` and `tool` are unsupported alongside manual extended thinking. |
| `ccar-p-solution-design-and-architecture-019` | **explanation** | Unsourced percentages, above. Replaced with the page's own qualitative claim and the 10%-of-base-input cache-read price. |
| `ccar-p-evaluation-testing-and-optimization-016` | **explanation** | Unsourced "(typically under 800ms)", above. Now quotes the page verbatim on streaming and perceived responsiveness. |
| `ccar-p-claude-models-prompting-and-context-engineering-002` | **distractorNote** | Unsourced temperature claim, above. True of the API, not established by the cited page; removed. The note's first clause already disqualifies the option. |
| `ccar-p-evaluation-testing-and-optimization-005` | **explanation** | Found outside the reviewed 24 and fixed. The explanation opened "Anthropic's evaluation guide notes that model-based judges can suffer from biases such as favoring verbosity" — `verbos` and `bias` are 0 on the cited page *and* 0 on `demystifying-evals`. No page in this bank's citation set documents LLM-judge verbosity bias. Explanation now grounds the rubric and reasoning clauses in § Tips for LLM-based grading and returns the verbosity finding to the stem's fact pattern, where it belongs. `sourceNote` sharpened from "Grade your evaluations and tips for LLM-based grading" to name the three tips the key leans on. |

### A correction to this pass's own first read

The first cut of this review reported `evaluation-testing-and-optimization-005`
as another "sound key, wrong page", on the strength of `chain-of-thought`
returning 0 on `develop-tests`. That was wrong: the page states the practice in
different words — "Encourage reasoning: Ask the LLM to reason first before
producing an evaluation score, and then discard the reasoning" — and also
carries "Have detailed, clear rubrics". Two of the key's three clauses are on
the cited page; only the verbosity-bias premise is unsourced, which is a much
smaller defect. **Grep for the concept, not the vocabulary.** A zero count for a
term of art is evidence the phrase is absent, not that the claim is.

### Gaps the third pass named, now closed

- **Anchors are verified.** The bank carries only 5 `#fragment` citations, all
  on `claude-prompting-best-practices`. All five resolve to live `###` headings
  (`structure-prompts-with-xml-tags`, `be-clear-and-direct`,
  `use-examples-effectively`, `migrating-away-from-prefilled-responses`,
  `long-context-prompting`). No fix needed; this is not a standing liability.
- **No retired model names remain.** Full inventory of the bank: Haiku 4.5 (13),
  Sonnet 4.5 (8), Sonnet 5 (6), Opus 5 (3), Mythos 5.1, Fable 5.1, plus 4.6/4.7
  generation references. All current or legacy-but-available. The model-name
  grep the third pass proposed as a mechanical guard is cheap and works; it is
  still worth building.

### Metrics

Re-authoring did not reintroduce length bias this time, because the distractors
were written to length rather than trimmed afterwards. All four guards pass
throughout.

| | Before | After |
| --- | --- | --- |
| mean option-length delta | +0.70 | **+0.64** |
| longest-option-as-key | 26.4% | **24.5%** |
| "always longest" baseline | 28.2% | **26.4%** |
| "eliminate absolutes", uniquely solving | 28.6%, 0/110 | **28.6%, 0/110** |
| distinct source pages | 59 | **60** |

Composition untouched: 126 questions, 110 single / 16 select-2, zero delta on
every domain, position split 29/29/26/26.

### Not covered by this pass

- **Only the 24 disposed questions were re-answered.** The other 102 were not
  re-read. Given that this pass found three unsourced figures inside questions
  the third pass had just read, the explanation-and-distractorNote sweep
  described above should be run across the whole bank, not only over items that
  take a disposition. That is the single highest-yield thing the next pass can do.
- **`solution-design-and-architecture-014` still has the key as its longest
  option** (+13 chars, `[LONGEST=KEY]`). Pre-existing, and the repository guard
  passes it; its distractors are false statements rather than padded ones, so
  the length is not exploitable. Left alone deliberately rather than overlooked.
- **The absolute-qualifier guard's word list is narrower than the heuristic it
  models.** `ABSOLUTE_QUALIFIER_WORDS` covers always/never/only/must/every/
  cannot/all/any/no. On `evaluation-testing-and-optimization-007` a distractor is
  disqualified by "routinely miss entirely", which a real test-taker reads as
  absolute and the guard does not. The 0-of-110 figure is therefore slightly
  optimistic. Widening the list would move every bank's recorded baseline, so it
  is a repository decision, not a `ccar-p` one.
- **`ccdv-f`'s two unversioned MCP citations remain unaddressed** across all four
  passes, and are still the oldest outstanding item in the repository.

### External code review of the same staged changes — 2026-09-13

A separate reviewer ran a code review over the staged `ccar-p` changes and
raised nine findings. They were checked one by one against the tree rather than
taken on trust. One had already been fixed by the independent review above
(`evaluation-testing-and-optimization-012`, reached independently and with the
same remedy, which is corroboration rather than coincidence). The other eight
were valid and are now fixed. Three were understated by the reviewer and one
correction lands on this record's own earlier claim.

| Finding | Disposition | Reason |
| --- | --- | --- |
| Structured Outputs cannot emit XML (`claude-models-prompting-and-context-engineering-007`) | **stem fix** | Confirmed: `structured-outputs` has 7 occurrences of `xml` and **all 7 are `com.fasterxml.jackson` package imports** in Java samples. The feature is `type: "json_schema"` only, so a stem targeting "a specific XML schema" made its own key impossible. Retargeted to a JSON schema with a prefilled opening brace; `opt-c`'s note follows. The key was always the best of four, so scoring was never wrong — the bank was teaching a capability that does not exist, which is the worse failure for a cert. |
| Off-topic distractor in `evaluation-testing-and-optimization-006` | **option fix** | Worse than reported. `opt-e` raised "the judge model's temperature" in an interactive-latency scenario with no judge and no eval harness, **and its `distractorNote` answered as though the scenario were an eval question** — the signature of an option pasted in from another item. It collapsed a select-2-of-5 (10 combinations) to an effective 2-of-4 (6), lifting the guess floor from 10% to 16.7%. Replaced with a real latency anti-pattern: routing interactive turns through the Batches API. |
| Domain 4 perimeter and hardening table list retired topics | **record fix** | Understated. Line 107 listed "RAG metric decoupling (precision, recall, faithfulness)" as a Domain 4 focus **while the same line excluded "named third-party eval frameworks (Ragas, TruLens, DeepEval)"** — and those three metrics are Ragas vocabulary, which is the exact contradiction the second pass invoked when it rewrote `-013`. Both that line and the hardening table's "ASR vs FRR trade-offs, and dual-pass position swapping" now reflect the post-audit topics. |
| Contradictory history for `…-007` | **record fix** | Valid, and the file's ordering makes it worse: the currency section (from line 164) sits **above** the adjudications section (from line 200), so a reader meets the correct Claude 4.6 reframing first and a contradicting "Claude 3.5 Sonnet" note afterwards, unmarked. Annotated as superseded. |
| Three near-identical Batches API items | **re-author** | Undercounted: **four** questions cite `batch-processing`, not three. `solution-design-and-architecture-020` earns its place (select-2, paired with the fast-model half), but `evaluation-testing-and-optimization-001`, `solution-design-and-architecture-008` and `stakeholder-communication-and-lifecycle-management-010` were the same question — N overnight transcripts to the Batches API for the 50% discount — differing only in industry and volume. Nothing in `npm run check` or the balance report can see this; all three counted as distinct coverage in three different domains. `-008` kept as the canonical architecture choice. `-001` re-authored onto per-request result semantics (`succeeded` / `errored` / `canceled` / `expired`, none of the last three billed, one request's failure not affecting others), which is genuinely Domain 4. `-010` re-authored onto publishing a turnaround commitment — the documented 24-hour expiration bound against the sub-hour typical case — which is genuinely Domain 6, and its stem now chunks 500,000 requests across batches rather than implying one batch above the 100,000 limit. |
| Three variants of the multi-select suffix | **normalised** | Real inside this bank: 7 `(Select TWO.)`, 7 `(Select two.)`, 2 bare `Select TWO.` across 16 items. All 16 now read `(Select TWO.)`. Note the reviewer's "repository standard" framing is overstated — `az-900` uses the bare form and `ccdv-f` mixes all of them — but `(Select TWO.)` matches `ccar-f`, the same cert family. |
| 29 `sourceUrl`s retaining `.md` | **normalised** | **Valid, and it corrects a claim made earlier in this session.** The independent review above initially dismissed the `.md` suffix as bank convention. It is not: the record at lines 196–198 states the bank normalised "to the bank's majority bare form". That earlier normalisation only touched pages cited in *both* forms, leaving pages cited solely as `.md` untouched. The staged diff shows **29** `.md` citations stripped. A thirtieth was touched only in passing: the `…-017` re-cite earlier in this session was first written with a `.md` suffix, following the wrongly-inferred convention, and was normalised before anything was staged — so it appears in the diff as a direct move to the bare `agent-sdk/sessions` URL rather than as a `.md` removal. Impact was cosmetic: no page was cited in both forms, so nothing was double-counted. |

### The guard earned its keep again

The first cut of the two Batches re-authorings **failed `npm run validate`** on the
absolute-qualifier rule: in both items the key had become the only option with
no absolute. This is the same regression the third pass recorded, arriving the
same way — re-authoring during an audit. Fixed the way that pass prescribes, by
softening a distractor (`any request` → `the results contain unsuccessful
requests`; `any stragglers` → `stragglers`) rather than hedging either key.
Worth restating: **`npm run check` catches this, but only after the fact. Run it
on every re-author, not once at the end of the batch.**

Metrics after all fixes: mean option-length delta +0.70, longest-option-as-key
24.5%, "always longest" 26.4%, "eliminate absolutes" 28.9% uniquely solving
0/110, position split 29/30/26/25. All four guards pass. Composition unchanged
at 126 questions, 110 single / 16 select-2, zero delta on every domain, 60
distinct source pages.

### Second external code review — 2026-09-13

A further review of the same staged changes raised four findings. All four are
valid; none was a false positive. Two land on work done earlier in this session,
which is the point of running another pass over it.

| Finding | Disposition | Reason |
| --- | --- | --- |
| Unsourced "80%" and "KV states" in `evaluation-testing-and-optimization-006` | **re-author** | Valid, and under-diagnosed. The cited `reduce-latency` page has zero occurrences of `80%`, `KV`, `prefill` **and `cach`** — it does not discuss prompt caching at all. So the defect was not a stray numeral in the explanation: half the key (`enable prompt caching`) was unsourced on its own page. The page documents exactly three levers — choose a faster model, minimise input and output tokens, stream responses. Re-authored onto the two the item can actually test: the stem now states that streaming is already in place (which also stops it duplicating `…-016`, whose key *is* streaming on the same page), and the keys are Claude Haiku 4.5 for a speed-critical path and trimming prompt and output length. The `max_tokens` and temperature distractors are now wrong in the direction the page names, rather than merely implausible. |
| "none of them ever reached the model" over-claims for `errored` | **option fix** | Valid, and it is this session's own wording. The documentation attaches "before this request could be sent to the model" to `canceled` and `expired` only; `errored` is "Request encountered an error and a message was not created", which can include internal server errors after dispatch. `opt-b` and the `opt-a` note now say "created no message result", which is the criterion the documentation actually applies to all three. The explanation already used the correct formulation, so only the option and note moved. |
| The `.md` entry claims 30 strippings; the diff shows 29 | **record fix** | Valid. The staged diff strips 29 `.md` citations. The thirtieth existed only transiently inside this session: `…-017` was re-cited with a `.md` suffix under the wrongly-inferred convention and normalised before anything was staged, so it appears in the diff as a direct move to the bare `agent-sdk/sessions` URL. The entry now says so. The "30" came from an in-session script counting its own intermediate state — a reminder that **counts belong in the record only once they are counted against the diff, not against the working step that produced them.** |
| 90% cache discount attributed to the Skills page in `…-016` | **explanation fix** | Valid, same class as the first finding. `code.claude.com/docs/en/skills` has zero occurrences of `90%`, `discount` and `breakpoint`; its only two `cach` hits are `__pycache__` and a plugin data directory. Cache pricing lives on the prompt-caching page (10% of base input, 2.5% on Fable 5.1 and Mythos 5.1), so the "90%" was also about to go stale. The key option already said "cached read rates" and was fine; the explanation now matches it. |

### What two consecutive external reviews say about the unsourced-numeric class

The independent review found three instances, fixed them, and wrote up the
lesson. This review then found **two more in the same bank**, one of them inside
a question the previous pass had just re-authored. That is not a failure of any
single pass; it is evidence the defect is dense enough that targeted reads keep
missing instances. The standing recommendation is now firmer: **sweep every
explanation and distractorNote in the bank for figures and internal
implementation vocabulary, and check each against its cited page.** Candidates
are cheap to find mechanically — percentages, millisecond figures, and terms
like `KV`, `prefill`, `token bucket` that read as documentation but usually are
not.

Rebalancing note: the `…-006` re-author initially made a key the longest option
(delta +10 on a guard threshold of 10). Distractor lengths were adjusted to
bring the item to -3 with a distractor longest. Bank metrics after all fixes:
mean option-length delta +0.78, longest-option-as-key 24.5%, "always longest"
26.4%, "eliminate absolutes" 28.9% uniquely solving 0/110, position split
29/30/26/25. All four guards pass; composition unchanged at 126 questions,
110 single / 16 select-2, zero delta on every domain.

## Derived-figure precedent and adjudication pass — 2026-09-13

Following the discovery of repeated unsourced figures across recent review passes,
this pass establishes the written precedent for adjudicating numbers in questions,
explanations, and distractor notes before encoding the canonical rule in
`CONTRIBUTING.md`.

The investigation evaluated six representative questions against their live vendor
sources to settle the boundary between verbatim claims, mathematically derived
figures, cross-page distractor facts, and scenario premises.

### Summary of adjudications

| Question | Claim under review | Cited page | Claim class | Verdict | Disposition |
| --- | --- | --- | --- | --- | --- |
| `ccar-p-evaluation-testing-and-optimization-019` | "90% discount", "25% premium", "5-minute TTL" | `prompt-caching` | Verbatim facts + derived arithmetic | **Partial defect**: 25% premium and 5-minute TTL are verbatim, and `opt-b` may carry the arithmetic inverse of the documented 0.1x multiplier because inverting it is the item's work. The `explanation` and `distractorNotes.opt-c` asserted the same "90% discount" as vendor fact, which the precedent below forbids. | **rewrite** — explanation and `distractorNotes.opt-c` restated as `0.1x` / 10% of base input price. Key, stem and options unchanged. |
| `ccar-p-solution-design-and-architecture-019` | "cache reads billed at 10% of the base input price" | `prompt-caching` | Identity mechanism conversion | **Confirmed**: 0.1x decimal multiplier converted to 10% billing rate represents an identity conversion of the vendor mechanism. This is the gold-standard mechanism phrasing. | **bump** — no change needed. |
| `ccar-p-stakeholder-communication-and-lifecycle-management-003` | "up to a 90% read discount on cached prefixes" | `optimizing-for-cost-and-intelligence` | Conflated numeric hybrid | **Defect**: Conflates the fixed pricing mechanism ("a tenth of the input price") with an empirical benchmark token share ("79% to 90% of input tokens"). Pricing does not scale "up to" 90%. | **rewrite** — `distractorNotes.opt-c` now states the cache-read rate as a tenth of the input price. |
| `ccar-p-integration-021` | "a 90% discount on input tokens" | `contextual-retrieval` | Attribution misalignment | **Defect**: Page contains `90%` ("costs by up to 90%"), but refers to empirical end-to-end task savings, not a unit token pricing discount. Lexical match does not substitute for semantic attribution. | **rewrite** — explanation and `distractorNotes.opt-c` now say cache-read pricing is a tenth of the base input price. |
| `ccar-p-integration-022` | "under 200,000 tokens", "90% cache-read cost savings" | `contextual-retrieval` | Verbatim fact + attribution misalignment | **Partial defect**: "under 200,000 tokens" is verbatim. "90% cache-read cost savings" re-labels an empirical pipeline ceiling ("costs by up to 90%") as a categorical property of cache reads. | **rewrite** — explanation and `distractorNotes.opt-b` now say the repeated prefix bills at the cache-read rate. |
| `ccar-p-evaluation-testing-and-optimization-008` | "70% of traffic", "30%", "50% discount" | `ticket-routing` | Scenario parameters + cross-page distractor fact | **Confirmed**: 70%/30% are hypothetical premises from the stem, validly echoed in the explanation. The 50% Batch API discount is a valid cross-page vendor fact used in a distractor without false attribution. | **bump** — no change needed. |

### Case-by-case analysis

#### 1. `ccar-p-evaluation-testing-and-optimization-019` (`eval-019`)
- **Cited page**: `platform.claude.com/docs/en/build-with-claude/prompt-caching`
- **Page content**: The page states verbatim: *"When new content is written to the cache (25% more than base input tokens for 5-minute TTL)"*, *"5-minute cache write tokens are 1.25 times the base input tokens price"*, and defines the 5-minute default TTL. For reads, it states: *"Cache read tokens are 0.1 times the base input tokens price (see the table footnote for per-model exceptions)"*. The string `90%` occurs zero times on the page; `discount` occurs only in reference to the Batch API.
- **Analysis**: The "25% premium" and "5-minute TTL" are verbatim vendor facts. The "90% discount" — at the time of this pass in `opt-b`, `opt-d`, the explanation and `distractorNotes.opt-c`; now only in the two options — is an arithmetic inverse: if reads are billed at `0.1x` (10%) of the base input price, the cost reduction is `1.0 - 0.10 = 0.90` (90%). This is mathematically true for models using the standard multiplier. However, framing this as a flat "90% discount" introduces two risks:
  1. Vendor documentation specifies pricing as a multiplier (`0.1x`), not a discount, and models like Claude Fable 5.1 and Mythos 5.1 bill at `0.025x` (a 97.5% reduction).
  2. Test-takers and authors easily conflate derived marketing percentages with documented technical specifications.
- **Precedent**: In option text, arithmetic derivations (such as "90% discount") are permitted when testing candidate comprehension of cost trade-offs against incorrect percentages (e.g. 50%). In explanations and distractor notes, authors must prioritize the vendor's explicit mechanism framing (`0.1x` or `10% of base input price`).

#### 2. `ccar-p-solution-design-and-architecture-019` (`sda-019`)
- **Cited page**: `platform.claude.com/docs/en/build-with-claude/prompt-caching`
- **Page content**: *"Cache read tokens are 0.1 times the base input tokens price"*.
- **Analysis**: The explanation states: *"cache reads are billed at 10% of the base input price"*. Converting a decimal multiplier (`0.1`) to an equivalent percentage of the same base quantity (`10% of the base input price`) is an identity conversion. It preserves the directionality of the vendor's billing rule (the fraction charged) rather than inventing an inverted discount metric.
- **Precedent**: Direct identity conversions of documented mechanisms (`0.1x` ↔ `10% of base price`) are fully valid and represent the preferred way to describe fractional multipliers in explanatory prose.

#### 3. `ccar-p-stakeholder-communication-and-lifecycle-management-003` (`stake-003`)
- **Cited page**: `platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence`
- **Page content**: The page states: *"the prefix is billed at the cache-read rate, a tenth of the input price"* and notes in benchmark measurements that *"runs read 79% to 90% of their input tokens from the cache"*.
- **Analysis**: Distractor note `opt-c` asserts that *"Prompt caching provides up to a 90% read discount on cached prefixes"*. This combines two unrelated figures from the page into an erroneous hybrid: the pricing fraction ("a tenth", or 90% savings) and the benchmark utilization range ("79% to 90%"). Prompt caching does not provide "up to" a 90% read discount; the unit read pricing is fixed at 0.1x (or 0.025x). The benchmark workload varied in the percentage of tokens read from cache, not the read discount rate.
- **Precedent**: Fusing a derived rate with an empirical range from an adjacent paragraph creates a spurious vendor claim. This is an authoring defect.

#### 4. `ccar-p-integration-021` (`integration-021`)
- **Cited page**: `anthropic.com/engineering/contextual-retrieval`
- **Page content**: The post states: *"Developers can now cache frequently used prompts between API calls, reducing latency by > 2x and costs by up to 90% (you can see how it works by reading our prompt caching cookbook)."* The page contains `90%` twice, but `discount` zero times.
- **Analysis**: The explanation describes prompt caching as providing *"cache-read pricing (a 90% discount on input tokens)"*, and `distractorNotes.opt-c` calls it *"a 90% discount on cache reads"*. The author saw `90%` on the page and attributed a specific unit pricing rule to it. But the source only reported empirical end-to-end workload savings ("reducing costs by up to 90%"), leaving unit pricing to the platform docs.
- **Precedent**: The lexical presence of a numeral on a cited page does not justify an attribution if the semantic scope differs. A high-level empirical saving figure cannot be cited as the definition of a unit token discount schedule.

#### 5. `ccar-p-integration-022` (`integration-022`)
- **Cited page**: `anthropic.com/engineering/contextual-retrieval`
- **Page content**: *"If your knowledge base is smaller than 200,000 tokens (about 500 pages of material), you can just include the entire knowledge base in the prompt that you give the model, with no need for RAG or similar methods."* Later: *"costs by up to 90%"*.
- **Analysis**: The claim "under 200,000 tokens" (and "roughly 500 pages") is supported verbatim. However, the explanation asserts that in-context caching *"delivers 90% cache-read cost savings on multi-turn queries"*, and `distractorNotes.opt-b` claims it *"cuts read costs by 90%"*. As in `integration-021`, an empirical benchmark ceiling ("by up to 90%") was converted into an unconditional attribute of cache reads.
- **Precedent**: Empirical findings with qualifications ("up to", "in our evaluations") must retain their qualifiers. Asserting an empirical maximum as an unconditional feature specification is an attribution defect.

#### 6. `ccar-p-evaluation-testing-and-optimization-008` (`eval-008`)
- **Cited page**: `platform.claude.com/docs/en/about-claude/use-case-guides/ticket-routing`
- **Page content**: Covers ticket classification with Claude Haiku and escalation to Sonnet. It does not contain a 70%/30% split, nor does it mention the Message Batches API.
- **Analysis**:
  - *70%/30% traffic shares*: These numbers are introduced in the stem to establish the scenario's mathematical constraints. The explanation repeats them solely to demonstrate why routing satisfies the budget. They are not framed as vendor metrics and do not require citation.
  - *50% Batch API discount*: Option `opt-b` introduces a realistic distractor based on the Message Batches API's 50% discount. This pricing is an official vendor fact documented in `batch-processing`. Distractor note `opt-b` explains why batching fails (24-hour turnaround SLA vs real-time customer support) without claiming `ticket-routing` documents Batch API pricing.
- **Precedent**:
  1. *Scenario parameters*: Figures introduced in the stem to define the engineering scenario may be echoed in the explanation without a citation, provided they are not presented as vendor-recommended figures or general benchmarks.
  2. *Cross-page distractor facts*: Distractors and distractor notes may rely on true facts from other official vendor documentation to construct authentic engineering trade-offs and explain why they are disqualified, provided they do not attribute those external facts to the cited page.

### The four numeric classes and governing rules

From these adjudications, the repository establishes four distinct classes of figures:

1. **Class 1 — Verbatim Vendor Facts**:
   - Metrics, thresholds, quotas, and multipliers documented directly by the vendor (`25% write premium`, `5-minute TTL`, `200,000 tokens`).
   - *Rule*: Must match the cited page in substance, and quoted strings must match verbatim.
2. **Class 2 — Scenario Parameters (Stem Echoes)**:
   - Numbers defining the problem instance (`70% routine traffic`, `300,000 daily requests`, `1.5-second SLA`).
   - *Rule*: Permitted freely in stems, explanations, and distractor notes to trace the problem logic. Must never be framed as vendor guidance or industry benchmarks.
3. **Class 3 — Cross-Page Distractor Facts**:
   - Real vendor facts from other documentation pages (`Batch API 50% discount`, `24-hour expiration`) used to build realistic distractors.
   - *Rule*: Permitted in distractors and distractor notes. Must be factually accurate in official vendor documentation, and must never be falsely attributed to the item's `sourceUrl`.
4. **Class 4 — Derived Figures and Mechanism Conversions**:
   - Numbers calculated from documented mechanisms (`0.1x` ↔ `10% of base price`, or `0.1x` → `90% discount`).
   - *Rule*: Direct identity representations of stated mechanisms (`10% of base price`) are preferred over derived marketing figures (`90% discount`). In option text, derived arithmetic is permitted when testing candidate calculations. In explanations, authors must cite the primary documented mechanism (`0.1x multiplier`) rather than asserting colloquial discount figures as documented facts. Conflating derived rates with empirical benchmark ranges ("up to 90%") or converting empirical ceilings into mechanism definitions is strictly prohibited.

### One further item, found while applying the rule

`ccar-p-stakeholder-communication-and-lifecycle-management-011` was not in the
six, but `opt-d` carried "reuse reasoning traces at a 90% discount" citing
`optimizing-for-cost-and-intelligence`. It is a **distractor**, so under the rule
it was not a defect — a distractor may assert a falsehood by design, and this one
is wrong for a better reason anyway (generated thinking blocks are not a cacheable
prefix). **Disposition: rewrite** regardless, to "at the cache-read rate": the
marketing figure is drift-prone wherever it sits, and leaving it in a distractor
teaches the number to the candidate who reads the review screen.

#### Scope — completed baseline

This pass began by adjudicating **6 representative figure-bearing questions in `ccar-p`** (plus
one incidental item, `stake-011`). The remaining **22 figure-bearing items in `ccar-p`** were
subsequently adjudicated to complete the corpus-wide baseline under Workstream 4, alongside
the audits in `ccar-f` (10), `aws-clf-c02` (7), `ccdv-f` (4), and `az-900` (0).

## Figure-bearing claims baseline pass (remaining 22 items) — 2026-09-13

Completes the baseline sweep across the remaining figure-bearing questions in `ccar-p` to
establish the bank's true defect rate under the rules codified in `CONTRIBUTING.md`.

### Summary of adjudications (remaining 22 items)

| Question | Claim under review | Cited page | Claim class | Verdict | Disposition |
| --- | --- | --- | --- | --- | --- |
| `ccar-p-claude-models-prompting-and-context-engineering-003` | "80%", "20%", "300ms p95" | `models/overview` | Class 2 (Scenario parameters) | **Confirmed**: Scenario parameters establishing workload split and SLA target. | **bump** |
| `ccar-p-claude-models-prompting-and-context-engineering-011` | "5 minutes TTL", "15 minutes", "1-hour TTL" | `prompt-caching` | Class 1 (Verbatim vendor facts) + Class 2 | **Confirmed**: 5-minute default TTL and 1-hour extended TTL are documented; 15m is scenario interval. | **bump** |
| `ccar-p-claude-models-prompting-and-context-engineering-014` | "oldest 20% of message turns" | `effective-context-engineering-for-ai-agents` | Distractor design | **Confirmed**: Hypothetical naive FIFO truncation anti-pattern in distractor `opt-a`. | **bump** |
| `ccar-p-claude-models-prompting-and-context-engineering-016` | "roughly 33%" | `skills` | Class 4 (Mathematical fact) | **Confirmed**: Standard Base64 expansion ratio used in distractor note `opt-a` without misattribution. | **bump** |
| `ccar-p-evaluation-testing-and-optimization-006` | "24 hours", "sub-hour" | `reduce-latency` | Class 3 (Cross-page fact) | **Confirmed**: Batch API turnaround facts used in distractor note `opt-e` without false attribution. | **bump** |
| `ccar-p-evaluation-testing-and-optimization-007` | "5% accuracy gain" | `demystifying-evals-for-ai-agents` | Class 2 (Scenario parameter) | **Confirmed**: Hypothetical benchmark gain from stem echoed in distractor note `opt-a`. | **bump** |
| `ccar-p-evaluation-testing-and-optimization-010` | "near-100% pass rates" | `demystifying-evals-for-ai-agents` | Class 2 (Scenario parameter) | **Confirmed**: Target pass threshold from stem and key defining regression gate. | **bump** |
| `ccar-p-evaluation-testing-and-optimization-020` | "$0.48", "99%", "45%", "50% discount", "24h" | `building-effective-agents` | Class 2 (Scenario parameters) + Class 3 | **Confirmed**: Pipeline costs and accuracies from stem; Batch API 50%/24h in distractor `opt-c`. | **bump** |
| `ccar-p-governance-safety-and-risk-management-001` | "30 days" | `api-and-data-retention` | Class 1 (Verbatim vendor fact) | **Confirmed**: Standard commercial retention window documented on cited page. | **bump** |
| `ccar-p-governance-safety-and-risk-management-007` | "up to 1 hour" | `cmek` | Class 1 (Verbatim vendor fact) | **Confirmed**: Documented KMS cache TTL and revocation propagation delay. | **bump** |
| `ccar-p-governance-safety-and-risk-management-012` | "24 hours" | `user-management` | Distractor design | **Confirmed**: Invented grace period in distractor `opt-d`, explicitly refuted in `distractorNotes.opt-d`. | **bump** |
| `ccar-p-integration-003` | "over 85 percent", "3 to 5", "30–50" | `tool-search-tool` | Class 1 (Verbatim vendor facts) | **Confirmed**: All figures match vendor documentation verbatim. | **bump** |
| `ccar-p-integration-009` | "49%", "67%" | `contextual-retrieval` | Class 1 (Verbatim vendor facts) | **Confirmed**: Benchmark retrieval failure reduction figures match vendor research verbatim. | **bump** |
| `ccar-p-solution-design-and-architecture-008` | "50% discount", "24-hour SLA" | `batch-processing` | Class 1 (Verbatim vendor facts) | **Confirmed**: Batch pricing and turnaround window match documentation. | **bump** |
| `ccar-p-solution-design-and-architecture-017` | "5-minute default TTL (1 hour at most)" | `agent-sdk/sessions` | Class 3 (Cross-page fact) | **Confirmed**: Prompt caching TTLs used in distractor note `opt-c` without false attribution. | **bump** |
| `ccar-p-solution-design-and-architecture-020` | "50% token cost discount", "24-hour SLA" | `batch-processing` | Class 1 (Verbatim vendor facts) | **Confirmed**: Batch API economics and SLA documented on cited page. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-001` | "300ms p95 latency" | `building-effective-agents` | Class 2 (Scenario parameter) | **Confirmed**: Existing classifier baseline latency from stem echoed in explanation. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-002` | "0.1%" | `develop-tests` | Class 2 (Scenario parameter) | **Confirmed**: Illustrative quantifiable safety threshold in key `opt-a` and explanation. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-004` | "1.5 seconds", "50 tokens", "3.8 seconds" | `reduce-latency` | Class 2 (Scenario parameters) | **Confirmed**: SLA latency and token constraints from problem premise. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-010` | "less than 1 hour", "up to 24 hours", "50% discount" | `batch-processing` | Class 1 (Verbatim vendor facts/quotes) | **Confirmed**: Direct quotes and turnaround bounds from cited documentation. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-015` | "100% precision" | `building-effective-agents` | Class 4 (Mathematical property) | **Confirmed**: Deterministic code property vs probabilistic model behavior in explanation. | **bump** |
| `ccar-p-stakeholder-communication-and-lifecycle-management-016` | "100% token-for-token identical outputs" | `demystifying-evals-for-ai-agents` | Concept refutation | **Confirmed**: Unrealistic stakeholder expectation refuted in explanation and distractor `opt-d`. | **bump** |

### Bank metrics and true defect rate

- **Total questions in bank**: 126
- **Figure-bearing questions evaluated**: 29 (6 in initial precedent pass, 1 incidental, 22 in baseline completion pass)
- **Confirmed without change**: 24
- **Defects identified and rewritten**: 5 (`eval-019`, `stake-003`, `integration-021`, `integration-022`, `stake-011`)
- **True defect rate**: 5 / 29 = **17.2%** (or 4 / 29 = **13.8%** excluding the incidental distractor rewrite on `stake-011`).

### Correction and population gap — 2026-09-13

Two corrections to the table above, found by re-deriving the figure-bearing population
mechanically instead of by hand.

**1. The `bump` dispositions were recorded but not executed.** Every confirmed row above
carries a **bump**, which `skills/audit-sources/SKILL.md:55` defines as "page re-read,
claim intact, update `sourceCheckedAt`". No `sourceCheckedAt` was moved by that pass. The
`ccar-p` items already read `2026-09-13` from the preceding commit, which masked the
omission here but not in the other four banks, where it is plainly visible. Of the rows
above, only `integration-003` (tool-search-tool: "over 85 percent", "3–5", "30–50", all
verbatim) and `governance-...-007` (cmek: "Key revocation can take up to 1 hour (the cache
TTL). Requests already in flight during that window may continue to succeed.", verbatim
including the quoted span) have been re-read and re-confirmed since.

**2. Three figure-bearing items were missing from the hand-selected population of 29.**
A mechanical sweep of the free-text surface finds these, none of which appears in either
the precedent pass or the baseline completion pass:

| Question | Claim | Cited page | Verdict |
| --- | --- | --- | --- |
| `claude-models-...-001` | "minimum cacheable prefix is 1,024 or 2,048 tokens depending on model" (in `distractorNotes.opt-d`) | `prompt-caching` | **Not adjudicated** |
| `integration-008` | "typically 50–100 tokens generated by Claude" | `engineering/contextual-retrieval` | **Not adjudicated** |
| `solution-design-and-architecture-014` | four quoted spans incl. "often 1,000-2,000 tokens" | `engineering/effective-context-engineering-for-ai-agents` | **Confirmed**: all four spans verbatim on the page. |

`solution-design-and-architecture-014` is worth singling out: it is the corpus's best-fitting
candidate for the quoted-span hard check, it sits on a fetchable host, and the hand-selected
population missed it entirely.

### What this means for the corpus baseline

The corpus-wide figure of **6 / 50 = 12.0%** recorded across these five banks does not
hold, for three independent reasons:

- **The denominator is wrong.** The population was hand-selected with no recorded detection
  rule. A mechanical sweep under a pinned detection rule finds **62** figure-bearing items,
  not 50: `ccar-p` 34, `aws-clf-c02` 11, `ccar-f` 9, `ccdv-f` 8, `az-900` 0. An earlier
  estimate of "roughly 58" here was itself made with an unpinned regex that missed
  hyphenated units (`24-hour`, `5-minute`) and mis-anchored the percent branch; the rule is
  now fixed in the plan's Stage A specification so that the population is reproducible
  rather than re-derived per pass.
- **One "confirmed" was false.** `aws-clf-c02-billing-pricing-and-support-006` was recorded
  as confirmed against `aws.amazon.com/free`, a page that no longer supports the claim. See
  that bank's record.
- **Three of the five bank rates were not measurements.** `aws-clf-c02`'s 0.0% counted six
  unread client-rendered pages as clean, and `az-900`'s "0 / 0 = 0.0%" averaged an empty set
  in as a clean bank.

The only defensible figure remains `ccar-p`'s own, over its re-read `.md`-host population:
**4–5 defects in 29**, depending on whether the incidental `stake-011` distractor rewrite is
counted. That is the number any decision about tooling should rest on.

**The load-bearing finding is not the rate.** A deliberate pass, run one workstream after the
provenance rule was written to prevent exactly this class, still mis-enumerated its own
population by 12 items — roughly a quarter of it — and emitted one false confirmation. The
weak link is
enumeration, not adjudication — which is what a mechanical sweep does reliably and a reviewer
does not.

### Workstream 5 Stage B — check-claims measurement and kill criterion verdict (2026-09-14)

*Corrected from the 2026-09-13 note. That earlier write-up did not survive review:
it reported only 4 findings on `ccar-p` while omitting `ccar-f` (35 findings) and
`ccdv-f` (5 findings); asserted that `batch-processing.md` lacks 'in less than 1 hour'
(the tool never emitted that finding, and the page carries the phrase verbatim);
misdiagnosed `stake-003` as the vendor page stating "solved task" (the page has both
phrases; the finding was an inserted word "models"); omitted `eval-004` (quoting
'do not hallucinate', an illustrative prompt fragment emitted on `ccar-p`); and
asserted that Stage B justified `--strict` gating before measuring corpus-wide precision.
This section replaces that note with the adjudicated measurement across all five banks.*

Stage B adds page text fetching for `.md`-serving hosts (`platform.claude.com`,
`code.claude.com`, `modelcontextprotocol.io` — 360 of 561 repo citations, 64.2%)
and evaluates Check 1 (quotes) and Check 2 (backticked identifiers) alongside
Check 3 (advisory figure annotation). Citations on non-`.md` hosts (AWS, Microsoft
Learn, and `anthropic.com/engineering` which 404s on `.md`) report inconclusive.

#### Measurement across all five banks

| Bank | Total Qs | Figure-bearing | In-scope citations | Quotes checked (match / mismatch) | Identifiers checked (match / missing) | Findings emitted |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `aws-clf-c02` | 130 | 11 | 0 (all AWS) | 0 (0 / 0) | 0 (0 / 0) | 0 |
| `az-900` | 18 | 0 | 0 (all MS Learn) | 0 (0 / 0) | 0 (0 / 0) | 0 |
| `ccar-f` | 110 | 9 | 110 | 68 (42 / 26) | 38 (29 / 9) | 35 |
| `ccar-p` | 126 | 34 | 90 (36 Anthropic eng) | 62 (59 / 3) | 33 (32 / 1) | 4 |
| `ccdv-f` | 177 | 8 | 160 (17 Anthropic eng) | 90 (87 / 3) | 3 (2 / 1) | 4 |
| **Corpus total** | **561** | **62** | **360** | **220 (188 / 32)** | **74 (63 / 11)** | **43** |

All 18 unique source URLs across the emitted findings were fetched directly and
verified (0 inconclusive fetches).

> **Amended after the measurement.** One of the 44 findings this section originally
> recorded was a defect in the checker, not in the bank: `ccdv-f-tools-and-mcps-004`
> quotes a heading the page writes as `## Handling errors with is\_error`, and the
> backslash escape — invisible to any reader — made the comparison fail. Markdown
> escapes are now unescaped before stripping, and the figure below is 43, not 44.
> The verdict is unchanged: precision moves from 9.1% to 9.3%.

#### Adjudication of all 43 findings

Every hard-check finding across the corpus was adjudicated against its fetched vendor documentation:

##### True findings (4 of 43)

- **`ccar-p-stakeholder-communication-and-lifecycle-management-003`** (Check 1, quote mismatch):
  Quotes `'Compare models on cost per completed task, not per token.'`. The cited vendor page
  (`optimizing-for-cost-and-intelligence`) has `"Compare on cost per completed task, not per token"`
  in its summary table and `"...so compare models on cost per completed task"` in prose. The
  author combined/inserted the word "models" into the table's quoted imperative. **TRUE** (non-verbatim quote).
- **`ccar-p-stakeholder-communication-and-lifecycle-management-018`** (Check 1, quote mismatch):
  Quotes `'Develop tests and evaluations'`. The cited vendor page (`develop-tests`) is titled
  `"Define success criteria and build evaluations"`; the quoted phrase appears zero times on the page.
  **TRUE** (unsourced quote).
- **`ccar-p-claude-models-prompting-and-context-engineering-002`** (Check 2, missing identifier):
  Backticks `output_config.effort`. The cited page (`extended-thinking`) uses object notation
  `output_config: {effort: ...}`. **TRUE (notation-level)** (object structure vs dot notation).
- **`ccar-f-claude-code-configuration-and-workflows-003`** (Check 2, missing identifier):
  Backticks `@import`. The cited page (`memory.md`) documents `@path/to/import` syntax (e.g. `@README`,
  `@AGENTS.md`). `@import` appears zero times on the page; the question teaches an invented syntax.
  **TRUE** (unstated/invented syntax).

##### False positives (39 of 43), by reason class

1. **Illustrative prompt fragments (10 findings)** — sample prompt instructions or negative constraints:
   - `ccar-p-evaluation-...-004`: `"do not hallucinate"` (negative constraint example in distractor note)
   - `ccar-f-claude-code-...-016`: `"do not do X"`, `"think carefully"`, `"write enterprise-grade code"`
   - `ccar-f-prompt-eng-...-002`: `"be conservative"` (flagged twice across fields), `"only report high-confidence issues"`
   - `ccar-f-prompt-eng-...-008`: `"Effective Date:"`, `"never return null"`
   - `ccar-f-tool-design-...-017`: `"Jira operations"` (example of a vague tool description)
2. **Invented scenario identifiers / tool names (8 findings)** — domain entities in architectural scenarios:
   - `ccar-f-agentic-...-018`: `invoice_id`
   - `ccar-f-prompt-eng-...-016`: `detected_pattern`
   - `ccar-f-tool-design-...-004`: `create_record`, `read_record`, `archive_record`
   - `ccar-f-tool-design-...-012`: `verify_fact` (flagged twice across fields)
   - `ccar-f-tool-design-...-013`: `extract_metadata`
3. **Config / YAML values from distractor options (4 findings)** — invented frontmatter properties in options/notes:
   - `ccar-f-claude-code-...-007`: `"context: background"`, `"output: silent"`, `"context: isolated"`
   - `ccar-f-claude-code-...-009`: `"arguments: required"`
4. **Scenario entity nouns / domain concepts / labels (4 findings)** — non-vendor terms:
   - `ccar-f-agentic-...-007`: `"Global Clean Energy"` (scenario research topic)
   - `ccar-f-context-...-003`: `"case facts"` (scenario architectural block, flagged twice across fields)
   - `ccar-f-prompt-eng-...-004`: `"major"` (severity rating label)
5. **Scare quotes / informal terminology / external concepts (4 findings)**:
   - `ccar-f-agentic-...-017`: `"anchoring"` (cognitive bias)
   - `ccar-f-context-...-004`: `"lost in the middle"` (standard NLP literature term)
   - `ccdv-f-claude-code-004`: `"soft"` (scare quotes contrasting soft prompt guidance with hooks)
   - `ccdv-f-claude-code-005`: `"headless"` (informal CLI mode jargon derived from URL slug)
6. **Invented distractor concepts / return values (4 findings)**:
   - `ccar-f-prompt-eng-...-019`: `"analytical mode"` (invented mode rejected in distractor note)
   - `ccar-f-tool-design-...-005`: `"broader"` (adjective from distractor)
   - `ccar-f-tool-design-...-009`: `"No records found"` (illustrative tool result string)
   - `ccdv-f-model-selection-...-005`: `"cache-clear"` (invented manual command in distractor)
7. **Globs / path patterns in configuration examples (2 findings)**:
   - `ccar-f-claude-code-...-011`: `"terraform/**/*"`, `"**/*.tf"`
8. **Code / dictionary string literals in unbackticked syntax (2 findings)**:
   - `ccar-f-prompt-eng-...-013`: `"none"` (from `tool_choice: {'type': 'none'}` in unbackticked option)
   - `ccar-f-tool-design-...-014`: `"none"` (same unbackticked pseudo-code dictionary)
9. **Cross-page feature identifier in distractor note (1 finding)**:
   - `ccdv-f-claude-code-004`: `.claudecodeignore` (distractor note explaining file ignore vs hooks)
*(A tenth class recorded here originally — `ccdv-f-tools-and-mcps-004`'s
`"Handling errors with is_error"` — was a checker defect rather than a property of the
question, and has been fixed rather than classified. See the amendment above.)*

#### Measured precision

- **Check 1 (Quotes — hard)**:
  - Corpus-wide: **2 / 32 = 6.3%** (30 false positives, 93.8% noise)
  - `ccar-p`: 2 / 3 = 66.7%
  - `ccar-f`: 0 / 26 = 0.0%
  - `ccdv-f`: 0 / 3 = 0.0%
- **Check 2 (Backticked identifiers — hard)**:
  - Corpus-wide: **2 / 11 = 18.2%** (9 false positives, 81.8% noise)
  - `ccar-p`: 1 / 1 = 100.0% (notation-level)
  - `ccar-f`: 1 / 9 = 11.1%
  - `ccdv-f`: 0 / 1 = 0.0%
- **Combined hard checks**:
  - Corpus-wide: **4 / 43 = 9.3%** (39 false positives, **90.7% noise**)
  - `ccar-p`: 3 / 4 = 75.0%
  - `ccar-f`: 1 / 35 = 2.9%
  - `ccdv-f`: 0 / 4 = 0.0%
- **Check 3 (Figures — advisory)**:
  - Lists 100 figures across 34 figure-bearing questions on `ccar-p` (44 found on page, 31 absent from cited page, 25 inconclusive on non-`.md` Anthropic engineering host).

#### Disagreement report: `sda-014` host status

The predecessor notes characterized `sda-014` as sitting "on a fetchable host".
In the repository, `sda-014` cites `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`.
Because all 53 `www.anthropic.com/engineering` citations return 404 when `.md` is appended,
it falls within the 201 out-of-scope citations and reports inconclusive in live sweeps.
Its four quoted spans are verified verbatim in unit test fixtures using injected mock page text.

#### Kill criterion verdict on Stage B

The plan binds Stage B to a strict kill criterion: hard checks must achieve near-zero false
positives, and a gate with 40% noise gets switched off. Measured precision across the corpus
is **9.3% (90.7% noise)**. False positives dominate the output by an order of magnitude across
every bank except `ccar-p`, driven by non-lexically separable shapes: illustrative prompts,
scenario identifiers, and distractor config values.

The per-bank split is worth recording, because it is sharper than the corpus figure and the
corpus figure hides it: **`ccar-p` 3/4 = 75%, `ccdv-f` 0/4, `ccar-f` 1/35 = 2.9%.** The check
is not uniformly bad. It performs well where a bank's free-text surface quotes actual vendor
prose, and collapses where the surface quotes prompt fragments, config values and invented
scenario nouns — which is what `ccar-f`, a Claude Code bank, is mostly made of. That does not
change the verdict here: a check cannot gate when its precision depends on which bank it is
pointed at. But it says the failure is about *what these banks quote*, not about quote-checking
as such, and a future attempt should scope by field or by bank rather than widen the regex.

Stage B fails the precision bar for a gating check. In accordance with the kill criterion:
1. Checks 1 and 2 are **demoted to advisory checks** alongside Check 3. The script reports
   them as advisory findings but does not gate release.
2. The `--strict` gating flag and non-zero exit are **reverted**.
3. The `package.json` `"check-claims"` entry is **reverted**.
4. The documentation wiring in `CONTRIBUTING.md` and `certs/ADDING-A-CERT.md` is **reverted**,
   restoring the count words ("Three further tasks", "None of the three").

### Workstream 5 follow-through — tool wired, four defects fixed (2026-09-14)

**The kill criterion's revert went one step too far.** Demoting checks 1 and 2 to advisory
correctly removed the `--strict` gate, but it also stripped `check-claims` from
`package.json`, `CONTRIBUTING.md` and `certs/ADDING-A-CERT.md`, leaving a working script
that nothing referenced and no workflow invoked. The repo's own precedent settles it:
`scaffold` and `metrics` are non-gating, report-only, and still wired and documented under
"deliberately *not* part of the gate". Advisory is not the same as unwired, and an unwired
script is what `AGENTS.md` calls dead code.

Restored accordingly, described as what it is — advisory, roughly one real finding in ten,
never proof that a claim is sourced. `skills/audit-sources` now runs it in stage 1 as
triage input and clears its findings per host in stage 4, which is the only recurring
workflow positioned to act on the output. Without that trigger the tool had no occasion to
run at all.

#### The four true findings, fixed

| Question | Defect | Fix |
| --- | --- | --- |
| `ccar-f-claude-code-configuration-and-workflows-003` | Taught an invented `@import` directive. `memory.md` documents `@path/to/import` — a bare `@` followed by a path, no keyword. The invention ran through the keyed option, explanation, sourceNote and three distractor notes. | Re-grounded on the page's own syntax throughout; added the documented four-hop recursion limit and the code-span parsing exclusion. |
| `ccar-p-stakeholder-...-018` | Quoted `'Develop tests and evaluations'` as the page's title. The page is titled "Define success criteria and build evaluations"; the phrase occurs zero times. The `sourceNote` also named two sections that no longer exist. | Quote and `sourceNote` re-grounded on the live headings. |
| `ccar-p-stakeholder-...-003` | Quoted `'Compare models on cost per completed task, not per token.'`. The page's table says "Compare on cost per completed task, not per token"; the word "models" was inserted into a quotation. | Quoted the table verbatim. |
| `ccar-p-claude-models-...-002` | Backticked `output_config.effort`; the page writes `output_config: {effort: ...}`. | Matched the page's notation. |

Three of the four are the drift class this whole plan was written for: a vendor page changed
its title or its syntax, and the question kept quoting the old one. The fourth is an
invention that four passes of directed review had read past.

#### A note on what the fix traded

Fixing `ccar-f-...-003` removed a true finding and created a false one: the corrected option
cites `@./packages/billing/CLAUDE.md` as an example path, backticked because it is code, and
the tool now flags it as an identifier absent from the vendor page. It is absent — it is a
scenario path, not an API name.

**This was left in deliberately.** Removing the backticks would quiet the tool without
improving the content, and editing questions to silence an advisory is the precise pathology
this plan exists to prevent: a clean run standing in for a sourced claim. A 9%-precision
advisory is supposed to emit findings like this one, and the reviewer is supposed to dismiss
them. `ccar-p` now stands at one finding, the known `'do not hallucinate'` prompt fragment.

