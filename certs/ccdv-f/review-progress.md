# Phase 2 Review: CCDV-F Question Bank

## Cold-Answer Pass Results

| Metric | Count |
|--------|-------|
| Total questions | 100 |
| Cold-answered | 97 |
| Source inaccessible (verified via sourceNote) | 3 |
| Pending | 0 |
| **Agreements** | **94** |
| **Disagreements** | **3** |
| False-agree rate (10-question audit) | **0/10** |

## Disagreements — All Adjudicated

All 3 disagreements were investigated against the live source pages. **In every case, the answer key was correct and the cold reader erred.**

### 1. ccdv-f-0040 — Subagent limits mechanism
- **Key:** `a` (depth/concurrency = env vars, spend = query option)
- **Cold:** `c` (all three are query options)
- **Source text:** Table at `code.claude.com/.../subagents` shows Depth → `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, Concurrency → `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` (env vars via `env` option), Spend → `maxBudgetUsd`/`max_budget_usd` (query option)
- **Verdict:** ✅ Key correct. Cold reader conflated the two mechanisms.

### 2. ccdv-f-0012 — Replacing shared API keys
- **Key:** `a, e` (service account + workload identity federation)
- **Cold:** `a` only (missed federation)
- **Source text:** "Move to Workload Identity Federation when your workload already has a platform-issued identity you can federate."
- **Verdict:** ✅ Key correct. Cold reader stopped at the first correct answer.

### 3. ccdv-f-0013 — Multi-workspace key needs workspace header
- **Key:** `d` (send workspace ID header)
- **Cold:** `a` (confused about 401 authentication_error)
- **Source text:** "If your API key isn't scoped to a workspace, you must specify the workspace ID in the `anthropic-workspace-id` header for each request."
- **Verdict:** ✅ Key correct. Cold reader answered a different question.

## Near-Duplicate Analysis

### Confirmed near-duplicates

| Pair | Source Page | Concern | Resolution |
|------|-----------|---------|----------------|
| 0018 / 0075 | develop-tests | Both test "recognize a good success criterion" — 0018 asks for SMART properties, 0075 asks for the F1 example. Different domains but same concept. | **Kept both.** They sit in different domains (`applications-and-integration` vs `eval-testing-and-debugging`) and test different layers: 0018 the abstract SMART criteria, 0075 a concrete worked metric. `eval-testing-and-debugging` is also a floor-padded domain at 7 questions, so removing one would cost depth where the bank is thinnest. |

### Checked and cleared

| Pair | Source Page | Why they're different enough |
|------|-----------|-----|
| 0007 / 0047 | context-windows | 0007 is easy single-select overview; 0047 is medium multi-select drilling into specifics. |
| 0063 / 0071 | permissions / permission-modes | Different source pages. 0063 tests deny-first eval order; 0071 tests bypassPermissions mode carve-out. Complementary, not redundant. |

## Quality Observations

> [!TIP]
> **stemSelfContained flag**: The cold reader marked all 20 batch-0 questions as `stemSelfContained: false`. On manual inspection, many of these stems are scenario-based ("what explains this behavior?") which inherently require reading the options. This is appropriate for applied-knowledge certification questions — the stem sets up a realistic debugging scenario and the options represent possible diagnoses. The flag was over-conservative.

## Review Progress by Domain (highest weight first)

| Domain | Weight | Questions | Reviewed | Draft |
|--------|--------|-----------|----------|-------|
| applications-and-integration | 33.1% | 26 | 26 | 0 |
| model-selection-and-optimization | 16.8% | 15 | 15 | 0 |
| agents-and-workflows | 14.7% | 14 | 14 | 0 |
| prompt-and-context-engineering | 11.0% | 11 | 11 | 0 |
| tools-and-mcps | 10.6% | 11 | 11 | 0 |
| security-and-safety | 8.1% | 9 | 9 | 0 |
| claude-code | 3.1% | 7 | 7 | 0 |
| eval-testing-and-debugging | 2.6% | 7 | 7 | 0 |
| **Total** | | **100** | **100** | **0** |

## Batch 3 — Resolved (no doc drift)

The 11 questions left pending were blocked by the batch-3 cold-answerer's URL
fetcher, which reported `404` / "content moved" for seven source pages. **All
seven URLs were re-checked directly and are live and correct** — the failures
were a tool artefact, not doc drift. No `sourceUrl` needed changing.

The docs render client-side, so the reliable way to read them is to append
`.md` to the page URL (e.g. `curl -sL https://platform.claude.com/docs/en/build-with-claude/compaction.md`).
The re-run cold-answer pass used that form.

| Question | Key | Cold | Result |
|---|---|---|---|
| ccdv-f-0002 | b, c, e | b, c, e | ✅ agree |
| ccdv-f-0005 | a, c, f | a, c, f | ✅ agree |
| ccdv-f-0014 | a, d, e | a, d, e | ✅ agree |
| ccdv-f-0022 | b, e, f | b, e, f | ✅ agree |
| ccdv-f-0030 | c | c | ✅ agree |
| ccdv-f-0031 | b | b | ✅ agree |
| ccdv-f-0037 | b | b | ✅ agree |
| ccdv-f-0042 | b, c | b, c | ✅ agree |
| ccdv-f-0048 | c | c | ✅ agree |
| ccdv-f-0049 | d, e | d, e | ✅ agree |
| ccdv-f-0053 | b | b | ✅ agree |

11/11 agreements, all at `high` confidence, no `multipleDefensible` flags. All
11 flipped from `draft` to `reviewed` with `sourceCheckedAt: 2026-09-03`.

**The bank is now 100/100 `reviewed` — Phase 2's exit condition is met.**

## Validation

```
✅ npm run check passes (13/13 tests, 100 questions validated)
✅ 100/100 questions at status: reviewed, 0 draft
✅ Schema validation passes
✅ No position bias detected
✅ No leading-run multi-select answers
```
