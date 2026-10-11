# Microsoft Certified: Azure AI Apps and Agents Developer Associate (AI-103) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public Microsoft Exam AI-103 study guide ("Skills
measured as of April 16, 2026", updated 2026-07-07). Recon performed on
2026-10-11.

## Predecessor exam: AI-102 retirement

Exam AI-102 (*Designing and Implementing a Microsoft Azure AI Solution*) was
officially retired on June 30, 2026 at 11:59 PM CST. Microsoft replaced AI-102
with **Exam AI-103: Developing AI Apps and Agents on Azure**, updating the role
focus toward agentic architectures, Microsoft Foundry Agent Service, and multimodal
workflows. Initial recon evaluated AI-102, verified its retirement status, and
switched to AI-103 as the active certification path.

## Bank status: `draft`

`manifest.status` is `draft`. The bank currently holds 5 seed questions (1 per
domain, 0% reviewed, 100% draft). These items serve as the smoke test of the
sourcing plan and schema validation.

Promote to `stable` only when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here. The standard bank authoring
target is 2x the official exam question count (`2 * manifest.examQuestionCount` =
100 questions), providing two full non-overlapping mock exam sessions.

## Blueprint and weights

Microsoft publishes domain percentage ranges in the official study guide:

- Plan and manage an Azure AI solution: 25–30% (midpoint 27.5%)
- Implement generative AI and agentic solutions: 30–35% (midpoint 32.5%)
- Implement computer vision solutions: 10–15% (midpoint 12.5%)
- Implement text analysis solutions: 10–15% (midpoint 12.5%)
- Implement information extraction solutions: 10–15% (midpoint 12.5%)

Weights were normalized using the largest-remainder method (`npm run scaffold -- --normalize "25-30,30-35,10-15,10-15,10-15"`):

| Domain | Slug | Weight | Target (1x: 50) | Target (2x: 100) | Questions |
| --- | --- | ---: | ---: | ---: | ---: |
| Plan and manage an Azure AI solution | `plan-and-manage-an-azure-ai-solution` | 28% | 14 | 28 | 1 |
| Implement generative AI and agentic solutions | `implement-generative-ai-and-agentic-solutions` | 33% | 17 | 33 | 1 |
| Implement computer vision solutions | `implement-computer-vision-solutions` | 13% | 7 | 13 | 1 |
| Implement text analysis solutions | `implement-text-analysis-solutions` | 13% | 6 | 13 | 1 |
| Implement information extraction solutions | `implement-information-extraction-solutions` | 13% | 6 | 13 | 1 |
| **Total** | | **100%** | **50** | **100** | **5** |

Exam specifications from the official blueprint:
- Total items: ~50 questions (Associate level standard)
- Exam duration: 100 minutes
- Passing score: 700 / 1,000

## Skill breakdown

The guide provides bulleted skill objectives under each domain, but does not
publish individual percentage weights for sub-skills. Consequently, the bank does
not declare `skills` in `manifest.json`, avoiding artificial per-skill weight
enforcement while tracking objective coverage across batches.

## Official sample question inventory

The official AI-103 study guide publishes **0 sample questions** within its text.

Because the guide lacks embedded vendor sample items, cognitive depth calibration
relies on:
1. Candidate profile definitions in the blueprint (Azure AI engineer who builds,
   manages, and deploys agents and AI solutions leveraging Microsoft Foundry;
   Python development experience; foundational to associate depth).
2. Explicit objective boundaries in the study guide.
3. Official vendor documentation examples and quickstarts.

## Calibration set and firewall

No third-party calibration question set is used. A sample set of 10 third-party
items from a public prep video was inspected during recon and deliberately
rejected from serving as calibration: the items exhibited significant
construction defects (transparent "facepalm" distractors, grammatical tells
via "only" qualifiers, and redundant scenarios) well below Cert Club's quality
bar.

Instead, authoring calibrates purely from first principles:
1. Candidate profile definitions in the official blueprint.
2. Official Microsoft Learn documentation and architecture guides.
3. Rigorous distractor plausibility adhering to `CONTRIBUTING.md`.

Standing firewall for future passes:

> **Calibration only.** No question, option, or rationale here derives from that
> set, or from any other third-party bank. It informed how deep and how
> scenario-shaped a question should be, never what a question says.

## Format audit

Quoted verbatim from the AI-103 study guide:

> "Most questions cover features that are general availability (GA). The exam
> may contain questions on Preview features if those features are commonly used."

Microsoft exams present items through multiple-choice (single-select and
multi-select), case studies, drag-and-drop, and hotspot controls. In Cert Club,
all scenarios are modeled through single-select (`type: "single"`) and
multi-select (`type: "multi"`). No new schema answer shape is required.

## Sourcing and vendor documentation rules

Recon verdict: **GO-WITH-CONSTRAINTS** — study guide is public and versioned
(April 16, 2026 skills measured outline, updated 2026-07-07); domain weights
normalize cleanly to 100%; public, unauthenticated documentation exists for every
domain on Microsoft Learn.

Constraints:
1. **0 embedded sample questions** in the official guide.
2. **No external calibration set** — question depth calibrated strictly from
   candidate persona and documentation.
3. **Domain weights published as ranges** — normalized via midpoint and
   largest-remainder arithmetic (28 / 33 / 13 / 13 / 13).

### Classified hosts

- **Citable documentation:**
  - `https://learn.microsoft.com/en-us/azure/ai-services/*` — Azure AI services, Content Safety, Speech, Vision, Language, Translator
  - `https://learn.microsoft.com/en-us/azure/ai-services/agents/*` — Microsoft Foundry Agent Service
  - `https://learn.microsoft.com/en-us/azure/ai-services/openai/*` — Azure OpenAI
  - `https://learn.microsoft.com/en-us/azure/search/*` — Azure AI Search
  - `https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/*` — Document Intelligence
  - `https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/*` — Azure AI Vision
- **Readable-but-not-citable:**
  - `https://learn.microsoft.com/en-us/credentials/certifications/*` — Certification landing pages (evidence of coverage only)
  - `https://learn.microsoft.com/en-us/training/paths/*` — Learning path landing pages (curriculum outline only)
  - `https://techcommunity.microsoft.com/*` — Microsoft Tech Community blog posts (lifecycle and announcement context only)
- **Excluded:**
  - Microsoft Learn Practice Assessments (`/practice/assessment`): Requires
    authenticated Microsoft account login (fails gate test) and tests practice
    exam items.
  - Gated lab environments / Microsoft Official Courseware (MOC) labs: Gated
    behind account logins or course registration (fails gate test).
  - Third-party dumps or unauthorized mirrors: Fails authority and content rules.

## Seed question inventory

| Domain | Question ID | Type | Status | Verified Source |
| --- | --- | --- | --- | --- |
| Plan and manage an Azure AI solution | `ai-103-plan-and-manage-an-azure-ai-solution-001` | single | draft | `learn.microsoft.com/.../content-safety/overview` |
| Implement generative AI and agentic solutions | `ai-103-implement-generative-ai-and-agentic-solutions-001` | single | draft | `learn.microsoft.com/.../agents/overview` |
| Implement computer vision solutions | `ai-103-implement-computer-vision-solutions-001` | single | draft | `learn.microsoft.com/.../computer-vision/overview` |
| Implement text analysis solutions | `ai-103-implement-text-analysis-solutions-001` | single | draft | `learn.microsoft.com/.../speech-service/speech-synthesis-markup` |
| Implement information extraction solutions | `ai-103-implement-information-extraction-solutions-001` | single | draft | `learn.microsoft.com/.../search/vector-search-overview` |
