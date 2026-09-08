# AWS CLF-C02 review record

The bank follows the public AWS Certified Cloud Practitioner (CLF-C02) exam
guide checked on September 3, 2026.

## Bank status: `draft`

`manifest.status` is `draft`. Every question here is `reviewed` and sourced,
but 18 questions against a 65-question exam is a schema-generalisation
proof, not a rehearsal — the bank exists to show that another vendor’s
blueprint, weights and sourcing rules fit the same schema as CCDV-F.

Promote to `stable` when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here.

## Blueprint and distribution

The official guide still identifies the exam as CLF-C02 and assigns these
weights to its four domains:

| Domain                        | Weight | Questions |
| ----------------------------- | -----: | --------: |
| Cloud Concepts                |    24% |         4 |
| Security and Compliance       |    30% |         6 |
| Cloud Technology and Services |    34% |         6 |
| Billing, Pricing, and Support |    12% |         2 |

The 4/6/6/2 allocation is the largest-remainder distribution of 18 questions.
Six questions are multiple-response items. Each has five options and two
correct responses, matching the exam guide's format.

## Source and accuracy review

All 18 questions were written from the public exam guide and public AWS
documentation. No certification exam items, AWS Skill Builder practice
questions, third-party question banks, or gated training content were used.

After authoring, an independent cold review fetched the manifest URL and all
18 cited pages without authentication, checked every answer and distractor
against the cited material, and mapped each question back to the current
domain task statements. All 18 answer keys agreed with their sources, every
distractor was false under the exact stem wording, and every source was a
current official AWS page without a historical-content warning.

The review found four non-blocking wording and metadata advisories, all fixed:

- replaced a superseded Operational Excellence definition;
- corrected one Well-Architected question's subdomain;
- removed an unsupported console-location detail from the root-user question;
- removed an inferred failover phrase from the Availability Zones explanation.

## Pattern review

- Single-select answers are distributed exactly 3/3/3/3 across positions
  `a`-`d`.
- Multi-response keys use six distinct combinations: `b+d`, `a+c`, `c+e`,
  `b+e`, `a+d`, and `c+d`. None is a leading run.
- Mean correct-option length minus distractor length is -3.08 characters.
- The correct answer is the longest option in 4 of 12 single-select questions.
- Every wrong option has a `distractorNotes` entry.

The bank is below the validator's 20-question threshold for bank-level position
and length guards, so these metrics were also computed directly. They satisfy
the same limits that will apply if the bank later grows.

## Known coverage limits

This is a forcing-function bank rather than a full-size exam simulation. At 18
questions, not every task statement can be represented. Domain 3 does not yet
cover deployment methods or AI/ML and analytics, and Domain 4 does not include
an AWS Support plans question. Support plans were intentionally omitted because
AWS has announced a January 2027 plan transition while the exam guide still
names the outgoing plans; adding that item now would create avoidable ambiguity.

One shared-responsibility question cites the maintained public
`aws.amazon.com` page because AWS's older whitepaper version is marked
historical. Four questions cite the current AWS Overview whitepaper, checked as
published June 2, 2026; their claims remain accurate, but service-specific
sources should be preferred when those questions are next refreshed.
