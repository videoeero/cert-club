# IAAP Web Accessibility Specialist (WAS) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the official IAAP Web Accessibility Specialist (WAS) Body of
Knowledge (Version 2.3, October 2024) and the Candidate and Certificant Handbook
2025. Sources and blueprint verified on 2026-10-12.

## Bank status: `draft`

`manifest.status` is `draft`. Seeded on 2026-10-12 with 3 draft questions (1 per
domain) and expanded to a full 4× target of 300 questions (120 / 120 / 60),
all 100% `reviewed`. The bank is fully calibrated and verified across adversarial
cold evaluation and difficulty hardening passes. Status remains `draft` pending
human testing feedback and explicit human promotion approval.

## Blueprint and weights

The official WAS Body of Knowledge (Version 2.3) publishes exact integer percentage
weights across its three domains:

| Domain                                            | Slug                                |   Weight | Target (1×: 75) | Floor (2×: 150) | Target (4×: 300) | Questions |
| ------------------------------------------------- | ----------------------------------- | -------: | --------------: | --------------: | ---------------: | --------: |
| Creating Accessible Web Solutions                 | `creating-accessible-web-solutions` |      40% |              30 |              60 |              120 |       120 |
| Identifying Accessibility Issues in Web Solutions | `identifying-accessibility-issues`  |      40% |              30 |              60 |              120 |       120 |
| Remediating Issues in Web Solutions               | `remediating-accessibility-issues`  |      20% |              15 |              30 |               60 |        60 |
| **Total**                                         |                                     | **100%** |          **75** |         **150** |          **300** |   **300** |

Exam specifications from the blueprint:

- Total items: 75 questions
- Duration: 120 minutes (2 hours)
- Baseline promotion floor (2×): 150 questions (60 / 60 / 30)
- Full bank authoring target (4×): 300 questions (120 / 120 / 60)

### Sizing rationale: Why 4× (300 items)?

The WAS exam is significantly more fact-dense and detail-oriented than typical cloud
or developer exams. Rather than testing high-level architectural patterns, the exam tests
specific, granular technical recall across multiple intersecting specifications:

1. **Screen Reader Shortcut Matrix**: Keystroke combinations across NVDA, JAWS,
   VoiceOver (macOS and iOS), and TalkBack for navigation modes (virtual cursor vs.
   forms/focus mode), table reading, landmark hopping, form control traversal, and rotor gestures.
2. **WCAG Success Criteria Precision**: 55+ normative Level A/AA criteria with exact
   numerical thresholds (contrast ratios 4.5:1 / 3:1 / 7:1, target sizes 24×24 vs. 44×44 CSS px,
   text spacing multipliers, 320px reflow bounds) and specific failure techniques.
3. **WAI-ARIA 1.2/1.3 & APG Patterns**: 30+ ARIA roles, states, and properties, focus
   trapping mechanics, roving tabindex, and combobox/modal keyboard interaction patterns.
4. **Standards & Governance**: Comprehensive coverage of WCAG-EM (5 steps and sampling rules),
   EN 301 549 (chapters 5, 9, 10, 11), ATAG 2.0 (Part A vs. Part B), and VPAT/ACR procurement.

A 4× bank provides 4 non-overlapping mock exam sessions and guarantees that drill questions
on screen reader shortcuts and numerical WCAG thresholds do not crowd out core design and
remediation scenario items. Sizing is tracked via `npm run balance iaap-was --target 300`.

## Composition and coverage audit

Audited against the 300-question bank:

- **Distribution**: Proportional across all 3 domains (120 / 120 / 60, zero delta against 4× target).
- **Question status**: 300 of 300 questions are `reviewed` (100%).
- **Item formats**: 300 single-select items (100%), matching the official handbook specification (strictly 4-option single-select multiple-choice).
- **Position balance**: Exactly 75 A / 75 B / 75 C / 75 D across `a`–`d` (25.0% uniform distribution).
- **Option length delta**: Mean correct-option length minus distractor length is +0.81 characters (median +0.67 chars), well within the ±10.0 character ceiling.
- **Longest option as key share**: 83 of 300 items (27.7%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 300 questions carry complete explanations without option letter references.
- **Sourcing**: 85 unique authoritative documentation pages across W3C, ETSI, and IAAP.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).
- **Option hints**: 60 of 300 questions (20.0%, 240 options) feature `hintText`. 240 statement-style items remain intact with no hints.

## Known coverage limits and deliberate boundaries

- **4-option single-select standard**: Quoted from the Candidate and Certificant Handbook 2025 (p. 23): _"Multiple choice exam items have one correct response and three distractors. Exam items are written in detail in the Body of Knowledge and each topic from the Content Outline. Exam items are NOT written to obscure or edge case scenarios."_ All bank items strictly conform to this format.
- **Statement-style option protection**: The 240 statement-style scenario questions intentionally omit `hintText` to prevent prompt-echo giveaways and maintain authentic decision-making.

## Official sample question inventory

The official IAAP WAS sample questions (`https://www.accessibilityassociation.org/was-sample-exam-questions`)
anchor cognitive depth across 8 items:

1. **Sample 1 (Domain 1)**: Authoring Tool Accessibility Guidelines (ATAG) requirement — keyboard accessible authoring tool. Key: 2. Cognitive depth: recall / specification requirement.
2. **Sample 2 (Domain 1)**: ARIA attribute conveying a property — `aria-labelledby` vs roles/states. Key: 3. Cognitive depth: conceptual / WAI-ARIA syntax taxonomy.
3. **Sample 3 (Domain 1)**: WCAG 2.1 new success criteria focus areas — cognitive and learning disabilities. Key: 4. Cognitive depth: specification evolution and scope.
4. **Sample 4 (Domain 2)**: Preference radio button auto-moving focus to text input on "other" — violation of SC 3.2.2 Change on Input. Key: 2. Cognitive depth: scenario analysis / WCAG failure mapping.
5. **Sample 5 (Domain 2)**: Intent of SC 1.4.12 Text Spacing — allows users to override line and paragraph spacing. Key: 3. Cognitive depth: understanding success criterion intent.
6. **Sample 6 (Domain 2)**: Browser recommendation for screen reader testing with NVDA — Firefox. Key: 2. Cognitive depth: tooling and compatibility practice.
7. **Sample 7 (Domain 3)**: Non-technical site owner action to remove screen reader barriers — turning off auto-play on video players. Key: 2. Cognitive depth: remediation trade-offs / low-friction interventions.
8. **Sample 8 (Domain 3)**: Enterprise accessibility audit methodology — WCAG-EM. Key: 4. Cognitive depth: audit governance and enterprise methodology.

## Calibration stance and firewall

No third-party calibration material was supplied for this bank. Authors rely exclusively
on the 8 official sample items above, the WAS Body of Knowledge, and primary W3C/ETSI
specifications under the repository firewall:

> **Calibration only.** No question, option, or rationale here derives from that
> set, or from any other third-party bank. It informed how deep and how
> scenario-shaped a question should be, never what a question says.

## Sourcing and vendor documentation rules

Recon verdict: **GO** (approved 2026-10-12).

### Classified hosts

- **Citable documentation**:
  - `https://www.w3.org/TR/*` — W3C Recommendations (WCAG 2.0 / 2.1 / 2.2, WAI-ARIA 1.2 / 1.3, ATAG 2.0, WCAG-EM 1.0). Gate: PASS. Authority: PASS.
  - `https://www.w3.org/WAI/*` — WAI Authoring Practices Guide, WAI Tutorials, Planning & Management. Gate: PASS. Authority: PASS.
  - `https://act-rules.github.io/rules/` — W3C Accessibility Conformance Testing Rules. Gate: PASS. Authority: PASS.
  - `https://www.etsi.org/deliver/etsi_en/301500_301599/301549/*` — European Accessibility Standard EN 301 549. Gate: PASS. Authority: PASS.
  - `https://www.accessibilityassociation.org/sfsites/c/resource/*` — Official IAAP Body of Knowledge and Handbook PDFs. Gate: PASS. Authority: PASS.
- **Readable-but-not-citable (Calibration / Cross-check only)**:
  - `https://www.accessibilityassociation.org/was-sample-exam-questions` — Official sample questions (cognitive anchor, do not clone items).
  - Public accessibility blogs and community study guides (`100daysofa11y.com`, Teach Access). Fails authority for normative technical facts.
- **Excluded**:
  - `https://dequeuniversity.com/*` — course modules gated behind paid subscription / user login. Fails gate.
  - `https://stiftelsenfunka.org/*` and `https://www.funka.com/*` — commercial prep training courses. Fails gate.
  - `https://makeitfable.com/*` — training content gated behind login. Fails gate.
  - `https://www.surveymonkey.com/r/*` — third-party survey forms. Fails authority.

## Adjudications

Standing rulings and technical adjudications:

### Distractor design and hardening rulings

Calibrated against official sample questions 1–8:

- **Domain 1 (80 calibrated intact, 40 hardened)**: Replaced filler distractors with authentic practitioner misconceptions across ARIA APG Widget patterns (combobox 1.2, tabs, treeview, dialog `.show()` vs `.showModal()`, toggletip vs tooltip focus rules), Accessible Name 1.2 traversal of hidden elements, SC 2.5.7 dragging exemptions, SC 1.4.12 metric bounds, SC 2.4.7 vs 2.4.13 focus contrast, and ATAG Part A/B scope inversion.
- **Domain 2 (79 calibrated intact, 41 hardened)**: Upgraded trivial options to authentic screen reader near-misses across JAWS, NVDA, VoiceOver (macOS/iOS), and TalkBack (Browse vs Focus mode, Speech History, rotor gestures, table navigation); low vision/zoom thresholds (SC 1.4.3, 1.4.10, 1.4.11, 1.4.12); motor/pointer rules (SC 2.1.2, 2.5.1, 2.5.2, 2.5.3); and WCAG-EM 1–5 methodology.
- **Domain 3 (28 calibrated intact, 32 hardened)**: Hardened options to test authentic remediation triage trade-offs (blocker vs high/medium/low, conversion funnels vs static content); architectural code repairs vs interim aid; VPAT 2.x editions (508, WCAG, EN 301 549, INT), official ACR conformance terminology ("Supports", "Partially Supports", "Does Not Support"), SLAs, and EN 301 549 chapter mapping.
- **Absolute qualifiers**: 0% giveaway across all 300 single-select items.

### Key and source repairs

- **Seed smoke test (2026-10-12)**: 3 initial draft items verified against live primary sources (`cws-001` First Rule of ARIA, `iai-001` WCAG-EM §4.4.3, `raw-001` WCAG 2.2 §5.3.1 conformance claim components).
- **Cold evaluation repairs**: 24 items repaired in place during the 2× baseline cold evaluation to tighten distractors and eliminate structural tells (22 in Domain 1, 2 in Domain 2). 0 miskeys detected across the entire 300-question bank.

### Option hints implementation (2026-10-13)

- 60 of 300 questions (240 options) feature neutral, non-telegraphing `hintText` glosses for bare technical terms, ARIA attributes/roles, screen reader keystrokes, and standards chapters.
- 240 statement-style questions remain intact without hints, strictly observing the repository standard.

## Maintenance audits

- **2026-10-12**: Recon completed. Approved GO. Seed smoke test verified.
- **2026-10-12**: 2× baseline orchestration pass (150 items: 60 / 60 / 30). Independent cold evaluation confirmed 0 miskeys (24 items repaired in place). Difficulty hardening calibrated all domains against Samples 1–8. All 150 items promoted to `reviewed`.
- **2026-10-12**: 4× expansion passes across Domain 1 (+60 items), Domain 2 (+60 items), and Domain 3 (+30 items), bringing the bank to 300 items. Cold evaluation confirmed 100% correct keys (0 miskeys). Hardening passes completed across all three domains.
- **2026-10-12**: Coverage audit confirmed exact blueprint fidelity (40% / 40% / 20%), 100% `reviewed` status, perfect position balance (75 each), and readiness for human testing.
- **2026-10-13**: Option hints pass added 240 option hints across 60 questions with zero impact on bias guards. `npm run check` clean.
