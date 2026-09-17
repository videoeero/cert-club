# AWS Certified Cloud Practitioner (CLF-C02) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public AWS Certified Cloud Practitioner (CLF-C02) exam
guide checked on September 3, 2026. Sources and bank verified on September 17, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-11 following complete blueprint coverage.
All 130 questions are `reviewed` (0 draft). With 130 questions against a 65-question live exam,
the bank provides exactly 2× exam coverage proportionally distributed across all four domains
to match blueprint weights with zero delta (31 / 39 / 44 / 16).

## Blueprint and weights

The official CLF-C02 guide assigns these weights to its four domains:

| Domain                        | Slug                            |   Weight | Target (65) | Bank Questions (2×) |
| ----------------------------- | ------------------------------- | -------: | ----------: | ------------------: |
| Cloud Concepts                | `cloud-concepts`                |      24% |          16 |                  31 |
| Security and Compliance       | `security-and-compliance`       |      30% |          20 |                  39 |
| Cloud Technology and Services | `cloud-technology-and-services` |      34% |          22 |                  44 |
| Billing, Pricing, and Support | `billing-pricing-and-support`   |      12% |           8 |                  16 |
| **Total**                     |                                 | **100%** |      **65** |             **130** |

Exam specs from blueprint:

- Total items: 65 questions
- Duration: 90 minutes
- Format: 107 single-select items, 23 multiple-response items (five options, select-TWO), matching the exam guide's format. Multi-response keys use distinct combinations; none is a leading run.

## Composition and coverage audit

Audited against the 130-question bank:

- **Distribution**: Proportional across all 4 domains (31 / 39 / 44 / 16, zero delta against 2× target).
- **Single-select position distribution**: 28 A / 27 B / 26 C / 26 D across `a`–`d` (max 26.2%, well below the 50% ceiling).
- **Option length delta**: Mean correct-option length minus distractor length is -1.02 characters (median -0.83 chars), within the ±10.0 character ceiling.
- **Longest option as key share**: 20 of 107 single-select items (18.7%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 130 questions carry complete explanations.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

## Known coverage limits and deliberate boundaries

- **AWS Support plans omission**: Domain 4 intentionally omits questions on AWS Support plan details. AWS announced a January 2027 plan transition while the current exam guide still names outgoing plans; authoring to outgoing tiers would create avoidable near-term ambiguity.
- **Whitepaper vs service docs**: One shared-responsibility question cites the maintained public `aws.amazon.com` page because the older whitepaper is marked historical. Four questions cite the current AWS Overview whitepaper (published June 2, 2026); their claims remain accurate, but service-specific pages should be preferred on future refreshes.
- **Initial wording adjustments**: Four non-blocking wording and metadata items resolved during initial review: replaced a superseded Operational Excellence definition; corrected one Well-Architected subdomain; removed an unsupported console-location detail from root-user question; and removed an inferred failover phrase from Availability Zones explanation.

## Official sample question inventory

The official AWS Certified Cloud Practitioner sample questions set (`AWS-Certified-Cloud-Practitioner_Sample-Questions.pdf`) anchors cognitive depth across 10 items:

1. **Sample 1 (Domain 2)**: Shared responsibility model — AWS responsible for physical security of data centers. Key: B.
2. **Sample 2 (Domain 3)**: Database migration service — AWS Database Migration Service (AWS DMS). Key: B.
3. **Sample 3 (Domain 1)**: Hybrid cloud deployment model (connecting on-premises infrastructure to AWS). Key: B.
4. **Sample 4 (Domain 3)**: Virtual network creation in AWS — Amazon VPC. Key: D.
5. **Sample 5 (Domain 1)**: Benefits of the cloud — agility through reduced provisioning time. Key: C.
6. **Sample 6 (Domain 3)**: AWS global infrastructure — Edge locations for low-latency CloudFront delivery. Key: B.
7. **Sample 7 (Domain 4)**: Consolidated billing — volume discount pooling across accounts. Key: B.
8. **Sample 8 (Domain 2)**: IAM security best practices — least privilege and temporary credentials. Key: C.
9. **Sample 9 (Domain 3)**: CloudWatch alarms triggering notifications via Amazon SNS. Key: A.
10. **Sample 10 (Domain 4)**: AWS Pricing Calculator for architectural cost estimates. Key: C.

Vendor sample items are concise concept-identification items with 1–2 plausible category alternatives. The bank's questions are scenario-grounded and sit firmly at or above this anchor.

## Difficulty calibration and distractor hardening

All four domains underwent distractor hardening (`skills/harden-domain-questions`) to eliminate facepalms and unchallenging cross-category options, replacing them with authentic architectural near-misses (65 hardened, 65 calibrated-no-change):

| Domain                        |   Total | Hardened | Calibrated | Hardening Focus                                                                                                                                                                                     |
| ----------------------------- | ------: | -------: | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud Concepts                |      31 |       14 |         17 | Replaced giveaway terms with CAF perspective distinctions (People vs Business/Governance), 7 Rs migration distinctions, and Capex vs Opex financial mechanics.                                      |
| Security and Compliance       |      39 |       21 |         18 | Replaced absurd throwaways with stateful Security Groups vs stateless NACL rules, IAM roles/instance profiles vs access keys, GuardDuty vs Inspector scopes, and AWS Artifact compliance retrieval. |
| Cloud Technology and Services |      44 |       14 |         30 | Replaced cross-category throwaways in Auto Scaling, Aurora, Transit Gateway, Systems Manager, Direct Connect, and FSx with authentic operational near-misses.                                       |
| Billing, Pricing, and Support |      16 |       16 |          0 | Replaced commercial throwaways with Savings Plans commitment terms, Cost Explorer vs Budgets capabilities, Compute Optimizer trade-offs, and Consolidated Billing mechanics.                        |
| **Total**                     | **130** |   **65** |     **65** | **All 130 items scenario-grounded; all bias guards passing.**                                                                                                                                       |

## Sourcing and vendor documentation rules

All questions are authored from the public exam guide, public AWS documentation, and whitepapers. Certification exam items, AWS Skill Builder practice questions, third-party dumps, and gated training content are excluded.

**AWS docs `.md` readability**: `docs.aws.amazon.com/*.html` pages serve clean markdown text directly when requested with `.md` (or return a 301 redirect to the `.md` endpoint), resolving previous client-rendered limitations. Recorded in `certs/VENDORS.md`.

## Maintenance audits

### Figure-bearing claims baseline (2026-09-13)

Evaluated figure-bearing items against documentation:

- 1 defect identified and rewritten: `billing-...-006` on `aws.amazon.com/free` (Free Tier updated from "12 Months Free" / 750 EC2 hours to Free/Paid plan split with up to $200 credits over 6 months).

### Recurring source drift audit (2026-09-17)

Comprehensive drift audit executed across all 114 unique URLs (130 questions) following `audit-sources`:

- **Blueprint drift**: 0% drift. Exam guide verified via `.md` endpoint. Domain titles and weights match exactly (24/30/34/12).
- **Source liveness**: 100% verified live across all 114 URLs (0 broken links).
- **Documentation drift defects resolved (3 items rewritten)**:
  - `billing-007`: AWS Cost Explorer expanded historical data from 12 to 13 months and forecast data to 18 months (`ce-what-is.md`). Updated explanation and `sourceNote`.
  - `cloud-concepts-026`: Re-cited to `whatisedge.html` and rewritten after AWS retired the Snowball Edge 80 TB HDD device variant (leaving 210 TB NVMe) and closed Snowball Edge to new customers.
  - `tech-020`: `CHAP_AuroraOverview.md` documents cluster volume storage maximum increased from 128 TiB to 256 TiB. Updated explanation and distractor notes.
- **Documentation redirects re-cited (8 items)**:
  - `cloud-concepts-028`: Re-cited to `prescriptive-guidance/.../application-portfolio-assessment-guide/detailed-business-case.html` (on-premises data center TCO).
  - `cloud-concepts-031`: Re-cited to `overview-aws-cloud-adoption-framework/accelerating-business-outcomes.html` (CAF business outcomes).
  - `tech-028`: Re-cited to `ebs/.../what-is-ebs.html` (persistent block storage).
  - `tech-031`: Re-cited to `filegateway/latest/files3/what-is-file-s3.html` (S3 File Gateway hybrid storage).
  - `tech-042`: Re-cited to `eventbridge/.../eb-what-is.html` (serverless event bus).
  - `sec-012`: Re-cited to `lambda/.../security-dataprotection.html` (Lambda shared responsibility).
  - `sec-013`: Re-cited to `AmazonS3/.../security.html` (S3 shared responsibility).
  - `sec-014`: Re-cited to `aws.amazon.com/compliance/pci-faqs/` (PCI DSS application certification).
- **Dispositions**: 27 bump, 8 re-cite, 1 re-cite + rewrite, 2 rewrite, 0 retire across 38 evaluated items.
