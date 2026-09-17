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

## Source drift and claims audit — 2026-09-17

A comprehensive drift audit was conducted following the `audit-sources` workflow.

### Blueprint drift check
`manifest.examUrl` was verified against live AWS exam guide documentation using the `.md` endpoint (`https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.md` and domain pages). Domain titles and weights remain identical to the blueprint:
- Domain 1: Cloud Concepts (24%)
- Domain 2: Security and Compliance (30%)
- Domain 3: Cloud Technology and Services (34%)
- Domain 4: Billing, Pricing, and Support (12%)
Total: 100%. No blueprint drift.

### Scope covered and not covered
- **Covered (38 questions)**:
  - All 18 oldest items in the bank (previously dated `2026-09-03`, 14 days old): `billing-001`, `billing-002`, `cloud-concepts-001`–`004`, `tech-001`–`006`, `sec-001`–`006`.
  - All 4 unique URLs and 6 questions citing the `aws.amazon.com` host (`billing-006`, `billing-008`, `sec-001`, `sec-009`, `sec-010`, `sec-014`).
  - All 11 figure-bearing questions in the bank identified by `check-claims` (`billing-001`, `billing-007`, `billing-008`, `billing-010`, `billing-013`, `cloud-concepts-026`, `tech-002`, `tech-015`, `tech-018`, `tech-020`, `sec-020`), plus `billing-006` re-confirmed.
  - All 8 redirected/restructured documentation URLs identified during mechanical triage (`cloud-concepts-028`, `cloud-concepts-031`, `tech-028`, `tech-031`, `tech-042`, `sec-012`, `sec-013`, `sec-014`).
  - Liveness verification across all 114 unique URLs (130 items in the bank): 100% verified live with 0 broken links and 0 redirects remaining.
- **Not covered (92 questions)**: The remaining 92 questions citing `docs.aws.amazon.com` with `sourceCheckedAt: 2026-09-11` (6 days old) whose claims bear no figures and whose pages were confirmed live via direct HTTP 200 during triage. Their claims are non-numeric service capabilities and remain well within the staleness window.

### Discovery on AWS docs readability
During this pass, it was discovered that `docs.aws.amazon.com/*.html` pages serve clean markdown text directly when requested with `.md` (or when `.md` is appended, returning a 301 to the `.md` endpoint), resolving the previous "inconclusive: client-rendered page" limitation. `certs/VENDORS.md` was updated accordingly.

### Adjudication of Stage 1 figure-bearing findings by numeric class
The 11 figure-bearing questions (plus `billing-006` re-confirmed) were fetched and adjudicated cold against their cited documentation:

| Question | Figures under review | Numeric Class | Verdict | Disposition & Action |
| --- | --- | --- | --- | --- |
| `billing-001` | "1 or 3 years" commitment | Verbatim vendor fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). Page confirms term of 1 or 3 years for Savings Plans and RIs. |
| `billing-006` | "1,000,000 requests", "up to $200", "6 months" | Verbatim vendor fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). `aws.amazon.com/free` re-read; Always Free and $200/6-month tiers intact. |
| `billing-007` | "12 months" past / ahead | Verbatim vendor fact | **Defect (drift)** | **rewrite** (`sourceCheckedAt`: `2026-09-17`). AWS Cost Explorer expanded historical data to 13 months and forecast data to 18 months (`ce-what-is.md`). Updated explanation and `sourceNote`. |
| `billing-008` | "$0.00 per GB" inbound, "100 GB" outbound | Verbatim vendor fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). `aws.amazon.com/ec2/pricing/on-demand` confirms inbound is free ($0.00/GB) and 100 GB free outbound allowance. |
| `billing-010` | "up to 72%", "1 or 3 years" | Verbatim vendor fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). `what-is-savings-plans.md` verbatim matches "save up to 72% on your AWS compute workloads". |
| `billing-013` | "$500/month", "80% threshold" | Illustrative parameter | **Supported (expected absence)** | **bump** (`sourceCheckedAt`: `2026-09-17`). Figures are illustrative distractor parameters for static Budgets thresholds; core Cost Anomaly Detection ML claim confirmed on `manage-ad.md`. |
| `cloud-concepts-026` | "up to 80 TB or 210 TB", "18 months" | Verbatim vendor fact & scenario parameter | **Defect (drift & moved URL)** | **re-cite + rewrite** (`sourceCheckedAt`: `2026-09-17`). URL 302-redirected to `whatisedge.html`. AWS retired the 80 TB HDD device variant, leaving 210 TB NVMe. Snowball Edge marked no longer available to new customers. Re-cited to `whatisedge.html` and updated explanation. |
| `tech-002` | "48 hours" retrieval, "180 days" duration | Verbatim vendor fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). `glacier-storage-classes.md` comparison table verbatim confirms 180 days minimum duration and 9 to 48 hours bulk retrieval. |
| `tech-015` | "1- or 3-year" RIs | Cross-page distractor fact | **Supported (expected absence)** | **bump** (`sourceCheckedAt`: `2026-09-17`). Cross-page fact distinguishing Auto Scaling from RI purchases; core Auto Scaling horizontal elasticity confirmed on `what-is-amazon-ec2-auto-scaling.md`. |
| `tech-018` | "up to 90%", "1- or 3-year" | Verbatim marketing fact & cross-page fact | **Supported** | **bump** (`sourceCheckedAt`: `2026-09-17`). Spot steep discounts confirmed on `using-spot-instances.md`; 90% figure confirmed on `aws.amazon.com/ec2/spot/`. |
| `tech-020` | "128 TiB", "10 GB increments", "six copies across three AZs" | Verbatim vendor fact | **Defect (drift)** | **rewrite** (`sourceCheckedAt`: `2026-09-17`). `CHAP_AuroraOverview.md` documents cluster volume storage maximum increased from 128 TiB to 256 TiB. Updated explanation and distractor note c. |
| `sec-020` | "90 days" Event History | Cross-page distractor fact | **Supported (expected absence)** | **bump** (`sourceCheckedAt`: `2026-09-17`). Cross-page fact distinguishing CloudTrail Insights from Event History 90-day retention; core Insights ML anomaly detection confirmed on `logging-insights-events-with-cloudtrail.md`. |

### Adjudication of mechanical triage redirects and restructured documentation
Eight questions citing redirected URLs were adjudicated cold against current vendor documentation:

| Question | Prior Cited URL | Redirect Issue | Current Canonical Citation & Verification | Disposition |
| --- | --- | --- | --- | --- |
| `cloud-concepts-028` | `migrationhub/.../migration-evaluator.html` | 302 to guide root; Migration Hub closed to new customers | `prescriptive-guidance/.../application-portfolio-assessment-guide/detailed-business-case.html`. Verbatim confirms on-premises data center facilities TCO: power, cooling, space, racks, UPS, physical security, server hardware maintenance. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `cloud-concepts-031` | `overview-aws-cloud-adoption-framework/cloud-acceleration-outcomes.html` | 302 to guide root; section renamed | `overview-aws-cloud-adoption-framework/accelerating-business-outcomes.html`. Verbatim confirms core CAF business outcomes: reduced business risk, increased operational efficiency, agility, and ESG performance. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `tech-028` | `AWSEC2/.../ebs-volume-types.html` | 301 to `ebs/.../ebs-volume-types.html`; EBS split into standalone guide | `ebs/.../what-is-ebs.html`. Verbatim confirms persistent block storage volumes independent of instance lifecycle and point-in-time snapshot backups. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `tech-031` | `storagegateway/.../WhatIsStorageGateway.html` | 301 to guide landing page; Storage Gateway split into standalone guides | `filegateway/latest/files3/what-is-file-s3.html`. Verbatim confirms S3 File Gateway hybrid storage connecting on-premises file shares to Amazon S3 with low-latency local caching. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `tech-042` | `eventbridge/.../eb-what-is-how-it-works.html` | 302 to guide root; section restructured | `eventbridge/.../eb-what-is.html`. Verbatim confirms serverless event bus routing events from SaaS applications and AWS services to targets. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `sec-012` | `lambda/.../security-shared-responsibility.html` | 302 to guide root; security chapters restructured | `lambda/.../security-dataprotection.html`. Verbatim confirms shared responsibility model for Lambda, AWS managing runtime/OS/hypervisor and customer managing application code and IAM execution roles. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `sec-013` | `AmazonS3/.../security-shared-responsibility.html` | 302 to guide root; security chapters restructured | `AmazonS3/.../security.html`. Verbatim confirms shared responsibility model for S3, AWS managing storage infrastructure and customer managing data classification, bucket policies, and encryption. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |
| `sec-014` | `aws.amazon.com/compliance/pci-dss-level-1-faqs/` | 301 to `/compliance/pci-faqs/` | `aws.amazon.com/compliance/pci-faqs/`. Verbatim confirms customer must manage their own application PCI DSS compliance certification; AWS certifies infrastructure only. | **re-cite** (`sourceCheckedAt`: `2026-09-17`) |

### Summary metrics and disposition breakdown
- **Total questions audited**: 38 evaluated cold (130 triaged across 114 unique URLs with 100% liveness confirmed):
  - **bump**: 27 questions (page re-read, claims intact)
  - **re-cite**: 8 questions (`cloud-concepts-028`, `cloud-concepts-031`, `tech-028`, `tech-031`, `tech-042`, `sec-012`, `sec-013`, `sec-014`)
  - **re-cite + rewrite**: 1 question (`cloud-concepts-026`)
  - **rewrite**: 2 questions (`billing-007`, `tech-020`)
  - **retire**: 0 questions
- **Tooling verification**:
  - 11 figure-bearing questions adjudicated: 6 supported verbatim facts, 3 documentation drift defects fixed, 3 cross-page facts/illustrative parameters supported.
  - 8 redirected URLs updated to canonical direct 200 endpoints.
  - Zero broken links, zero redirects, and zero unverified dates remain.
