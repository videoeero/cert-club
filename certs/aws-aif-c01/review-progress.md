# AWS Certified AI Practitioner (AIF-C01) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public AWS Certified AI Practitioner (AIF-C01) exam
guide (Version 1.1, published April 30, 2026). Recon performed on 2026-10-08.

## Bank status: `draft`

`manifest.status` is `draft`. All 132 questions are `reviewed` (0 draft, 100%).
With 132 questions against a 65-question live exam, the bank provides 2× exam
coverage (target 130) proportionally distributed across all five domains to match
blueprint weights (28 / 31 / 37 / 18 / 18), with a deliberate +2 surplus in
Domain 1 closing calibration gaps. All quality, balance, and bias guards pass
cleanly.

Promotion to `stable` is recommended following complete blueprint coverage and
adversarial evaluation, pending maintainer confirmation.

## Blueprint and weights

The official AIF-C01 exam guide assigns exact integer weights to its five domains:

| Domain | Slug | Weight | Target (1x: 65) | Target (2x: 130) | Bank Questions (2x) |
| --- | --- | ---: | ---: | ---: | ---: |
| Fundamentals of AI and ML | `fundamentals-of-ai-and-ml` | 20% | 13 | 26 | 28 |
| Fundamentals of GenAI | `fundamentals-of-genai` | 24% | 16 | 31 | 31 |
| Applications of Foundation Models | `applications-of-foundation-models` | 28% | 18 | 37 | 37 |
| Guidelines for Responsible AI | `guidelines-for-responsible-ai` | 14% | 9 | 18 | 18 |
| Security, Compliance, and Governance for AI Solutions | `security-compliance-and-governance-for-ai-solutions` | 14% | 9 | 18 | 18 |
| **Total** | | **100%** | **65** | **130** | **132** |

Exam specifications from the official blueprint:
- Total items: 65 questions (50 scored, 15 unscored)
- Duration: 90 minutes
- Scaled score: 100-1,000; passing score: 700

## Composition and coverage audit

Audited against the 132-question bank:

- **Distribution**: Proportional across all 5 domains (28 / 31 / 37 / 18 / 18 against 26 / 31 / 37 / 18 / 18 2× blueprint target). Domain 1 holds a deliberate +2 surplus (28 vs 26) to close calibration gaps (`027` Transcribe CLM and `028` SageMaker Batch Transform).
- **Question status**: 132 of 132 questions are `reviewed` (0 draft, 100%).
- **Item formats**: 113 single-select, 19 multi-select (all select-TWO), matching the blueprint item formats. Multi-select keys use varied non-leading option combinations.
- **Single-select position distribution**: 28 A / 29 B / 28 C / 28 D across `a`-`d` (max position share 25.7%, well below the 50% ceiling).
- **Option length delta**: Mean correct-option length minus distractor length is +0.89 characters (median +0.33 chars), well within the ±10.0 character ceiling.
- **Longest option as key share**: 28 of 113 single-select items (24.8%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 132 questions carry complete, documented explanations.
- **Sourcing**: 86 distinct authoritative documentation pages across `docs.aws.amazon.com` and `aws.amazon.com`.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).
- **Guessing baselines**: "Always pick the longest option" expected score is 27.9%; "Eliminate absolute qualifiers, then guess" uniquely identifies the key in 0 of 113 questions (26.0% expected score).

## Known coverage limits and deliberate boundaries

- **Foundational depth boundary**: In accordance with the blueprint candidate persona (foundational level, up to 6 months exposure, "uses rather than builds" AI solutions), the bank deliberately excludes model implementation code, custom neural network architecture training from scratch, manual hyperparameter optimization math, and data pipeline script engineering.
- **Ordering and matching item types**: While the AWS exam guide mentions ordering and matching among possible formats, Cert Club models all scenarios through single-select and multi-select questions. Foundational discrimination is tested without requiring specialized UI answer shapes. The guide's verbatim format list (multiple choice, multiple response, ordering, matching; 50 scored questions; no guessing penalty) is preserved in the exam guide (`ai-practitioner-01.md` § Question types).
- **Domain 1 deliberate surplus**: Domain 1 carries 28 questions against its 2x target of 26 (+2 surplus). Following the calibration gap pass, Amazon Transcribe Custom Language Models (`027`) and SageMaker Batch Transform vs real-time/async endpoints (`028`) were added for coverage completeness. This minor surplus was accepted deliberately rather than pruning existing balanced items.
- **Customization trade-offs accepted**: The calibration set's implementation complexity distinction was judged to be sufficiently captured by `fundamentals-of-genai-023` (cost and data curation trade-offs), avoiding redundant questions.
- **Cloud infrastructure scope**: AWS networking and infrastructure questions are strictly bounded to their AI/ML operational contexts (e.g. AWS PrivateLink VPC endpoints for Bedrock, KMS encryption keys for custom models, S3 data lake storage, IAM policies scoped to Bedrock ARNs). General AWS networking, complex route tables, and container orchestration (ECS/EKS) are intentionally excluded.

## Official sample question inventory

The official AWS Certified AI Practitioner exam guide publishes **0 sample questions** in its text or associated markdown pages.

Because the guide lacks embedded vendor sample items, cognitive depth calibration relies on:
1. Candidate profile definitions in the blueprint (foundational level: up to 6 months of exposure to AI/ML on AWS; uses rather than builds AI/ML solutions).
2. Explicit out-of-scope boundaries (no coding/algorithms, no hyperparameter tuning, no pipeline engineering).
3. The third-party calibration set noted below, strictly firewalled.

## Calibration set and firewall

A set of 20 practice questions was identified for question structure, cognitive depth, and scenario calibration.

> **Calibration only.** No question, option, or rationale here derives from that set, or from any other third-party bank. It informed how deep and how scenario-shaped a question should be, never what a question says.

All authored items are written strictly from public AWS documentation.

## Sourcing and vendor documentation rules

All questions are authored from the public exam guide and official AWS documentation.

Recon verdict: **GO-WITH-CONSTRAINTS** — guide is public, authoritative, and versioned (`Version 1.1`, April 30, 2026); exact weights sum to 100%; citable public documentation exists for all five domains. Constraints: 0 embedded sample questions (calibration set used under strict firewall) and ordering/matching formats (accommodated via single/multi-select items).

- **Citable documentation:**
  - `https://docs.aws.amazon.com/bedrock/latest/userguide/` — Amazon Bedrock, Knowledge Bases, Guardrails, Model Evaluation, Data Protection
  - `https://docs.aws.amazon.com/sagemaker/latest/dg/` — Amazon SageMaker AI, Clarify, Model Cards
  - `https://docs.aws.amazon.com/comprehend/latest/dg/` — Amazon Comprehend NLP
  - `https://docs.aws.amazon.com/transcribe/latest/dg/`, `translate`, `lex`, `polly` — AWS managed AI services
  - `https://docs.aws.amazon.com/opensearch-service/latest/developerguide/vector-search.html` — Vector search
  - `https://docs.aws.amazon.com/macie/`, `/awscloudtrail/`, `/config/`, `/iam/` — Security, compliance, governance
  - `https://aws.amazon.com/ai/responsible-ai/` — Responsible AI principles
- **Docs `.md` endpoint**: Pages under `docs.aws.amazon.com` render client-side HTML, but appending `.md` or requesting `.md` yields clean markdown text.
- **Excluded sources:**
  - `explore.skillbuilder.aws` / AWS Skill Builder: Gated behind account registration (fails gate test).
  - Third-party dumps or unverified mirrors: Fails authority and content rules.

## Adjudications

Standing rulings a future author must not undo. Unless noted, keys were never changed; all replacement sources were verified by fetching the page and confirming the supporting text before landing, with `sourceCheckedAt` preserved.

### Distractor design rulings

The evaluate-questions and harden-domain-questions passes established these standing distractor rules for this bank:

- **No cross-modality throwaways**: options from a different modality (e.g. Polly/Rekognition on a text-analysis item) let candidates exclude for free. Replaced within-modality (e.g. `fund-001`, `fund-012`, `fund-016`).
- **No cartoonish/facepalm options**: implausible items ("hardware overclocking", "workforce recruiter") were systematically replaced with authentic practitioner misconceptions and adjacent real AWS services throughout Domains 2-5.
- **Distractors name real AWS services at the right level of confusion**: e.g. Bedrock Custom Models vs JumpStart for open-weights hosting (genai `027`); Secrets Manager vs KMS CMKs for key storage (sec `004`); Comprehend PII vs Guardrails PII masking (sec `029`).
- **Absolute-qualifier elimination solves nothing**: enforced and verified at 0 of 113 single-select items across the whole bank.
- Borderline items resp-013 `d` and resp-016 `c` were upgraded from cartoons to plausible misconceptions ("explainability obligations apply only to the model developer"; "linear models are as opaque as deep networks").
