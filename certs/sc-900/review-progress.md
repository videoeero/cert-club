# SC-900 review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the official Microsoft SC-900 skills outline measured as of
October 21, 2026 (guide version metadata `ms.date: 2026-08-16`, last updated
`2026-09-21`). Recon performed on 2026-10-11.

## Bank status: `draft`

`manifest.status` is `draft`. The bank holds 80 questions (100% reviewed, 0% draft),
fully satisfying the 2× exam baseline (`2 * manifest.examQuestionCount = 80`)
proportionally distributed across all four domains matching blueprint weights
(10 / 22 / 30 / 18). Promoted items were verified across cold evaluation and difficulty
hardening passes. Status remains `draft` pending final human promotion approval.

## Blueprint and weights

Microsoft publishes domain ranges for Exam SC-900:

- Describe the concepts of security, compliance, and identity: 10–15% (midpoint 12.5%)
- Describe the capabilities of Microsoft Entra: 25–30% (midpoint 27.5%)
- Describe the capabilities of Microsoft security solutions: 35–40% (midpoint 37.5%)
- Describe the capabilities of Microsoft compliance solutions: 20–25% (midpoint 22.5%)

Normalized using midpoint and largest-remainder arithmetic via
`npm run scaffold -- --normalize "10-15,25-30,35-40,20-25"`:
The midpoints sum to 100%. Floored values (12, 27, 37, 22) sum to 98. Allocating
the two remaining points by largest fractional remainder produces 13%, 28%,
37%, and 22%.

| Domain                                                      | Slug                                                          |   Weight | Target (1x: 40) | Target (2x: 80) | Bank Questions (2x) |
| ----------------------------------------------------------- | ------------------------------------------------------------- | -------: | --------------: | --------------: | ------------------: |
| Describe the concepts of security, compliance, and identity | `describe-the-concepts-of-security-compliance-and-identity`   |      13% |               5 |              10 |                  10 |
| Describe the capabilities of Microsoft Entra                | `describe-the-capabilities-of-microsoft-entra`                |      28% |              11 |              22 |                  22 |
| Describe the capabilities of Microsoft security solutions   | `describe-the-capabilities-of-microsoft-security-solutions`   |      37% |              15 |              30 |                  30 |
| Describe the capabilities of Microsoft compliance solutions | `describe-the-capabilities-of-microsoft-compliance-solutions` |      22% |               9 |              18 |                  18 |
| **Total**                                                   |                                                               | **100%** |          **40** |          **80** |              **80** |

Exam specifications from the blueprint:

- Total items: 40 questions
- Duration: 45 minutes
- Formats: Single-select and multi-select (select-2) questions.

## Composition and coverage audit

Audited against the 80-question bank:

- **Distribution**: Proportional across all 4 domains (10 / 22 / 30 / 18, zero delta against 2× blueprint target).
- **Question status**: 80 of 80 questions are `reviewed` (100%).
- **Item formats**: 73 single-select, 7 multi-select (all select-TWO with varied non-leading combinations).
- **Single-select position distribution**: 18 A / 19 B / 18 C / 18 D across `a`–`d` (max position share 26.0%, uniform distribution).
- **Option length delta**: Mean correct-option length minus distractor length is -0.75 characters (median -0.67 chars), passing the ±10.0 character ceiling.
- **Longest option as key share**: 11 of 73 single-select items (15.1%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% across all 80 questions, fully explained without option letter references.
- **Sourcing**: 76 distinct authoritative documentation pages across Microsoft Learn (`https://learn.microsoft.com/*`).
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).
- **Option hints**: 66 of 80 questions (82.5%, 264 options) feature `hintText`. 14 statement-style questions remain intact with no hints.

## Known coverage limits and deliberate boundaries

- **Foundational depth boundary**: In accordance with the candidate persona (business stakeholders, new IT professionals, foundational literacy), items test conceptual discrimination across architectural mechanisms, identity models, security tools, and compliance controls without testing obscure syntax, parameter strings, or pricing details.
- **Answer format modeling**: SC-900 objectives are faithfully represented through single-select and multi-select items; no specialized UI answer shapes (drag-and-drop, hot areas) are required.

## Sample questions and cognitive anchor

The official SC-900 study guide contains **0 sample questions**. Microsoft directs candidates to an interactive sandbox and Practice Assessment rather than embedding static items in the guide text.

Without vendor sample items, cognitive depth is anchored by:

1. Candidate profile definitions in the blueprint (foundational security, compliance, and identity concepts).
2. Explicit conceptual discrimination rules across product boundaries.

## Calibration and firewall

Proceeding without a third-party calibration set.

> **Calibration only.** No question, option, or rationale here derives from that
> set, or from any other third-party bank. It informed how deep and how
> scenario-shaped a question should be, never what a question says.

## Sourcing and vendor documentation rules

Recon verdict: **GO-WITH-CONSTRAINTS** (approved 2026-10-11).

- Study guide: `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900`
- Normalized domain weights sum to 100%. Public, authoritative documentation exists for all four domains.
- Constraints: 0 embedded sample questions in guide; conceptual discrimination prioritized.

### Classified hosts

- **Citable documentation (`learn.microsoft.com`)**:
  - Microsoft Zero Trust & Security: `https://learn.microsoft.com/en-us/security/*`, `/azure/security/*`
  - Microsoft Entra: `https://learn.microsoft.com/en-us/entra/*`
  - Microsoft Sentinel: `https://learn.microsoft.com/en-us/azure/sentinel/*`
  - Microsoft Defender XDR & Defender for Cloud: `https://learn.microsoft.com/en-us/defender-xdr/*`, `/azure/defender-for-cloud/*`
  - Microsoft Purview: `https://learn.microsoft.com/en-us/purview/*`
  - Service Trust Portal: `https://learn.microsoft.com/en-us/microsoft-365/compliance/get-started-with-service-trust-portal`
- **Readable-but-not-citable**:
  - Certification landing page (`/credentials/certifications/security-compliance-and-identity-fundamentals/`): Logistics and audience only.
  - Microsoft Learn training modules (`/training/paths/*`): Curriculum outline only; factual claims must cite canonical product docs.
- **Excluded**:
  - Microsoft Practice Assessments (`/practice/assessment`): Gated behind login, confidential prep items.
  - Third-party dumps and unverified mirrors: Fails gate, authority, and content rules.

## Adjudications

Standing rulings and technical adjudications:

### Distractor design and hardening rulings

A complete solvability and distractor audit across all 80 items established:

- **No cross-domain or cartoonish throwaways**: Implausible distractors ("Physical perimeter wall", "Mailbox auto-expanding archive", "Database DLP") were eliminated. Distractors name authentic Microsoft services, tiers, or capabilities at the proper level of confusion.
- **Domain 1 (5 calibrated intact, 5 hardened)**: Tightened stems to eliminate lexical echo (e.g. `005`, `007`); upgraded distractors to test Defense-in-depth concentric barriers vs other paradigms (`003`), Zero Trust principles (`004`), and cloud perimeters (`008`).
- **Domain 2 (8 calibrated intact, 14 hardened)**: Replaced generic account/sync distractors with authentic Entra workload and device mechanisms (`003`, `004`), External ID capabilities (`005`, `006`), hybrid auth models (`009`), credential policies (`010`, `013`), SSPR writeback (`014`), and Identity Governance features (`020`, `021`, `022`).
- **Domain 3 (16 calibrated intact, 14 hardened)**: Enforced clear platform boundaries between SIEM, SOAR, CSPM, CWPP, and XDR (`001`, `018`, `023`); isolated Key Vault object types (`011`) and Managed HSM tiers (`012`); hardened Defender for Storage (`017`), Office 365 (`024`, `025`), Endpoint (`026`), Cloud Apps CASB (`028`), Identity (`029`), and Vulnerability Management (`030`).
- **Domain 4 (7 calibrated intact, 11 hardened)**: Differentiated Purview Compliance Manager from Communication Compliance (`001`); isolated document fingerprinting (`006`), Endpoint DLP for USB/clipboard/print restrictions (`012`), Records Management immutability (`013`), and retention policies vs labels (`014`).
- **Absolute qualifiers**: 0% giveaway across all single-select items.

### Key and source repairs

- `sc-900-describe-the-capabilities-of-microsoft-entra-017`: Hardened distractors to authentic Entra ID Protection/CA controls while preserving key `c` and length balance.
- `sc-900-describe-the-capabilities-of-microsoft-security-solutions-023`: Updated legacy documentation URL redirect to canonical Defender XDR path.

### Option hints implementation (2026-10-12)

- 66 of 80 questions (264 options) feature neutral, non-telegraphing `hintText` glosses for bare service, tool, feature, and principle names matching exam format.
- 14 statement-style questions remain without hints to avoid telegraphing answer keys.

## Maintenance audits

- **2026-10-11**: Recon completed. Approved GO-WITH-CONSTRAINTS. Bank scaffolded with 4 initial seed items.
- **2026-10-12**: Full bank orchestration to 2× baseline (80 items). Independent cold evaluation confirmed 80/80 items (0 miskeys). Difficulty hardening calibrated all domains. All 80 items promoted to `reviewed`.
- **2026-10-12**: Option hints pass added 264 option hints across 66 questions with zero impact on bias guards. `npm run check` clean.
