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

### Real-exam calibration: Tool Design & MCP Integration hardening (2026-09-24)

Two people (the maintainer, and a colleague) sat the live CCAR-F exam and both
barely passed (~740/1000 and 764/1000), reporting it harder than expected and
scenario options "much closer to each other" than the bank's — the opposite
signal from `certs/ccdv-f`, where the real exam felt easier than the bank.
Per the calibration firewall, this informed *how* to harden distractors, never
what any option says.

Ran `harden-domain-questions` against `tool-design-and-mcp-integration`
(22 items) with this signal in mind. Domain 2's sample anchor is sample
Question 2 (`get_customer` vs `lookup_order`), matched near-verbatim by
`tool-...-002`, which was left untouched as the anchor itself. `tool-...-012`
mirrors sample Question 9 (`verify_fact` scoped tool) and was also left as-is.

Six items had a distractor eliminable without domain knowledge — either an
invented mechanism (a nonexistent config path, an "alphabetical tool
ordering" claim, a fabricated stdio restriction) or a facepalm-shaped protocol
technicality — and were hardened by replacing that option with a real
mechanism misapplied to the scenario, verified against the cited source
(re-fetched `mcp.md` and `define-tools.md` on 2026-09-24) rather than
invented:

- **`tool-...-001`**: distractor `d` (invented `.claude/config.json` path)
  replaced with the *local* scope entry in `~/.claude.json` — a real scope
  that is easy to confuse with the shared *project* scope (`.mcp.json`)
  because both nominally describe "this project."
- **`tool-...-005`**: distractor `d` (alphabetical tool-name ordering)
  replaced with "description quality alone should have overridden the
  keyword bias" — plausible but wrong because selection weighs prompt,
  description, and query together.
- **`tool-...-009`**: distractor `c` (schema-omission trivia) replaced with
  an HTTP-204-style near miss — a real convention from a different transport
  applied to MCP's JSON-RPC results.
- **`tool-...-010`**: distractor `d` (invented sequential array evaluation)
  replaced with an auto-compaction near miss — a real Claude Code mechanism,
  wrong because it is a multi-turn effect, not a per-call selection cause.
- **`tool-...-013`**: distractor `a` (invented sequential tool-list reading)
  replaced with `input_examples` misapplied as a cross-tool ordering
  mechanism — real feature, wrong scope (it shapes one tool's inputs, not
  call sequencing).
- **`tool-...-017`**: distractor `a` (invented scope-based deprioritization)
  replaced with MCP tool search's schema-deferral misapplied as an
  explanation — real feature, wrong causal claim (deferral does not bias
  against MCP tools once relevant).

Remaining 16 items in the domain: **calibrated — no change**. Each already
carries at least two options requiring a real judgment call rather than
elimination-by-inspection (e.g. `tool-...-003`, `-004`, `-006` through `-008`,
`-011`, `-014` through `-016`, `-018` through `-022`), consistent with the
domain already sitting at or above its sample anchor.

`npm run check` and `npm run metrics -- ccar-f` stay green post-edit; no
`correct` keys, `sourceUrl`s, or tested facts changed — only distractor
substance.

### Real-exam calibration: Agentic Architecture & Orchestration hardening (2026-09-24)

Same real-exam signal as above, applied to Domain 1 (32 items). Sample
anchors: Question 1 (programmatic prerequisite for financial tool sequencing)
maps to `agentic-...-015` near-verbatim; Question 7 (coordinator decomposed
topic too narrowly) maps to `agentic-...-007` near-verbatim. Both left
untouched as anchors. (Sample Question 9, "give synthesis agent a scoped
`verify_fact` tool," is authored under `tool-...-012` in the other domain
instead — a pre-existing placement, not something this pass changes.)

Two items had a distractor eliminable by "that's an absurd overclaim" rather
than by domain knowledge, and were hardened by grounding a real mechanism
from `sub-agents.md` (re-fetched 2026-09-24) in place of the invented one:

- **`agentic-...-001`**: distractor `d` (invented "spawning resets the system
  prompt" claim) replaced with a real-but-wrong claim that a coordinator's
  auto memory automatically carries into a spawned subagent — the source
  explicitly lists auto memory as one of the items that does *not* transfer
  (unlike CLAUDE.md and git status, which do).
- **`agentic-...-006`**: distractor `c` ("a mesh error cannot be caught at
  all") replaced with "peer-to-peer messaging isn't supported at all" — the
  source documents peer-to-peer subagent messaging via `SendMessage` as
  supported but limited and non-default, so the real reason hub-and-spoke is
  preferred is observability and error containment, not the absence of any
  peer channel.

Remaining 30 items: **calibrated — no change** — each already turns on a
real architectural trade-off rather than elimination-by-inspection.

**Drift flag for `audit-sources` (not actioned here):** re-fetching
`sub-agents.md` surfaced that the subagent-spawning tool was **renamed from
`Task` to `Agent` in Claude Code v2.1.63** (old `Task(...)` references still
work as an alias, so nothing is factually wrong). This affects
`tool-...-011` and `tool-...-012` in `tool-design-and-mcp-integration`, both
keyed and explained in terms of "the Task tool." Not a miskey — the keys
remain correct via the alias — so out of scope for this hardening pass;
flagging for the next `audit-sources` drift pass to re-cite to current
terminology.

`npm run check` and `npm run metrics -- ccar-f` stay green post-edit.

### Real-exam calibration: Claude Code Configuration & Workflows hardening (2026-09-24)

Same real-exam signal as above, applied to Domain 3 (24 items). This domain
has the most sample anchors (Questions 4, 5, 6, 10), and the anchors are
themselves recall-shaped: where to place a command, which mode to use, which
flag to pass. The bank's items matched that shape, but their distractors
leaned heavily on invented properties and flags. That made this domain the
softest of the three calibrated so far. Anchors left untouched:
`claude-code-...-001` (≈ sample Q6, `.claude/rules/` globs), `-006`
(≈ sample Q4, `.claude/commands/`), `-013` (≈ sample Q5, plan mode), and
`-019` (≈ sample Q10, `-p`).

Eight items were hardened. Each got real mechanisms misapplied to the
scenario, verified against re-fetched `memory.md`, `skills.md` and
`headless.md` on 2026-09-24:

- **`claude-code-...-002`** (weak distractor): `c` (invented `--project`
  flag) replaced with user-level `~/.claude/CLAUDE.md` "overriding" the
  project file. The source says user loads *before* project and all files
  are concatenated, not overridden.
- **`claude-code-...-003`** (weak distractor + definition-prompt stem): `d`
  (invented settings.json `imports` array) replaced with `--add-dir`. That
  flag is real, but CLAUDE.md files from added directories do not load by
  default. Stem "What syntax" changed to "What mechanism" so the flag option
  is not eliminable by wording.
- **`claude-code-...-004`** (distractor note corrected): the note on `d`
  claimed HTML-commented text is "still read and tokenized". The source says
  block-level HTML comments are *stripped* before injection. The option is
  still wrong, but for the real reason (wrapped sections would be dropped for
  every task, not loaded conditionally). The note now says so, which turns
  `d` into a real-mechanism near miss.
- **`claude-code-...-007`** (weak distractors): `b` and `d` (invented
  `context: background` / `context: isolated`) replaced with the real
  `background` field (applies only with `context: fork`) and
  `disable-model-invocation` (controls who invokes, not isolation).
- **`claude-code-...-010`** (weak distractor): `c` (invented "mandatory
  dropdown") replaced with "both load in full at session start; Skills are
  user-scoped". Wrong on both counts: only descriptions are listed until a
  skill is invoked, and skills can be project-scoped.
- **`claude-code-...-016`** (facepalm distractor): `c` (temperature 1.0)
  replaced with moving the prose into the system prompt. The explanation's
  list of wrong approaches was updated to match.
- **`claude-code-...-017`** (facepalm distractor): `d` (rewrite the module
  blind) replaced with paraphrasing the failure to spare context. That is a
  real context concern, but it discards the diagnostics.
- **`claude-code-...-020`** (facepalm distractor): `d` (grep/awk on stderr)
  replaced with `--output-format json` without `--json-schema`. Without the
  schema, the output is free text in an envelope; `structured_output` only
  exists with a schema.

**Miskeys surfaced, handed off to `evaluate-questions` (not actioned here;
keys untouched per this skill's stop rule):**

- **`claude-code-...-005`**: keyed `/memory`, but `memory.md` now says "To
  check which `CLAUDE.md` and rules files loaded into the current session,
  run `/context`." `/memory` lists memory file *locations* (including ones
  that do not exist yet). The stem asks what is loaded, so the key is
  contradicted by its own source.
- **`claude-code-...-008`**: keyed `allowed-tools` restricted to read tools.
  `skills.md` says `allowed-tools` pre-approves the listed tools and "does
  not restrict which tools are available". The documented mechanism is
  `disallowed-tools` (e.g. listing Write and Edit). As keyed, the item
  teaches the wrong field.
- **`claude-code-...-009`**: keyed `argument-hint` as "displaying an
  interactive prompt when invoked without arguments". `skills.md` defines it
  as a "hint shown during autocomplete". No documented frontmatter field
  prompts for a missing argument, so the stem's premise has no correct option
  and the item likely needs rework via `author-questions`.

Remaining 13 items (`-001`, `-006`, `-011` through `-015`, `-018`, `-019`,
`-021` through `-024`): **calibrated — no change**. The four anchors are
preserved as-is; the rest already carry real-mechanism near misses (e.g.
`-011` claudeMdExcludes / PreToolUse hook, `-015` smaller-model
summarisation, `-024` Review Behavior trigger modes), and the two
multi-selects are hardened by their all-or-nothing keys.

`npm run check` and `npm run metrics -- ccar-f` stay green post-edit; no
`correct` keys, `sourceUrl`s or tested facts changed.

### Adversarial evaluation pass: Domains 1–3 (2026-09-24)

`evaluate-questions` across the three domains touched by today's hardening:
`agentic-architecture-and-orchestration` (32),
`tool-design-and-mcp-integration` (22) and
`claude-code-configuration-and-workflows` (24), 78 items in total. For each
item, the answer was worked out from its re-fetched `sourceUrl` (curl `.md`)
and the v1.0 exam guide before the stored key and explanation were read. The
2026-09-17 pass above covered only 9 items, so this is the first full cold
evaluation of these domains.

**Headline:** 3 miskeys, all in Domain 3. There was also a systemic sourcing
defect. About 30 items had a correct key, but their cited page did not state
the fact being tested. The fact came, often verbatim, from an exam-guide task
statement. In one case (`tool-...-004`) the cited `define-tools.md` actually
recommends the opposite ("Consolidate related operations into fewer tools").
With the maintainer's approval, these were re-cited in this pass rather than
demoted. `sourceCheckedAt` was bumped only on items whose citation changed
or was rewritten.

**Miskeys (fixed and re-confirmed):**

- **`claude-...-005`**: keyed `/memory`. `memory.md` § Troubleshoot says to
  run `/context` and check **Memory files** to see what loaded, while
  `/memory` lists file locations, including files that don't exist yet. The
  key is now `/context`, and "`/memory` lists what loaded" became the trap.
  The stem was narrowed to CLAUDE.md files.
- **`claude-...-008`**: keyed `allowed-tools`, which per `skills.md` "does
  not restrict which tools are available". The key is now `disallowed-tools`
  (Write, Edit, Bash). `allowed-tools` is now distractor `d`, replacing a
  weak git-hook option. The stem is bounded to "while it runs", because the
  restriction clears on the next message.
- **`claude-...-009`**: keyed `argument-hint` as prompting for a missing
  argument. It is only an autocomplete hint, and no field prompts. The stem
  is reframed to "shows the expected argument while typing". The invented
  distractor fields were replaced with the real ones `arguments`,
  `when_to_use` and `disable-model-invocation`.

**Keyed text or explanation contradicted by source (fixed):**
`agentic-...-005` (the documented recovery is retrying with a higher
`max_tokens`, not "chunk"); `-021` (`updatedToolOutput` changes what Claude
sees, but telemetry still captures the original, so "or storage" was
dropped); `-026` (the explanation conflated `fork_session` with skill
`context: fork`); `-028` (the Git status snapshot is read when the subagent
starts, not the parent session); `-032` (named subagents can also message
each other, so the false "only" was dropped).

**Re-cited (key unchanged, free text trimmed to what the new source
states):**

- To `manifest.examUrl` with a task statement: `agentic-...-004`, `-006`
  through `-017`, `-024`, `-027`; `tool-...-004` through `-009`, `-012`,
  `-018`; `claude-...-023`.
- To `hooks.md` § PostToolUse decision control: `agentic-...-019`, `-021`,
  `-022`.
- To `best-practices.md`: `agentic-...-025`; `claude-...-013`, `-014`,
  `-018`.
- To `agent-sdk/sessions.md` § Fork: `agentic-...-026`.

**Re-authored for originality:** `tool-...-002` and `tool-...-012` were
near-copies of sample Questions 2 and 9 (same entities and figures).
CONTRIBUTING requires originality, so both now use new scenarios and test
the same facts:

- `-002`: logistics `track_shipment` / `get_carrier_account`, still citing
  `define-tools.md`.
- `-012`: reply-drafting subagent with a scoped `get_order_status` tool.
  Re-cited to exam guide TS 2.3, and the key moved `a` → `c`.

The earlier notes calling these two "anchors" are superseded. The Domain 3
items that closely follow samples (`claude-...-001`, `-006`, `-013`, `-019`)
were not checked for originality in this pass.

**Distractor and free-text fixes:**

- Facepalm distractors replaced with misapplied real mechanisms:
  `agentic-...-006` d (depth limit), `-020` d (`maxTurns`), `-021` c
  (PreToolUse deny); `tool-...-005` a, `-017` a (@ mention), `-020` e
  (`enableAllProjectMcpServers` ignored in an untrusted folder).
- Wording and notes corrected on `tool-...-001`, `-004`, `-006`, `-010`,
  `-015`, `-018`, `-019` and on `claude-...-001`, `-003`, `-004`, `-006`,
  `-022`, `-023`, `-024`.
- All eight Domain 3 distractors hardened earlier today were independently
  confirmed wrong and not a second defensible answer.

**Dispositions (78):**

- 3 miskeyed, fixed.
- 5 keyed-text contradictions, fixed.
- ~30 citation mismatches, re-cited.
- 2 re-authored.
- 1 weak-distractors, unresolved: **`tool-...-014`**, now **`draft`**. All
  three of its distractors refute themselves. Rewriting them is held back
  because `define-tools.md` now says forced `tool_choice` (`any`/`tool`)
  returns a 400 error on Claude Opus 5.5, Fable 5.1 and Mythos 5.1, with
  `auto` plus strict tool use as the alternative. A rewrite now risks a
  second defensible answer.
- The rest confirmed as-is.

Result: 77 `reviewed`, 1 `draft`.

**Routed to the next `audit-sources` pass:**

- Forced-`tool_choice` drift: `tool-...-013` and `-014`.
- Grep and Glob are left out of the default tool set on macOS, Linux and
  WSL: `tool-...-021`.
- `tools` versus `allowedTools` naming for Claude Code subagents:
  `tool-...-011`.
- The Task→Agent rename noted above: `tool-...-011`, `-012`;
  `agentic-...-011`, `-012`.

**Not covered:** `prompt-engineering-and-structured-output` and
`context-management-and-reliability` (42 items) were not cold-evaluated.
Given the Domain 1–3 citation-mismatch rate, expect the same pattern there.

`npm run check` passes (372/372 tests). The `npm run metrics -- ccar-f`
bias guards all pass.

### Judgement renovation: Agentic Architecture & Orchestration (2026-09-25)

**Why a second pass a day after hardening.** After the 2026-09-24 passes, the
maintainer reported that the bank still felt "quite a lot easier" than the live
exam, where most items were about *architectural judgement*. The diagnosis:
the gap is question shape, not distractor quality. Many Domain 1 items handed
the decision to the reader in the stem ("Why are hooks superior…", "Why is
hub-and-spoke preferred…", "How does running sessions in worktrees prevent…")
and tested only the reason. Others offered one sensible option among three
strawmen. `harden-domain-questions` cannot fix either: it forbids changing the
tested fact, and it calibrates to the guide's sample questions, which this
bank's only empirical signal says undershoot the live exam. This pass
therefore ran as `author-questions` rewrites, not hardening.

**Target shape.** A scenario, a goal, and a constraint to keep ("…while
keeping Y"). All four options are real approaches, and each distractor fails
the stated constraint for a reason the docs establish: over-engineered, solves
a different problem, probabilistic where a guarantee is needed, or a real
mechanism at the wrong layer. This is the elimination logic the guide's own
sample answers use. One deliberate pattern: `-021` and `-022` pose the same
redaction problem under different constraints and have different keys. In
`-022`, model context is the only concern, so a PostToolUse hook is the key.
In `-021`, exported telemetry must also be clean, so the hook is the trap.
Withholding the deciding fact, which the maintainer saw on the real exam, was
not used. It would create two defensible answers, which CONTRIBUTING forbids.

**Dispositions (32):**

- **Renovated: stem and options rewritten into a trade-off decision (17):**
  `-001` (explicit context vs fork mode vs auto memory vs re-retrieval),
  `-004`, `-006` (peer channel bypassing the coordinator), `-008`, `-010`,
  `-012` (parallel Task calls vs forks vs merged subagent), `-013`, `-014`,
  `-018`, `-019` (PostToolUse `updatedToolOutput` vs `decision: block` vs
  PreToolUse `updatedInput`), `-020` (PreToolUse deny with escalation vs
  PostToolUse too late vs deny-all), `-021` (see above), `-026` (fork branches
  history, not the filesystem), `-027` (resume and flag changed files vs start
  fresh), `-030` (worktrees vs subagents, teams and forks sharing a checkout),
  `-031` (no mid-run input, so one workflow per stage), `-032` (agent team vs
  workflow vs subagents).
- **Options rewritten, stem kept (5):** `-005` (text-continuation pattern as
  the near miss), `-009` (full search tool set on synthesis as the near miss),
  `-016`, `-023`, `-025`.
- **Kept (10):** anchors `-007` and `-015` (sample Questions 7 and 1). Core
  loop and API mechanics that the guide tests as knowledge: `-002`, `-003`,
  `-011`. Items already posing a trade-off: `-017`, `-022`, `-024`. The two
  select-two items: `-028`, `-029`.

**Keys moved:** `-001` a→c, `-004` c→b, `-005` d→a, `-006` a→d, `-008` c→b,
`-009` d→a, `-010` a→d, `-012` c→b, `-013` d→c, `-014` a→d, `-016` c→a,
`-018` a→c, `-019` b→d, `-020` c→a, `-021` d→b, `-023` b→d, `-025` d→c,
`-026` a→b, `-027` b→d, `-030` a→c, `-031` c→a, `-032` d→b. Each move is a
rewrite of the item, not a miskey fix.

**Sources.** Re-fetched on 2026-09-25: `sub-agents.md`, `hooks.md`,
`agent-teams.md`, `workflows.md`, `worktrees.md`, `agent-sdk/sessions.md`,
`handling-stop-reasons.md` and exam guide v1.0 § Domain 1. Re-cited: `-001`
(exam guide → `sub-agents.md`) and `-020` (`hooks-guide.md` → `hooks.md`).

### Adversarial evaluation pass: Domain 1 rewrites (2026-09-25)

Cold-evaluation pass via `evaluate-questions` covering all 22 renovated items
in `agentic-architecture-and-orchestration` (`-001`, `-004`, `-005`, `-006`,
`-008`, `-009`, `-010`, `-012`, `-013`, `-014`, `-016`, `-018`, `-019`,
`-020`, `-021`, `-023`, `-025`, `-026`, `-027`, `-030`, `-031`, `-032`).

Each item was evaluated independently against its cited source and exam blueprint
task statements before comparing against stored keys and explanations. All 22
items independently cold-derived to the stored keys; free-text explanations,
distractor notes, and constraints match documented vendor behavior and
architectural principles without contradiction or defect.

- **Dispositions (22)**: 22 confirmed, 0 miskeyed, 0 unsupported, 0 weak-distractors, 0 unsourced-claim.
- **Status promotion**: All 22 renovated items promoted from `draft` → `reviewed`.
- **Domain status**: All 32 items in Domain 1 are now `status: "reviewed"`.
- **Not covered in this pass**: Domains 2–5 (88 items), which sit at their 2026-09-24 review status pending renovation triage.

**Calibration note for future passes.** For ccar-f, the recorded real-exam
signal outranks the guide's sample questions as the difficulty anchor.
CONTRIBUTING § Difficulty calibration says real exams "tend to be easier than
the bank". That holds for ccdv-f but is the opposite of what two candidates
reported here.
