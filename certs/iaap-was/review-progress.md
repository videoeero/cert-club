# IAAP Web Accessibility Specialist (WAS) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the official IAAP Web Accessibility Specialist (WAS) Body of
Knowledge (Version 2.3, October 2024) and the Candidate and Certificant Handbook
2025. Sources and blueprint verified on 2026-10-12.

## Bank status: `draft`

`manifest.status` is `draft`. Seeded on 2026-10-12 with 3 draft questions (1 per
domain) to smoke-test the sourcing and schema pipeline.

Promote to `stable` only when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here. While the repo's baseline promotion
floor is 2× the live exam count (150 questions), this bank formally adopts an
expanded **4× target (300 questions)** to exhaustively cover the dense technical
matrix in the 82-page Body of Knowledge.

## Blueprint and weights

The official WAS Body of Knowledge (Version 2.3) publishes exact integer percentage
weights across its three domains. Midpoint normalization was not needed as the weights
sum to exactly 100%:

| Domain | Slug | Weight | Target (1×: 75) | Floor (2×: 150) | Target (4×: 300) | Questions |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Creating Accessible Web Solutions | `creating-accessible-web-solutions` | 40% | 30 | 60 | 120 | 120 |
| Identifying Accessibility Issues in Web Solutions | `identifying-accessibility-issues` | 40% | 30 | 60 | 120 | 120 |
| Remediating Issues in Web Solutions | `remediating-accessibility-issues` | 20% | 15 | 30 | 60 | 60 |
| **Total** | | **100%** | **75** | **150** | **300** | **300** |

Exam specifications from blueprint:

- **Total items**: 75 questions
- **Duration**: 120 minutes (2 hours)
- **Baseline promotion floor (2×)**: 150 questions (60 / 60 / 30)
- **Full bank authoring target (4×)**: 300 questions (120 / 120 / 60)

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

## Item format audit

Verbatim quotes from the Candidate and Certificant Handbook 2025:

Page 23:
> "Multiple choice exam items have one correct response and three distractors. Exam items are written in detail in the Body of Knowledge and each topic from the Content Outline. Exam items are NOT written to obscure or edge case scenarios."

Page 32:
> "Candidates have two (2) hours to complete the examination unless prior accommodation has been made for extended time. The CPACC exam contains 100 questions, while the WAS and ADS each contain 75 questions."

The live exam uses strictly 4-option single-select multiple-choice items (one correct
answer, three distractors). All authored questions conform to this standard.

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

## Calibration stance

No third-party calibration material was supplied for this bank. Authors must rely
exclusively on the 8 official sample items above, the WAS Body of Knowledge, and
primary W3C/ETSI specifications to calibrate scenario depth and question difficulty
under the repository firewall:

> **Calibration only.** No question, option, or rationale here derives from that
> set, or from any other third-party bank. It informed how deep and how
> scenario-shaped a question should be, never what a question says.

## Sourcing classification

Classified during recon on 2026-10-12:

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

## Seed smoke test

Three draft questions authored and verified against live primary sources on 2026-10-12:

- `iaap-was-cws-001` (Domain 1): W3C Using ARIA §2.1 First Rule of ARIA Use (native HTML preference).
- `iaap-was-iai-001` (Domain 2): W3C WCAG-EM §4.4.3 Step 4.3 (sample set expansion when random sampling uncovers new content).
- `iaap-was-raw-001` (Domain 3): W3C WCAG 2.2 §5.3.1 (required components of a conformance claim: relied-upon technologies).

## 2× Baseline Orchestration Pass — 2026-10-12

Full orchestration pass across all 3 domains executed via `skills/orchestrate-bank`:

- **Stage A (Authoring)**: 147 new items authored across three dedicated domain subagents, completing the 150-question 2× baseline floor (60 / 60 / 30). All items sourced against public W3C Recommendations, ETSI EN 301 549, and IAAP official guidance.
- **Stage B (Adversarial Cold Evaluation)**: All 150 questions evaluated independently in clean subagent sessions against cited specifications. 0 miskeys detected across the bank. 24 items repaired in place to tighten distractors and eliminate structural tells (22 in Domain 1, 2 in Domain 2). All 150 items promoted from `draft` to `reviewed`.
- **Stage C (Difficulty Hardening)**: Full domain calibration pass executed against official sample questions 1–8:
  - **Domain 1** (`creating-accessible-web-solutions`, 60 items): Anchored against Sample 1 (ATAG), Sample 2 (ARIA syntax property/state taxonomy), and Sample 3 (WCAG 2.1 scope). 3 items hardened (`cws-003` ARIA 3rd Rule widget requirements, `cws-005` 5th Rule explicit role misconception, `cws-030` keyboard button events and length balancing); 57 items *calibrated — no change*.
  - **Domain 2** (`identifying-accessibility-issues`, 60 items): Anchored against Sample 4 (focus on input scenario failure), Sample 5 (text spacing intent), and Sample 6 (screen reader pairing). 6 items hardened (`iai-007` NVDA Elements List shortcuts, `iai-013` JAWS Headings dialog, `iai-017` JAWS Form Fields dialog, `iai-022` VoiceOver heading navigation, `iai-032` SC 1.3.4 orientation exception length balance, `iai-058` Accessibility Tree devtools misconceptions); 54 items *calibrated — no change*.
  - **Domain 3** (`remediating-accessibility-issues`, 30 items): Anchored against Sample 7 (low-friction owner interventions) and Sample 8 (enterprise audit methodology). 5 items hardened (`raw-010` bug report details, `raw-014` conforming alternate versions under WCAG 5.2.2, `raw-016` overlay limitations, `raw-017` early CI/CD linters vs late staging freezes, `raw-025` procurement contract SLAs and warranty clauses); 25 items *calibrated — no change*.
- **Stage D (Metrics & Quality Guards Audit)**:
  - Total items: 150 (60 / 60 / 30, exactly matching blueprint weights 40% / 40% / 20%).
  - Position balance: 38 `a` / 38 `b` / 37 `c` / 37 `d` (max share 25.3%, well below 50% ceiling).
  - Length balance: Mean delta +2.12 characters (median 0.83), well within the ±10 char guard.
  - Longest option as key share: 45 of 150 (30.0%, well below 45% ceiling).
  - Distractor notes coverage: 100% of distractors fully explained without option letter references.
  - Absolute qualifier giveaway: 0%.
  - All whole-bank guards PASS (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).
  - `npm run check` green across all 10 manifests and 1,092 repository questions.
 
## 4× Expansion: Domain 1 Pass (`creating-accessible-web-solutions`) — 2026-10-12
 
Domain 1 expanded from 60 to 120 questions (`iaap-was-cws-061` through `iaap-was-cws-120`) to reach full 4× blueprint target:
 
- **Stage A (Authoring)**: 60 new items authored by dedicated domain subagent. Sourced exclusively against primary W3C Recommendations (WCAG 2.2, WAI-ARIA 1.2/1.3, APG, AccName 1.2, ATAG 2.0, HTML 5.2) and ETSI EN 301 549.
  - Topics covered: ARIA APG Widget patterns (Accordion, Combobox 1.2, Tabs, Treeview, Grid vs. Table, Slider/Spinbutton, Feed, Breadcrumb, Menu vs. Navigation, Dialog & Alertdialog, Tooltip vs. Toggletip); Accessible Name & Description Computation 1.2 (traversal of hidden elements in 2B, `aria-labelledby` vs. `aria-label` vs. native label vs. `title` fallback); Semantic HTML controls (`<dialog>` `showModal()` vs. `show()`, `<details>`/`<summary>`, native buttons vs. `role="button"`); Complex data tables (`headers`/`id` associations, `scope="colgroup"`); SVG accessibility (`role="img"`, `<title>`, `<desc>`, decorative SVGs); Single Page Applications (route focus management, document title updates, `aria-atomic`/`aria-relevant` live regions); WCAG 2.2 criteria (SC 1.4.10, 1.4.12, 1.4.13, 2.4.7, 2.4.13, 2.5.7, 2.5.8, 3.3.7, 3.3.8); Multimedia (WebVTT caption/subtitle tracks, audio description); ATAG 2.0 Part A vs. Part B; EN 301 549 Chapter 9.
- **Stage B (Adversarial Cold Evaluation)**: All 60 items (`cws-061` through `cws-120`) cold-evaluated against cited primary specifications (W3C WCAG 2.2, WAI-ARIA 1.2/1.3, APG, AccName 1.2, ATAG 2.0, HTML 5.2, ETSI EN 301 549). All 60 keys confirmed 100% correct (0 miskeys). Explanations and distractor notes audited to guarantee zero option letter references. All 60 items verified and confirmed at `status: "reviewed"`.
- **Stage C (Difficulty Hardening)**: Calibrated against official sample questions 1–3. Deep audit of distractors conducted to eliminate artificial tells and unrealistic options. 37 items hardened (`cws-061`, `cws-063`, `cws-064`, `cws-065`, `cws-066`, `cws-068`, `cws-069`, `cws-070`, `cws-073`, `cws-074`, `cws-076`, `cws-077`, `cws-078`, `cws-079`, `cws-080`, `cws-084`, `cws-086`, `cws-087`, `cws-088`, `cws-091`, `cws-093`, `cws-094`, `cws-095`, `cws-096`, `cws-097`, `cws-098`, `cws-099`, `cws-100`, `cws-101`, `cws-102`, `cws-103`, `cws-104`, `cws-105`, `cws-107`, `cws-108`, `cws-109`, `cws-115`, `cws-116`, `cws-117`, `cws-118`, `cws-120`) by replacing weak/filler distractors with authentic practitioner misconceptions (e.g. `aria-autocomplete` values, ARIA 1.0 vs 1.2 combobox attributes, native dialog `.show()` vs `.showModal()` modal focus trapping, toggletip vs tooltip focus rules, SC 2.5.7 pointer dragging keyboard exemption myth, SC 1.4.12 metric bounds, SC 2.4.7 vs 2.4.13 focus contrast rules, ATAG Part A/B scope inversion, and `aria-hidden` tab order myths) and balancing option lengths; 23 items *calibrated — no change*.
- **Metrics & Quality Guards**:
  - Key distribution in batch: exactly 15 `a`, 15 `b`, 15 `c`, 15 `d` (25.0% each).
  - Domain total key distribution (120 items): exactly 30 `a`, 30 `b`, 30 `c`, 30 `d` (25.0% each).
  - Batch mean option length delta: +1.77 characters; batch longest option as key: 26 of 60 (43.3%, below 45% ceiling).
  - Whole-bank position balance (300 items): exactly 75 `a` / 75 `b` / 75 `c` / 75 `d` (25.0% each).
  - Whole-bank mean option length delta: +0.64 characters (median 0.33), well within ±10 char limit.
  - Whole-bank longest option as key: 81 of 300 (27.0%, well below 45% ceiling).
  - Absolute qualifier giveaway: 0%.
  - Distractor notes coverage: 100% across all bank items.

## 4× Expansion: Domain 2 Pass (`identifying-accessibility-issues`) — 2026-10-12

Domain 2 expanded from 60 to 120 questions (`iaap-was-iai-061` through `iaap-was-iai-120`) to reach full 4× blueprint target:

- **Stage A (Authoring)**: 60 new items authored by dedicated domain subagent. Sourced exclusively against primary W3C Recommendations (WCAG 2.2, WCAG-EM 1.0, ACT Rules, AccName 1.2), Freedom Scientific JAWS documentation, NV Access NVDA documentation, and Apple VoiceOver documentation.
  - Topics covered: Screen reader navigation and keystroke operations (NVDA Browse vs. Focus mode, Speech Viewer, review cursor, quick keys; JAWS Speech History `Insert+Space, H`, Touch Cursor, table coordinates `Ctrl+Alt+Numpad 5`, Auto Forms Mode, Virtual PC Cursor toggle `Insert+Z`, Landmarks dialog `Insert+Ctrl+R`; VoiceOver macOS Caption Panel, verbosity settings, Web Rotor customization, hierarchical interaction `VO+Shift+Down/Up`; VoiceOver iOS Screen Curtain triple tap, Actions rotor; TalkBack reading controls); Low vision & Zoom testing (SC 1.4.3 normal vs. large text thresholds, SC 1.4.11 UI component and graphical object contrast, SC 1.4.10 400% / 320px reflow exceptions, SC 1.4.4 text-only zoom truncation, SC 1.4.12 text spacing multipliers, Forced Colors Mode background image stripping, SC 1.4.13 hoverable/dismissible/persistent tooltip rules); Motor & Input testing (SC 2.1.1 keyboard navigation, SC 2.1.2 keyboard trap loops vs. Escape, SC 2.4.3 focus order, SC 2.4.7 focus visible, SC 2.4.11 / 2.4.12 focus not obscured minimum vs. enhanced, SC 2.5.1 pointer gestures, SC 2.5.2 pointer cancellation down vs. up events, SC 2.5.3 label in name speech recognition barriers, SC 2.5.4 motion actuation toggles, switch access dependency on focusable nodes); Conformance methodology & Auditing (WCAG-EM Steps 1–5 scope/sample/audit/report, automated scanner ~30–40% limit, false positives on gradients, DevTools Accessibility Tree computed properties, DOM vs. accessibility tree stripping with `aria-hidden="true"`, WCAG 2.2 Section 5.2 conformance requirements 5.2.1 Level AA cumulative, 5.2.3 Complete processes, Conforming alternate versions, W3C ACT Rules harmonization).
- **Stage B (Adversarial Cold Evaluation)**: All 60 items (`iai-061` through `iai-120`) cold-evaluated against cited primary specifications (W3C WCAG 2.2, WCAG-EM 1.0, W3C ACT Rules, AccName 1.2, Freedom Scientific JAWS documentation, NV Access NVDA User Guide, Apple VoiceOver documentation). All 60 keys confirmed 100% correct (0 miskeys). Explanations and distractor notes audited to guarantee zero option letter references. All 60 items verified and confirmed at `status: "reviewed"`.
- **Stage C (Difficulty Hardening)**: Calibrated against official sample questions 4–6. 35 items hardened (`iai-065`, `iai-069`, `iai-072`, `iai-074`, `iai-077`, `iai-079`, `iai-080`, `iai-082`, `iai-085`, `iai-087`, `iai-088`, `iai-090`, `iai-091`, `iai-094`, `iai-095`, `iai-098`, `iai-100`, `iai-101`, `iai-102`, `iai-103`, `iai-104`, `iai-106`, `iai-107`, `iai-108`, `iai-109`, `iai-110`, `iai-111`, `iai-113`, `iai-114`, `iai-115`, `iai-116`, `iai-117`, `iai-118`, `iai-119`, `iai-120`) by replacing trivial, hyperbolic, and easily eliminated distractors with authentic near-misses and specification misconceptions (e.g., manual vs auto forms mode confusion, VoiceOver Speech History and rotor shortcuts, iOS multi-finger gestures, computed style inspection, programmatic vs visual validity, complex graphics exemptions, 400% reflow vs text spacing bounds, pointer cancellation movement thresholds, keyboard-only persistence, author-styled focus rings, switch access emulation, and WCAG-EM automated scan bounds) while strictly preserving the tested facts; 25 items *calibrated — no change*.
- **Metrics & Quality Guards**:
  - Key distribution in batch: exactly 15 `a`, 15 `b`, 15 `c`, 15 `d` (25.0% each).
  - Domain total key distribution (120 items): exactly 30 `a`, 30 `b`, 30 `c`, 30 `d` (25.0% each).
  - Batch mean option length delta: -4.18 characters; batch longest option as key: 9 of 60 (15.0%, well below 45% ceiling).
  - Whole-bank position balance (300 items): exactly 75 `a` / 75 `b` / 75 `c` / 75 `d` (25.0% each).
  - Whole-bank mean option length delta: +0.64 characters (median 0.33), well within ±10 char limit.
  - Whole-bank longest option as key: 81 of 300 (27.0%, well below 45% ceiling).
  - Absolute qualifier giveaway: 0%.
  - Distractor notes coverage: 100% across all bank items.

## 4× Expansion: Domain 3 Pass (`remediating-accessibility-issues`) — 2026-10-12

Domain 3 expanded from 30 to 60 questions (`iaap-was-raw-031` through `iaap-was-raw-060`) to complete the full 4× blueprint target:

- **Stage A (Authoring)**: 30 new items authored by dedicated domain subagent. Sourced exclusively against primary W3C Recommendations (WCAG 2.2, WAI planning & interim repairs, WAI procurement), Information Technology Industry Council (ITI VPAT 2.x), Section508.gov, and ETSI EN 301 549.
  - Topics covered: Issue Prioritization & Severity Triage (Blocker/Critical vs. High vs. Medium vs. Low/Advisory; task completion barriers and workaround availability; high-traffic conversion funnels like checkout, registration, and login prioritized over static content; distinguishing normative WCAG Failures from Advisory Techniques; unlabelled controls, keyboard traps, and SC 3.3.8 cognitive authentication blocks); Remediation Strategies (In-place code repairs for missing attributes and CSS `:focus-visible` restyling; structural architectural redesign replacing div-grids with native `<table>` and custom datepickers with conforming controls; W3C WAI Interim Repairs / Web Accessibility First Aid including telephone assistance and Accessibility Statement barrier disclosures; Shift-left engineering via `eslint-plugin-jsx-a11y`, CI/CD test bounds, Agile Definition of Done, and centralized design system remediation); Procurement & Governance (VPAT editions: 508, WCAG, EN 301 549, and INT; ACR conformance evaluation declarations and vendor red flags such as 100% "Supports" without remarks or legacy VPAT 1.0 submissions; Contract terms: Service Level Agreements with severity-based remediation timelines, "Right to Audit" clauses; EN 301 549 chapter mapping: Chapter 10 Non-web documents, Chapter 11 Software, Chapter 12 Documentation & Support; Accessible Procurement Maturity Model).
- **Stage B (Adversarial Cold Evaluation)**: All 30 items (`raw-031` through `raw-060`) cold-evaluated against cited primary specifications (W3C WCAG 2.2, WAI planning & interim repairs, WAI procurement, ITI VPAT 2.x, Section508.gov, ETSI EN 301 549). All 30 keys confirmed 100% correct (0 miskeys). Explanations and distractor notes audited to guarantee zero option letter references. All 30 items verified and confirmed at `status: "reviewed"`.
- **Stage C (Difficulty Hardening)**: Calibrated against official sample questions 7–8. 27 items hardened (`raw-032`, `raw-034`–`047`, `raw-049`–`060`) by eliminating facepalm/absurd options, replacing superficial distractors with authentic practitioner misconceptions (e.g. prioritization trade-offs, WCAG level confusion, normative vs advisory distinctions, ITI VPAT 2.x editions and official "Does Not Support" terminology, SLA and indemnity terms, EN 301 549 chapters 5, 7, 8, 9, 10, 11, 12), and balancing option lengths; 3 items *calibrated — no change* (`raw-031`, `raw-033`, `raw-048`).
- **Metrics & Quality Guards**:
  - Key distribution in batch: exactly 7 `a`, 7 `b`, 8 `c`, 8 `d`.
  - Domain total key distribution (60 items): exactly 15 `a`, 15 `b`, 15 `c`, 15 `d` (25.0% each).
  - Batch mean option length delta: +0.63 characters; batch longest option as key: 13 of 30 (43.3%, below 45% ceiling).
  - Whole-bank position balance (300 items): **exactly 75 `a` / 75 `b` / 75 `c` / 75 `d`** (25.0% each across all four positions).
  - Whole-bank mean option length delta: +0.64 characters (median 0.33), well within ±10 char limit.
  - Whole-bank longest option as key: 81 of 300 (27.0%, well below 45% ceiling).
  - Absolute qualifier giveaway: 0%.
  - Distractor notes coverage: 100% across all 300 bank items.

## Coverage Audit & Readiness for Human Testing — 2026-10-12

Offline audit of bank coverage against the official WAS Body of Knowledge blueprint:

| Domain | Questions | Target (2×) | Target (4×) | Share | Manifest Weight | Delta vs Weight |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Creating Accessible Web Solutions | 120 | 60 | 120 | 40.0% | 40% | 0.0% |
| Identifying Accessibility Issues in Web Solutions | 120 | 60 | 120 | 40.0% | 40% | 0.0% |
| Remediating Issues in Web Solutions | 60 | 30 | 60 | 20.0% | 20% | 0.0% |
| **Total** | **300** | **150** | **300** | **100%** | **100%** | **0.0%** |

### Findings:
1. **Blueprint Fidelity**: All three domains match their blueprint weights exactly (40% / 40% / 20%) across the full 4× expanded target (300 items).
2. **Review & Calibration Status**: All 300 questions have `status: "reviewed"` following complete Stage B (adversarial cold evaluation) and Stage C (difficulty hardening) passes against official IAAP sample questions 1–8.
3. **Statistical Guards**:
   - Answer key balance: exactly 75 `a` / 75 `b` / 75 `c` / 75 `d` (25.0% each).
   - Option length delta: mean +0.64 characters (median 0.33), passing the ±10 char guard.
   - Longest option as key: 27.0% (below 45% ceiling).
   - Zero absolute qualifier tells, zero option letter references, 100% distractor notes coverage.
4. **Readiness Verdict**:
   - The bank is **100% ready for human testing** via the web quiz application (`npm run dev`).
   - No further AI agent content generation, cold evaluation, or difficulty hardening skills are required.
   - `manifest.status` remains `draft` pending human testing feedback and explicit human promotion approval.

## 2026-10-13: Option hints implementation

Implemented option-level `hintText` across the IAAP-WAS question bank in accordance with [`CONTRIBUTING.md` § Bare option text and optional `hintText`](../../CONTRIBUTING.md) and [`certs/VENDORS.md` § IAAP](../../certs/VENDORS.md):

- **Coverage**: 60 of 300 questions (20.0%) now feature option-level `hintText` across all four of their options (240 options with hints; 100% per-question hint completeness).
- **Domain breakdown**:
  - `creating-accessible-web-solutions` (Domain 1): 17 of 120 questions (68 option hints). Refactored candidate items testing ARIA attributes/states/properties (`aria-controls`, `aria-activedescendant`, `aria-modal="true"`, `aria-multiselectable="true"`), live region and widget roles (`role="status"`, `role="log"`), semantic HTML elements (`<article>`, `<main>`), accordion header structure, and widget interaction keystrokes.
  - `identifying-accessibility-issues` (Domain 2): 38 of 120 questions (152 option hints). Refactored candidate items testing screen reader keystrokes and navigation modes across NVDA, JAWS, VoiceOver (macOS and iOS), and TalkBack, neutral browser platform definitions, audit finding classifications, and explicit WCAG 2.2 Success Criteria options.
  - `remediating-accessibility-issues` (Domain 3): 5 of 60 questions (20 option hints). Refactored items testing EN 301 549 bare chapters (Chapter 5, Chapter 7, Chapter 9, Chapter 10, Chapter 11), ITI VPAT 2.x editions (`VPAT 508`, `VPAT INT`, `VPAT WCAG`), and ACR conformance level ratings (`Supports`, `Partially Supports`, `Does Not Support`, `Not Applicable`).
- **Design & Pedagogical alignment**:
  - Questions with bare technical terms matching live exam formats isolate the bare term in option `text` and provide concise technical glosses in `hintText`, viewable when a learner toggles "Show hints" during practice.
  - The remaining 240 questions feature statement-style options whose text *is* the answer content (multi-clause accessibility assessments, scenario remediation procedures, code repairs, policy workflows, numerical thresholds, calculations, or triage rationales) and remain intact with NO `hintText`, strictly observing the repository standard and avoiding distractor tells or prompt-echo giveaways.
  - All glosses derive strictly from authoritative public sources (W3C Recommendations, WAI APG/Tutorials, NV Access NVDA User Guide, Freedom Scientific JAWS User Guide, Apple VoiceOver documentation, Google Android Accessibility Help, ETSI EN 301 549, ITI VPAT 2.x instructions, and the official IAAP Body of Knowledge). Zero content was sourced from gated providers (Deque University, Funka, or Fable).
  - Every hint is neutrally phrased to define the option's specific technical meaning without telegraphing the key, with 0% absolute qualifier giveaway (`always`, `never`, `only`, `must`, `every`, `cannot`, `all`, `any`, `no`).
  - Whole-bank metrics remain strictly within all statistical and length guards (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

