# Microsoft Certified: Azure AI Apps and Agents Developer Associate (AI-103) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public Microsoft Exam AI-103 study guide ("Skills
measured as of April 16, 2026", updated 2026-07-07). Recon performed on
2026-10-11.

## Predecessor exam: AI-102 retirement

Exam AI-102 (_Designing and Implementing a Microsoft Azure AI Solution_) was
officially retired on June 30, 2026 at 11:59 PM CST. Microsoft replaced AI-102
with **Exam AI-103: Developing AI Apps and Agents on Azure**, updating the role
focus toward agentic architectures, Microsoft Foundry Agent Service, and multimodal
workflows. Initial recon evaluated AI-102, verified its retirement status, and
switched to AI-103 as the active certification path.

## Bank status: `draft`

`manifest.status` is `draft`. The bank holds 100 questions (100% reviewed, 0% draft),
fully satisfying the 2× exam baseline (`2 * manifest.examQuestionCount = 100`)
proportionally distributed across all five domains matching normalized blueprint
weights (28 / 33 / 13 / 13 / 13). Promoted items were verified across independent
cold evaluation and difficulty hardening passes. Status remains `draft` pending
final human promotion approval in Phase 4.

## Blueprint and weights

Microsoft publishes domain percentage ranges in the official study guide:

- Plan and manage an Azure AI solution: 25–30% (midpoint 27.5%)
- Implement generative AI and agentic solutions: 30–35% (midpoint 32.5%)
- Implement computer vision solutions: 10–15% (midpoint 12.5%)
- Implement text analysis solutions: 10–15% (midpoint 12.5%)
- Implement information extraction solutions: 10–15% (midpoint 12.5%)

Weights were normalized using the largest-remainder method (`npm run scaffold -- --normalize "25-30,30-35,10-15,10-15,10-15"`):

| Domain                                        | Slug                                            |   Weight | Target (1x: 50) | Target (2x: 100) | Bank Questions (2x) |
| --------------------------------------------- | ----------------------------------------------- | -------: | --------------: | ---------------: | ------------------: |
| Plan and manage an Azure AI solution          | `plan-and-manage-an-azure-ai-solution`          |      28% |              14 |               28 |                  28 |
| Implement generative AI and agentic solutions | `implement-generative-ai-and-agentic-solutions` |      33% |              17 |               33 |                  33 |
| Implement computer vision solutions           | `implement-computer-vision-solutions`           |      13% |               7 |               13 |                  13 |
| Implement text analysis solutions             | `implement-text-analysis-solutions`             |      13% |               6 |               13 |                  13 |
| Implement information extraction solutions    | `implement-information-extraction-solutions`    |      13% |               6 |               13 |                  13 |
| **Total**                                     |                                                 | **100%** |          **50** |          **100** |             **100** |

Exam specifications from the blueprint:

- Total items: ~50 questions (Associate level standard)
- Exam duration: 100 minutes
- Passing score: 700 / 1,000

## Composition and coverage audit

Audited against the 100-question bank:

- **Distribution**: Proportional across all 5 domains (28 / 33 / 13 / 13 / 13, zero delta against 2× target).
- **Question status**: 100 of 100 questions are `reviewed` (100%).
- **Item formats**: 100 single-select items (100%), matching the blueprint objectives through multiple-choice scenarios.
- **Single-select position distribution**: 25 A / 27 B / 24 C / 24 D across `a`–`d` (max position share 27.0%, uniform distribution).
- **Option length delta**: Mean correct-option length minus distractor length is +0.09 characters (median 0.00 chars), well within the ±10.0 character ceiling.
- **Longest option as key share**: 29 of 100 items (29.0%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 100 questions carry complete explanations without option letter references.
- **Sourcing**: 69 unique authoritative documentation pages across Microsoft Learn (`learn.microsoft.com/en-us/azure/*`).
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).
- **Option hints**: 59 of 100 questions (59.0%, 236 options) feature `hintText`. 41 statement-style questions remain intact with no hints.

## Known coverage limits and deliberate boundaries

- **Associate-level persona**: Aligned with the Azure AI engineer profile (builds, manages, and deploys agents and AI solutions leveraging Microsoft Foundry; Python experience; foundational to associate depth). Excludes deep custom ML training math and non-Azure infrastructure.
- **Single-select modeling**: All exam scenarios are faithfully represented through single-select items (`type: "single"`).
- **Unweighted sub-skills**: The guide provides bulleted skill objectives without individual percentage weights; `manifest.json` omits `skills` to avoid artificial sub-skill quotas while maintaining comprehensive topic coverage.
- **GA vs Preview**: Focuses on GA features with high-frequency Preview capabilities included as noted in official guidelines.

## Official sample question inventory

The official AI-103 study guide publishes **0 sample questions** within its text.

Because the guide lacks embedded vendor sample items, cognitive depth calibration relies on:

1. Candidate profile definitions in the blueprint (Azure AI developer using Microsoft Foundry).
2. Explicit objective boundaries in the study guide.
3. Official vendor documentation examples and quickstarts.

## Calibration set and firewall

No third-party calibration question set is used. A sample set of 10 third-party items from a public prep video was inspected during recon and deliberately rejected due to severe construction defects (transparent facepalm distractors, grammatical tells via "only" qualifiers, and redundant scenarios).

Authoring calibrates strictly from candidate persona definitions, official Microsoft Learn architecture documentation, and distractor plausibility rules under the repository firewall:

> **Calibration only.** No question, option, or rationale here derives from that
> set, or from any other third-party bank. It informed how deep and how
> scenario-shaped a question should be, never what a question says.

## Sourcing and vendor documentation rules

Recon verdict: **GO-WITH-CONSTRAINTS** (approved 2026-10-11).

- Study guide: `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103`
- Normalized domain weights sum to 100%. Public, unauthenticated documentation exists for every domain.
- Constraints: 0 embedded sample questions; no external calibration set; domain weights normalized from ranges.

### Classified hosts

- **Citable documentation (`learn.microsoft.com`)**:
  - `https://learn.microsoft.com/en-us/azure/ai-services/*` — Azure AI services, Content Safety, Speech, Vision, Language, Translator
  - `https://learn.microsoft.com/en-us/azure/ai-services/agents/*` — Microsoft Foundry Agent Service
  - `https://learn.microsoft.com/en-us/azure/ai-services/openai/*` — Azure OpenAI
  - `https://learn.microsoft.com/en-us/azure/search/*` — Azure AI Search
  - `https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/*` — Document Intelligence
  - `https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/*` — Azure AI Vision
- **Readable-but-not-citable**:
  - Certification landing pages (`/credentials/certifications/*`): Evidence of coverage only.
  - Learning paths (`/training/paths/*`): Curriculum outline only.
  - Microsoft Tech Community blogs: Lifecycle and announcement context only.
- **Excluded**:
  - Microsoft Learn Practice Assessments (`/practice/assessment`): Gated behind login, confidential prep items.
  - Gated lab environments / MOC courseware: Gated behind login/course registration.
  - Third-party dumps or unverified mirrors: Fails authority and content rules.

## Adjudications

Standing rulings and technical adjudications:

### Distractor design and hardening rulings

Calibrated against Associate-level Azure AI Developer profile:

- **Plan and manage (7 calibrated intact, 21 hardened)**: Removed giveaway model descriptors in `002`; replaced synthetic distractors with authentic Azure services, deployment tiers, and least-privilege RBAC roles.
- **Generative AI and agents (28 calibrated intact, 5 hardened)**: Tightened distractors in `012`, `023`, `030`, `032`, `033`; replaced zero temperature facepalm with realistic misconception in `033`.
- **Computer vision (12 calibrated intact, 1 hardened)**: Replaced out-of-domain translator distractor with plausible vision payload parameter in `013`.
- **Text analysis (8 calibrated intact, 5 hardened)**: Strengthened genuine speech technologies (PLS, `<emphasis>`, Speaker Recognition) across `001`, `010`, `011`, `012`, `013`.
- **Information extraction (10 calibrated intact, 3 hardened)**: Replaced generic text search with authentic AI Search vector architectures in `001`, `008`, `013`.
- **Absolute qualifiers**: 0% giveaway across all single-select items.

### Key and source repairs

- **Seed smoke test (2026-10-11)**: 5 initial draft items verified against primary documentation (`plan-and-manage-001`, `genai-001`, `vision-001`, `text-001`, `info-extraction-001`).
- **Item repairs**: `ai-103-plan-and-manage-an-azure-ai-solution-022` polished to specify SQL Database view (where high-water mark applies) rather than Blob Storage. Canonical documentation URLs updated for prompt flow and agent tracing. 0 miskeys detected across the 100-question bank.

### Option hints implementation (2026-10-13)

- 59 of 100 questions (236 options) feature neutral, non-telegraphing `hintText` glosses for bare services, models, SDK evaluators, parameters, and algorithms matching exam format.
- 41 statement-style scenario questions remain intact without hints, strictly observing the repository standard.

## Maintenance audits

- **2026-10-11**: Recon completed. Verified AI-102 retirement and approved AI-103 GO-WITH-CONSTRAINTS. Bank scaffolded with 5 seed items.
- **2026-10-11**: Full bank orchestration to 2× baseline (100 items: 28 / 33 / 13 / 13 / 13). Independent cold evaluation confirmed 0 miskeys (item `022` polished). Difficulty hardening calibrated all domains. All 100 items promoted to `reviewed`.
- **2026-10-13**: Option hints pass added 236 option hints across 59 questions with zero impact on bias guards. `npm run check` clean.
