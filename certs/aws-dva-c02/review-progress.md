# AWS Certified Developer - Associate (DVA-C02) review record

Standing record of how this bank was built and reviewed, and of the judgement
calls a future author should not have to rediscover. Chronology lives in git;
this file holds the reasons.

The bank follows the public AWS Certified Developer - Associate (DVA-C02) exam
guide (Version 2.1, published December 12, 2024). Recon performed on 2026-10-11.

## Bank status: `draft`

`manifest.status` is `draft`. 4 seed questions authored (1 draft per domain, 100% draft).
With a 65-question live exam, the full bank authoring target is 2× exam coverage
(130 questions) proportionally distributed across all four domains to match blueprint
weights (42 / 34 / 31 / 23).

## Blueprint and weights

The official DVA-C02 exam guide assigns exact integer weights to its four domains:

| Domain | Slug | Weight | Target (1x: 65) | Target (2x: 130) | Bank Questions (2x) |
| --- | --- | ---: | ---: | ---: | ---: |
| Development with AWS Services | `development-with-aws-services` | 32% | 21 | 42 | 1 |
| Security | `security` | 26% | 17 | 34 | 1 |
| Deployment | `deployment` | 24% | 15 | 31 | 1 |
| Troubleshooting and Optimization | `troubleshooting-and-optimization` | 18% | 12 | 23 | 1 |
| **Total** | | **100%** | **65** | **130** | **4** |

Exam specifications from the official blueprint:
- Total items: 65 questions (50 scored, 15 unscored)
- Duration: 130 minutes
- Scaled score: 100–1,000; passing score: 720

## Item format audit

Item format description quoted verbatim from the official exam guide (`developer-associate-02.md` § Response types):

> There are two types of questions on the exam:
> + **Multiple choice:** Has one correct response and three incorrect responses (distractors)
> + **Multiple response:** Has two or more correct responses out of five or more response options
>
> Select one or more responses that best complete the statement or answer the question. Distractors, or incorrect answers, are response options that a candidate with incomplete knowledge or skill might choose. Distractors are generally plausible responses that match the content area.
>
> Unanswered questions are scored as incorrect; there is no penalty for guessing. The exam includes 50 questions that affect your score.

**Format audit verdict**: Both formats (multiple choice single-select and multiple response multi-select) are natively supported by Cert Club's schema (`question-bank.mjs`). No new question type is required.

## Official sample question inventory

The official AWS Certified Developer - Associate sample questions set (`AWS-Certified-Developer-Associate_Sample-Questions.pdf`, 5 pages, 10 items) anchors cognitive depth:

1. **Sample 1 (Domain 2 - Security)**: AWS Secrets Manager — migrating legacy application on EC2, automatic rotation of database credentials without code modification. Key: D.
2. **Sample 2 (Domain 1 - Development with AWS Services)**: AWS AppSync — real-time comments and offline synchronization using GraphQL subscriptions. Key: A, B.
3. **Sample 3 (Domain 2 - Security)**: Amazon Cognito — User Pools for sign-up/sign-in with social identity provider vs Identity Pools for temporary AWS credentials. Key: A, E.
4. **Sample 4 (Domain 2 - Security)**: Amazon API Gateway — resource policy granting cross-account REST API access with SigV4 authentication protocols. Key: A, D.
5. **Sample 5 (Domain 1 - Development with AWS Services)**: Amazon SQS + AWS Lambda — asynchronous text-to-pdf conversion with Lambda execution role granting SQS and S3 access. Key: A.
6. **Sample 6 (Domain 2 - Security)**: AWS KMS — envelope encryption for large objects (>4 KB) using the `GenerateDataKey` API to obtain plaintext and encrypted data keys. Key: D.
7. **Sample 7 (Domain 1 / Domain 4 - Optimization)**: Amazon ElastiCache for Memcached — lazy loading caching strategy where records are populated on cache miss. Key: B.
8. **Sample 8 (Domain 3 - Deployment)**: Amazon API Gateway — deployment stages, stage variables, and Lambda aliases to manage multiple release environments. Key: B.
9. **Sample 9 (Domain 4 - Troubleshooting and Optimization)**: Amazon CloudWatch — unified CloudWatch agent installed on an EC2 fleet to stream application log files and OS-level system metrics. Key: C.
10. **Sample 10 (Domain 1 / Domain 3 - Deployment)**: AWS Lambda layers — sharing common utility code, libraries, and SDK dependencies across multiple functions. Key: D.

## Calibration set and firewall

No third-party calibration set was supplied. The bank relies exclusively on the 10 official AWS sample questions as its cognitive-depth anchor.

> **Calibration only.** No question, option, or rationale here derives from that set, or from any other third-party bank. It informed how deep and how scenario-shaped a question should be, never what a question says.

All authored items are written strictly from public AWS documentation.

## Sourcing and vendor documentation rules

All questions are authored from the public exam guide and official AWS documentation.

Recon verdict: **GO** (approved 2026-10-11).
- Exam guide: Public, authoritative, and versioned (`Version 2.1`, published December 12, 2024; URL: `https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html`).
- Blueprint domain weights: Exact integers summing to 100% (32 / 26 / 24 / 18).
- Official vendor sample questions: 10 items published in `AWS-Certified-Developer-Associate_Sample-Questions.pdf`.
- Citable public documentation exists for all four domains.

**Lifecycle note & constraints**:
- **Exam version lifecycle**: AWS announced the upcoming DVA-C03 version (registration opens October 27, 2026; last day to take DVA-C02 is November 30, 2026). Questions in this bank must remain strictly faithful to DVA-C02 Version 2.1 in-scope services and candidate profile boundaries.
- **In-scope vs out-of-scope boundaries**: DVA-C02 Version 2.1 added Amazon Q Developer (Skill 1.1.11, Skill 3.3.6) and removed AWS Copilot and Amazon CodeGuru from the in-scope service list. It explicitly designates infrastructure and network design (VPC architecture, Direct Connect) and server/OS administration as out of scope.

- **Citable documentation:**
  - `https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/` — Amazon DynamoDB
  - `https://docs.aws.amazon.com/lambda/latest/dg/` — AWS Lambda
  - `https://docs.aws.amazon.com/apigateway/latest/developerguide/` — Amazon API Gateway
  - `https://docs.aws.amazon.com/eventbridge/latest/userguide/` — Amazon EventBridge
  - `https://docs.aws.amazon.com/sqs/latest/dg/` & `sns` — Messaging services
  - `https://docs.aws.amazon.com/cognito/latest/developerguide/` — Amazon Cognito
  - `https://docs.aws.amazon.com/kms/latest/developerguide/` — AWS Key Management Service
  - `https://docs.aws.amazon.com/secretsmanager/latest/userguide/` — AWS Secrets Manager
  - `https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/` — AWS SAM
  - `https://docs.aws.amazon.com/codedeploy/latest/userguide/` & `codepipeline` — CI/CD deployment
  - `https://docs.aws.amazon.com/xray/latest/devguide/` — AWS X-Ray
  - `https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/` — Amazon CloudWatch
- **Docs `.md` endpoint**: Pages under `docs.aws.amazon.com` render client-side HTML; appending `.md` or replacing `.html` with `.md` yields clean markdown text.
- **Excluded sources:**
  - `explore.skillbuilder.aws` / AWS Skill Builder: Gated behind account registration (fails gate test).
  - Third-party dumps or unverified mirrors: Fails authority and content rules.
