# Claude Certified Architect – Professional review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

Recon completed and scaffolded on 2026-09-12 based on the Claude Certified Architect –
Professional Exam Guide v1.0 (Effective July 2026, Exam code: CCAR-P). Sources verified
and architectural judgement renovation completed on September 25, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-13 following coverage audit and human confirmation.
The bank contains 126 questions (all 126 `status: "reviewed"`, 0 `draft`), achieving exactly 2× the 63-question
exam baseline proportionally distributed across all seven domains to match blueprint weights with zero delta
(21 / 16 / 24 / 20 / 18 / 18 / 9). All 126 questions have undergone adversarial correctness evaluation (`evaluate-questions`)
and constraint-based renovation. All quality, balance, and bias guards pass cleanly. Coverage status is `stable`;
it is not a measured claim of live-exam difficulty equivalence.

## Recon verdict: `GO-WITH-CONSTRAINTS`

The certification assessment approved a **GO-WITH-CONSTRAINTS** verdict:

- The official exam guide is publicly accessible without credentials or registration.
- Domain weights are explicitly defined integers that sum to exactly 100%.
- Public, authoritative vendor documentation covers the technical competencies across all domains.
- Question format is standard single- and multiple-response, requiring no schema extensions.

**Named constraints:**

1. **Thin official sample question inventory**: The vendor exam guide provides only 3 illustrative sample questions in Section 8. Cognitive level calibration relies additionally on third-party practice material under the calibration firewall.
2. **Domain 6 documentation anchoring**: Domain 6 (Stakeholder Communication & Lifecycle Management, 14%) covers discovery, architectural tradeoff communication, SLAs, and lifecycle phases. Questions must be strictly anchored in Anthropic's public architectural guidance ("Building effective agents", deployment patterns, Enterprise/ZDR agreements) rather than unanchored enterprise consulting trivia.

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

## Composition and coverage audit

Audited against the 126-question bank (post-renovation and evaluation pass):

- **Distribution**: Proportional across all 7 domains (21 / 16 / 24 / 20 / 18 / 18 / 9, 0 delta against 2× target).
- **Item formats**: 110 single-select, 16 multi-select (all select-TWO).
- **Difficulty breakdown**: 59 medium (55 single, 4 multi), 67 hard (55 single, 12 multi).
- **Sourcing**: 59 distinct authoritative documentation pages across 5 hosts (`platform.claude.com`, `code.claude.com`, `anthropic.com/engineering`, `modelcontextprotocol.io`, and the S3 CDN blueprint).
- **Single-select position distribution**: 30 A / 30 B / 26 C / 24 D across `a`–`d` (max 27.3%, ceiling 50%).
- **Option length delta**: Mean correct-option length minus distractor length is -0.93 characters (median -0.33 characters).
- **Longest option as key share**: 23 of 110 single-select items (20.9%), well below the 45% ceiling.
- **Heuristic baselines**: "Always longest" yields 23.8% expected score; "Eliminate absolutes" yields 24.7% expected score (uniquely solving 0 of 110 items).
- **Distractor notes coverage**: 100% of distractor options across all 126 questions carry complete explanations.
- **Bias guards**: All three pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

### Known coverage limits and deliberate boundaries

- **Deprecated MCP surface**: MCP revision `2026-07-28` (SEP-2577) classified Roots, Sampling, Logging, and Dynamic Client Registration as Deprecated; HTTP+SSE transport has been deprecated since revision `2025-03-26`. The bank tests the two current transports (stdio, Streamable HTTP) and non-deprecated primitives. Two items (`integration-011`, `-023`) test Roots and Sampling because both remain in the specification until at least 2027-07-28; each explicitly notes the deprecation and migration path.
- **Deliberate perimeters and out-of-scope boundaries**:
  - _Domain 1 (Solution Design & Architecture)_: Focuses on canonical Anthropic workflows (prompt chaining, routing, parallel sectioning, orchestrator-workers, evaluator-optimizer), coordinator/subagent context isolation, and ACI tool consolidation. Excludes third-party multi-agent frameworks (LangGraph, AutoGen, CrewAI), WebRTC voice agents, and OS coordinate-level desktop automation loops.
  - _Domain 2 (Claude Models, Prompting & Context Engineering)_: Focuses on prompt caching prefix ordering/breakpoints, extended thinking reasoning budgets, XML framing, structured tool outputs, and long-context ordering. Excludes vision tile token calculation formulas, custom model distillation, and self-service fine-tuning.
  - _Domain 3 (Integration)_: Focuses on MCP primitives (Resources, Tools, Prompts), stdio and Streamable HTTP transports, Messages API tool execution mechanics, Contextual Retrieval, context editing, and programmatic tool calling. Excludes WebSocket MCP transports and cloud-provider IAM wrapper policies (Bedrock / Vertex AI IAM).
  - _Domain 4 (Evaluation, Testing & Optimization)_: Focuses on multi-grader suites (code assertions + LLM judges), `pass^k` consistency gates, CI regression vs capability suite separation, transcript-versus-outcome grading, staged evaluation (automated evals in CI, A/B testing, production monitoring), and isolated LLM judges. Excludes statistical power formulas, named third-party eval frameworks (Ragas, TruLens, DeepEval), and automated prompt search algorithms (DSPy).
  - _Domain 5 (Governance, Safety & Risk Management)_: Focuses on Zero Data Retention (ZDR), indirect prompt injection defense, Claude Enterprise Inference Hooks, Agent SDK permissions and callbacks, regional data residency (`inference_geo`), CMEK KMS key revocation (1-hour cache TTL), Compliance API eDiscovery scopes, GDPR Article 17, and SCIM immutability. Excludes HIPAA BAA contract text, FedRAMP High packages, and SIEM query syntax (Splunk SPL).
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

## Calibration principles and trade-off architecture

The bank calibrates against the professional architect standard under strict quality boundaries:

- **Anchor 2 depth**: Discriminating conceptually on failure modes, orchestration boundaries, lifecycle hooks, state persistence, and architectural tradeoffs.
- **Calibration firewall**: Matthew Purcell's 63-question practice exam was consulted solely to calibrate depth and scenario shape under the calibration firewall; no question content or distractor text derives from third-party banks.
- **Scenario trade-off structure**: Stems establish a scenario, goal, and explicit constraints ("X while maintaining Y"). Alternatives are authentic approaches that fail a particular constraint (e.g. over-engineered, solves a different problem, probabilistic when deterministic is required, or wrong layer) rather than transparent strawmen or fabricated mechanisms.
- **Deliberate headroom**: 67 hard items (53.2%) ensure deep coverage of architectural edge cases without crossing into unsourced trivia or creating ambiguous answers.

## Architectural and sourcing adjudications

Standing decisions that future authors must not rediscover:

- **Deadlines vs mechanism guarantees**: `sda-008` selects a capacity-tested standard path for an 8-hour deadline rather than claiming the Batch API guarantees completion within that window. `sda-019`/`-020` and `stake-004` distinguish first-token TTFT responsiveness from full completion. `stake-010` distinguishes batch expiration (24h) from result commitments. The current batch limit is 100,000 requests or 256 MB.
- **Operational completion vs quality**: `eval-001` separates generated-answer quality from missing-request completion evidence. `sda-013` preserves minority vulnerability candidates while corroborating disruptive blockers.
- **Caching & context boundaries**: `integration-024` places the static prefix breakpoint after system policy (tools precede system content, so a final tool marker cannot cache subsequent policy). `integration-021` checks cache availability before concurrent sibling reuse. `integration-022` full-context retrieval is justified by scenario measurements, not universal superiority over RAG. `eval-019` tests cache-duration selection, not a universal read multiplier.
- **Structured outputs vs factual correctness**: `prompting-008` combines extended thinking with schema enforcement; thinking alone does not guarantee schema conformity. `prompting-010` and `eval-011` treat token counts as estimates with headroom. `prompting-015` tests native source pointers, not cryptographic integrity. `prompting-016` pairs on-demand Skills with ambient `CLAUDE.md` invariants. String enum/const capitalization exceptions apply to structured outputs (`prompting-007`, `-008`, `-013`).
- **Tool & execution boundaries**: `integration-006` controls concurrency, not prerequisite ordering. `integration-015` client tools do not execute inside remote code containers. Messages API `is_error` and MCP `isError` remain distinct. `integration-002` tests SDK permission semantics for tool removal.
- **Governance & compliance scope**: `gov-001` distinguishes ZDR eligibility from HIPAA readiness. `gov-003` concerns Enterprise inline hooks, not Platform API. `gov-005` requires an operator callback under trusted ask rules. `gov-010` historical telemetry vs content export. `gov-011` detaching chats before project retirement. `gov-007` CMEK prospective data scope and 1-hour revocation cache delay (avoids permanence conflict).
- **Spend controls & rate limits**: `gov-013` Enterprise member limits vs Platform workspace caps. `stake-012` usage-tier spend-cap 429 without `retry-after` vs transient throughput 429. `stake-017` monthly vs throughput limits under organization ceiling. `gov-018` directory/audit vs content scopes.
- **Developer tooling boundaries**: `developer-001` dynamic approval-record check before execution. `developer-002` bare-mode discovery suppression. `developer-003` managed settings precedence. `developer-004`/`-006` conversation context vs filesystem isolation. `developer-007` reversible safe-mode diagnostics. `developer-009` stdout JSON-RPC framing corruption.
- **MCP wire methods & transports**: stdio + Streamable HTTP (`integration-010`). Origin validation and DNS-rebinding on Streamable HTTP (`integration-004`). Wire method `subscriptions/listen` + `notifications.resourceSubscriptions` (`integration-019`). Roots advisory scope (`integration-011`).

## Maintenance audits

### Figure-bearing claims baseline (2026-09-13)

Evaluated 29 figure-bearing questions against vendor documentation:

- 24 confirmed intact.
- 5 defects rewritten: `eval-019` (0.1x / 10% base price), `stake-003` (removed spurious read discount), `integration-021` (task savings vs unit pricing attribution), `integration-022` (prefix billing at cache rate), `stake-011` (cache-read rate in distractor).
- Four numeric classes established: Class 1 verbatim facts, Class 2 scenario parameters, Class 3 cross-page facts, Class 4 derived conversions. Defect rate: 5 / 29 = **17.2%**.

### Recurring source drift audit (2026-09-17)

Comprehensive drift audit across all 126 questions and 60 source pages:

- **Blueprint drift: None (0%)**. Exam guide v1.0 (July 2026, CCAR-P) re-verified on CDN. All 7 domain names, weights (17/13/19/16/14/14/7), 63 items, 120 minutes match `manifest.json` exactly.
- **Source liveness**: 0 failed URLs across 60 pages (100% HTTP 200).
- **Figure claims resolution**: 100 checks across 34 items confirmed (54 Class 1, 35 Class 2, 10 Class 3, 1 Class 4).
- **Dispositions**: All 126 items received an explicit **bump** disposition; `sourceCheckedAt` advanced to `2026-09-17`. Defect rate: 0 / 126 = **0.0%**.

### Architectural judgement renovation & cold evaluation (2026-09-25)

Bank-wide renovation addressing recognizability and trade-off depth:

- **Authoring dispositions**: 102 rewrites, 13 repairs, 3 replaces, 8 keeps. Only `architecture-008` moved key (`d` → `a`) to resolve a deadline contradiction.
- **Independent adversarial evaluation**: All 126 answer sets derived independently before reading keys/rationales. 113 confirmed, 13 fixed-and-confirmed (`architecture-017`, `prompting-007`, `-008`, `-013`, `integration-005`, `-012`, `-016`, `eval-002`, `-003`, `-007`, `-010`, `-014`, `-015`). 0 miskeys.
- **Final bank status**: All 126 items confirmed `status: "reviewed"`. Difficulty shifted to 59 medium / 67 hard. All bias guards pass cleanly.
