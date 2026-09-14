# AWS Certified Cloud Practitioner (CLF-C02) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public AWS Certified Cloud Practitioner (CLF-C02) exam
guide checked on September 3, 2026.

## Bank status: `stable`

`manifest.status` is `stable`. Promoted on 2026-09-11 following complete
blueprint coverage. All 130 questions are `reviewed` (0 draft). With 130 questions
against a 65-question live exam, the bank provides exactly 2× exam coverage
proportionally distributed across all four domains to match blueprint weights with
zero delta (31 / 39 / 44 / 16).

## Blueprint and distribution

The official CLF-C02 guide assigns these weights to its four domains:

| Domain | Slug | Weight | Target (65) | Bank Questions (2×) |
| --- | --- | ---: | ---: | ---: |
| Cloud Concepts | `cloud-concepts` | 24% | 16 | 31 |
| Security and Compliance | `security-and-compliance` | 30% | 20 | 39 |
| Cloud Technology and Services | `cloud-technology-and-services` | 34% | 22 | 44 |
| Billing, Pricing, and Support | `billing-pricing-and-support` | 12% | 8 | 16 |
| **Total** | | **100%** | **65** | **130** |

- **Format mix**: 107 single-select items, 23 multiple-response items (five options, select-TWO), matching the exam guide's format.
- Multi-response keys use distinct combinations (`b+d`, `a+c`, `c+e`, `b+e`, `a+d`, `c+d`); none is a leading run.

## Composition and pattern review

Audited against the 130-question bank:
- **Single-select position distribution**: 28 A / 27 B / 26 C / 26 D across `a`–`d` (max 26.2%, well below the 50% ceiling).
- **Option length delta**: Mean correct-option length minus distractor length is -1.02 characters (median -0.83 chars), within the ±10.0 character ceiling.
- **Longest option as key share**: 20 of 107 single-select items (18.7%), well below the 45% ceiling.
- **Distractor notes coverage**: 100% of distractor options across all 130 questions carry complete explanations.
- **Bias guards**: All pass cleanly (`positionBias`, `lengthBiasMeanDelta`, `longestOptionIsKey`).

## Source and accuracy review

All questions were written from the public exam guide and public AWS documentation and whitepapers. No certification exam items, AWS Skill Builder practice questions, third-party dumps, or gated training content were used.

An independent cold review fetched all cited pages without authentication, verified every key and distractor against cited material, and mapped items back to blueprint task statements. Four initial non-blocking wording and metadata advisories were fixed:
- Replaced a superseded Operational Excellence definition;
- Corrected one Well-Architected question's subdomain;
- Removed an unsupported console-location detail from the root-user question;
- Removed an inferred failover phrase from the Availability Zones explanation.

## Known coverage limits and deliberate boundaries

- **AWS Support plans omission**: Domain 4 intentionally omits questions on AWS Support plan details. AWS announced a January 2027 plan transition while the current exam guide still names outgoing plans; authoring to outgoing tiers would create avoidable near-term ambiguity.
- **Whitepaper vs service docs**: One shared-responsibility question cites the maintained public `aws.amazon.com` page because the older whitepaper is marked historical. Four questions cite the current AWS Overview whitepaper (published June 2, 2026); their claims remain accurate, but service-specific pages should be preferred on future refreshes.

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

| Domain | Total | Hardened | Calibrated | Hardening Focus |
| --- | ---: | ---: | ---: | --- |
| Cloud Concepts | 31 | 14 | 17 | Replaced giveaway terms with CAF perspective distinctions (People vs Business/Governance), 7 Rs migration distinctions, and Capex vs Opex financial mechanics. |
| Security and Compliance | 39 | 21 | 18 | Replaced absurd throwaways with stateful Security Groups vs stateless NACL rules, IAM roles/instance profiles vs access keys, GuardDuty vs Inspector scopes, and AWS Artifact compliance retrieval. |
| Cloud Technology and Services | 44 | 14 | 30 | Replaced cross-category throwaways in Auto Scaling, Aurora, Transit Gateway, Systems Manager, Direct Connect, and FSx with authentic operational near-misses. |
| Billing, Pricing, and Support | 16 | 16 | 0 | Replaced commercial throwaways with Savings Plans commitment terms, Cost Explorer vs Budgets capabilities, Compute Optimizer trade-offs, and Consolidated Billing mechanics. |
| **Total** | **130** | **65** | **65** | **All 130 items scenario-grounded; all bias guards passing.** |

## Figure-bearing claims audit and baseline — 2026-09-13

Following the provenance rules in `CONTRIBUTING.md`, figure-bearing items were evaluated against official AWS documentation:

| Question | Claim under review | Cited page | Verdict | Disposition |
| --- | --- | --- | --- | --- |
| `billing-...-006` | "750 hours", "60 days", "12 Months Free" | `aws.amazon.com/free` | **Defect**: Page no longer offers "12 Months Free" (0 occurrences) or 750 EC2 hours. Page now describes Free/Paid plan split with up to $200 credits over 6 months, alongside Always Free and Short-term trials. | **rewrite** — explanation and `distractorNotes` regrounded on current page text; `sourceCheckedAt` bumped. |
| `billing-...-008` | "$0.00 per GB" | `aws.amazon.com/ec2/pricing/on-demand` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |
| `billing-...-010` | "up to 72%" | `savingsplans/.../what-is-savings-plans` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |
| `billing-...-013` | "$500/month", "80% threshold" | `cost-management/.../manage-ad` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |
| `cloud-...-002` | "48 hours" | `AmazonS3/.../glacier-storage-classes` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |
| `cloud-...-018` | "up to 90%" | `AWSEC2/.../using-spot-instances` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |
| `security-...-020` | "90 days" | `awscloudtrail/.../logging-insights-events-with-cloudtrail` | **Inconclusive**: client-rendered page, not read in this pass. | **none** |

### Population and baseline metrics

A mechanical sweep identified **4 further figure-bearing items** not included in the hand-selected sample:
- `billing-...-001`: one-year / three-year Savings Plans commitment terms;
- `billing-...-007`: "up to the past 12 months", "up to 12 months ahead";
- `cloud-concepts-026`: "up to 80 TB or 210 TB usable storage";
- `cloud-technology-...-020`: "six copies… three Availability Zones", "128 TiB", "10 GB increments".

**Metrics**: 11 total figure-bearing items (7 hand-selected, 4 mechanical). 1 adjudicated to a verdict (1 defect found and rewritten), 6 inconclusive due to client-rendered AWS hosts, 4 unadjudicated. In accordance with repo guidelines, no overall defect rate is recorded for this bank to avoid counting unread client-rendered pages as clean.
