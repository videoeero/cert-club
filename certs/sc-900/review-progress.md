# SC-900 review record

Scaffolded on 2026-10-11 by `scripts/scaffold-cert.mjs` following the
`/assess-new-cert` recon process. The bank follows the official Microsoft
SC-900 skills outline measured as of October 21, 2026 (guide version metadata
`ms.date: 2026-08-16`, last updated `2026-09-21`).

## Bank status: `draft`

`manifest.status` is `draft`. The bank currently holds 4 seeded draft questions
(one per domain) serving as the initial sourcing smoke test.

Promote to `stable` only when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here. The standard bank authoring target
is 2x the official exam question count (`2 * manifest.examQuestionCount = 80`),
providing two full non-overlapping mock exam sessions.

## Blueprint normalization

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

| Domain | Weight | Target (1x: 40) | Target (2x: 80) | Questions |
| --- | ---: | ---: | ---: | ---: |
| Describe the concepts of security, compliance, and identity | 13% | 5 | 10 | 10 |
| Describe the capabilities of Microsoft Entra | 28% | 11 | 22 | 22 |
| Describe the capabilities of Microsoft security solutions | 37% | 15 | 30 | 30 |
| Describe the capabilities of Microsoft compliance solutions | 22% | 9 | 18 | 18 |

## Reconnaissance and sourcing profile

Recon completed on 2026-10-11 against the official Microsoft Learn study guide:
`https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900`

### Sourcing classification

Candidate documentation sources were audited on gate (public accessibility without
registration) and authority (vendor ownership of facts):

1. **Official Exam Guide (`manifest.examUrl`):**
   - `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900`
   - Gate: Public, open without login. Authority: Primary Microsoft credential publication.
   - Classification: **Citable / Official Exam Guide**.

2. **Citable Technical Documentation:**
   - Microsoft Learn technical product docs under `https://learn.microsoft.com/*`:
     - Microsoft Zero Trust & Security: `https://learn.microsoft.com/en-us/security/*`, `https://learn.microsoft.com/en-us/azure/security/*`
     - Microsoft Entra: `https://learn.microsoft.com/en-us/entra/*`
     - Microsoft Sentinel: `https://learn.microsoft.com/en-us/azure/sentinel/*`
     - Microsoft Defender XDR & Defender for Cloud: `https://learn.microsoft.com/en-us/defender-xdr/*`, `https://learn.microsoft.com/en-us/azure/defender-for-cloud/*`
     - Microsoft Purview: `https://learn.microsoft.com/en-us/purview/*`
     - Service Trust Portal: `https://learn.microsoft.com/en-us/microsoft-365/compliance/get-started-with-service-trust-portal`
   - Gate: Public, open. Authority: Primary Microsoft product documentation.
   - Classification: **Citable**.

3. **Readable-but-not-citable:**
   - Exam certification landing page (`https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/`):
     Public and official, but describes exam logistics, duration, and audience rather than technical facts.
   - Microsoft Learn training modules (`https://learn.microsoft.com/en-us/training/paths/*`):
     Publicly readable, but outlines instructional paths rather than product documentation. Can inform topic scope, but questions must cite canonical product documentation.

4. **Excluded:**
   - Microsoft Practice Assessments (`/practice/assessment`):
     Interactive assessment delivered through application interface; items are confidential exam-prep materials.
   - Third-party dumps and unverified question repositories:
     Violates both gate (often paywalled) and authority, as well as the strict ban on real exam items.

### Sample questions and cognitive anchor

The official SC-900 study guide contains **0 sample questions**. Microsoft
directs candidates to an interactive sandbox and Practice Assessment rather than
embedding representative static items in the guide text.

### Format audit

From Microsoft's official exam experience documentation (`/credentials/support/exam-duration-exam-experience`):
> "To protect exam security and the value of our certifications, we don’t identify specific exam formats or question types before the exam. However, you can demo the role-based and fundamentals exam experience by visiting our 'exam sandbox.'"

Fundamentals exams primarily use single-select and multiple-choice questions. All
tested objectives across the 4 domains can be faithfully expressed using the repository's
`single` and `multi` question types; no novel question shapes are required.

### Calibration and firewall

- **User calibration input:** None. Proceeding without a third-party calibration set.
- **Firewall rule (`certs/ccdv-f/review-progress.md`):**
  > Calibration only. No question, option, or rationale here derives from that set,
  > or from any other third-party bank. It informed how deep and how scenario-shaped
  > a question should be, never what a question says.

### Verdict and constraints

**Approved verdict: GO-WITH-CONSTRAINTS**

Constraints to guide subsequent authoring:
1. **Zero official sample questions in the guide:** Without vendor-published sample items,
   authors must strictly follow the candidate audience profile (business stakeholders,
   new IT professionals, students seeking foundational security/compliance/identity literacy)
   and `ADDING-A-CERT.md` § How deep should a question go?
2. **Conceptual discrimination:** Differentiate options by core security mechanism,
   architecture concept, or product role (e.g. SIEM vs CSPM vs WAF, Zero Trust principles,
   Conditional Access signals/decisions, Purview Compliance Manager score vs eDiscovery).
   Do not test obscure parameter strings, syntax, or pricing details.

## 2026-10-12: Full Bank Expansion (Phase 2 Orchestration)

The bank was populated from the 4-item initial seed to its full 2x exam baseline
of 80 questions (`2 * manifest.examQuestionCount = 80`) using the automated
orchestration pipeline (`skills/orchestrate-bank`).

### Stage A: Multi-Domain Authoring

Four authoring subagents drafted 76 questions in parallel across all 4 domains,
targeting the exact 2x quotas:
- **Describe the concepts of security, compliance, and identity**: 9 items authored
  (`002`–`010`), domain total 10 (target 10, 13% weight). Topics: shared responsibility
  model across cloud service models, defense-in-depth layers, Zero Trust guiding
  principles (Verify explicitly, Least privilege), symmetric vs asymmetric encryption,
  cryptographic hashing for data integrity, GRC frameworks, identity as primary security
  perimeter, authentication vs authorization, and hybrid directory federation.
- **Describe the capabilities of Microsoft Entra**: 21 items authored (`002`–`022`),
  domain total 22 (target 22, 28% weight). Topics: Entra tenant architecture, managed
  identities (system-assigned vs user-assigned), B2B collaboration vs External ID/CIAM,
  Cloud Sync vs Connect Sync, hybrid authentication (PHS, PTA, Federation), passwordless
  authentication (FIDO2, Windows Hello for Business), MFA factors, Password Protection
  banned lists, SSPR, Conditional Access signals and controls, Entra directory roles vs
  Azure RBAC, Helpdesk Administrator, Entitlement Management access packages, Access Reviews,
  PIM just-in-time role activation, ID Protection user vs sign-in risks, and risk-based CA.
- **Describe the capabilities of Microsoft security solutions**: 29 items authored
  (`002`–`030`), domain total 30 (target 30, 37% weight). Topics: Azure DDoS IP vs
  Network Protection, Azure Firewall L3–L7 and FQDN filtering, Azure WAF, NSG 5-tuple
  priority rules, Application Security Groups, VNet peering, Private Endpoints,
  Azure Bastion, Key Vault secrets/keys/Managed HSM, Defender for Cloud CSPM vs CWPP,
  Secure Score, Microsoft Cloud Security Benchmark, Defender for Servers/Storage,
  Sentinel SIEM/SOAR fundamentals, data connectors, scheduled analytics KQL rules,
  investigation graph, automation rules and Logic Apps playbooks, Defender XDR incident
  correlation, Defender for Office 365 (Safe Links, Safe Attachments), Defender for
  Endpoint EDR and ASR rules, Defender for Cloud Apps CASB, Defender for Identity on-prem
  AD sensors, and Defender Vulnerability Management.
- **Describe the capabilities of Microsoft compliance solutions**: 17 items authored
  (`002`–`018`), domain total 18 (target 18, 22% weight). Topics: Service Trust Portal
  audit reports (SOC, ISO 27001), Microsoft privacy principles (ISO/IEC 27018 advertising
  commitments), Purview portal, Compliance Manager scoring (Microsoft vs customer actions),
  data classification (SITs, trainable classifiers, Exact Data Match), Activity explorer
  vs Content explorer, sensitivity labels and label policies, DLP and Endpoint DLP,
  records management immutability, retention policies vs retention labels, principles of
  retention precedence, insider risk management HR connectors, eDiscovery Standard vs
  Premium, and Audit Standard vs Premium.

All items strictly cite canonical Microsoft Learn documentation under `https://learn.microsoft.com/*`.

### Stage B: Adversarial Cold Evaluation

Four clean, independent subagents without authoring prompt history evaluated all 80
items cold against cited documentation:
- **Cold derivation**: 80/80 items had their answers independently derived cold.
  **0 miskeys** detected across the bank.
- **Fixes applied in place**:
  - `describe-the-capabilities-of-microsoft-entra-017`: Hardened weak distractors into
    realistic Entra ID Protection/CA controls while strictly preserving key `c` and length.
  - `describe-the-capabilities-of-microsoft-security-solutions-023`: Fixed legacy documentation
    URL redirect.
- **Free-text verification**: 100% compliant; zero references to option letters (A, B, C...)
  in any explanation or distractor note.
- **Promotions**: All 80 items verified and promoted to `"status": "reviewed"`.

### Stage C: Difficulty Calibration & Hardening

Calibrated against the foundational cognitive anchor established in Phase 1
(conceptual discrimination across architectural mechanisms, identity models, security
tool boundaries, and compliance controls).

A full solvability and distractor audit across all 80 items measured each question
against elimination tells, definition-prompt stems, and distractor credibility:
- **Domain 1 (`describe-the-concepts-of-security-compliance-and-identity`)**:
  - `001` (**calibrated — no change**): Solid scenario constraints and balanced near-misses across Zero Trust principles (Assume breach vs Verify explicitly and Use least privilege).
  - `002` (**calibrated — no change**): Balanced options testing physical datacenter security as the provider's responsibility across all cloud service models in the shared responsibility matrix.
  - `003` (**hardened**): Replaced identity distractors (SSO, federation, RBAC) with architectural security frameworks (Perimeter-based boundary defense, Zero Trust verification model, Role-based access control model), forcing conceptual discrimination of Defense-in-depth concentric barriers vs other paradigms.
  - `004` (**hardened**): Replaced out-of-domain distractor "Shared responsibility" with authentic architectural near-miss "Defense-in-depth strategy", eliminating free elimination while testing "Verify explicitly".
  - `005` (**hardened**): Tightened stem phrasing to remove lexical echo ("secret key" -> "same cryptographic key") and aligned option text to "Symmetric shared-key cryptography" while preserving character length balance (33–37 chars).
  - `006` (**calibrated — no change**): Clean package verification scenario testing cryptographic hashing integrity vs encryption and TLS transport security.
  - `007` (**hardened**): Tightened stem to eliminate echo giveaway ("regulatory standards" -> "external legal and contractual requirements") and upgraded distractor from out-of-domain "Threat intelligence analysis" to credible GRC near-miss "Independent assurance audit".
  - `008` (**hardened**): Replaced facepalm distractor "Physical perimeter wall" with authentic Zero Trust near-miss "Endpoint device boundary" (24 chars), calibrating modern cloud perimeter discrimination.
  - `009` (**calibrated — no change**): High-quality conceptual discrimination between authentication and authorization mechanisms with balanced character lengths (130–136 chars).
  - `010` (**calibrated — no change**): Robust multi-select scenario on hybrid directory federation and SSO benefits without leading run.
- **Domain 2 (`describe-the-capabilities-of-microsoft-entra`)**:
  - `001` (**calibrated — no change**): Scenario-based Conditional Access evaluation with balanced Entra family distractors (PIM, Connect Sync, Domain Services).
  - `002` (**hardened**): Tightened simple definition prompt into a concrete multi-subsidiary organizational scenario and balanced distractor lengths (33–35 chars).
  - `003` (**hardened**): Replaced easily eliminable human/group distractors (guest user, B2B account, hybrid group) with authentic Entra workload and device identity mechanisms (cloud user, service principal client secret, registered device identity).
  - `004` (**hardened**): Replaced facepalm break-glass admin and sync accounts with authentic workload and device identity near-misses (application service principal, Entra device identity) with uniform option lengths (32–35 chars).
  - `005` (**hardened**): Replaced out-of-domain hybrid sync, domain services, and lockout distractors with authentic Microsoft Entra External ID capabilities (B2B direct connect, customer tenants, cross-tenant sync) with uniform lengths (32–34 chars).
  - `006` (**hardened**): Replaced out-of-domain PIM and Password Hash Sync with authentic External ID near-misses (B2B partner collaboration, B2B direct connect federation) for customer CIAM discrimination.
  - `007` (**calibrated — no change**): Architectural discrimination between Cloud Sync (lightweight agent, cloud rules) and Connect Sync (on-prem heavy sync engine).
  - `008` (**calibrated — no change**): Scenario-based discrimination of hybrid authentication options (PHS vs PTA vs AD FS) with tightly balanced lengths (45–49 chars).
  - `009` (**hardened**): Replaced generic social and direct cloud auth with authentic hybrid enterprise auth mechanisms (federated token authentication, certificate-based authentication) with balanced lengths (27–32 chars).
  - `010` (**hardened**): Replaced unrelated PIM and Verified ID with authentic Entra sign-in/credential capabilities (Password Protection, SSPR, Smart Lockout) to prevent instinct-based guessing of Seamless SSO.
  - `011` (**calibrated — no change**): Clean multi-select discrimination between passwordless methods (FIDO2, Windows Hello) and telephony secondary factors (SMS, voice).
  - `012` (**calibrated — no change**): Balanced (55–60 chars) categorization of MFA factors (something you know, have, are) with common industry misconceptions.
  - `013` (**hardened**): Replaced out-of-domain CA named locations and PIM with authentic Entra credential policy near-misses (Smart Lockout threshold rules, SSPR policy rules, ID Protection user risk policies) with uniform lengths (45–49 chars).
  - `014` (**hardened**): Tightened stem to eliminate lexical giveaway ("reset their own passwords") into a concrete self-service writeback scenario, and replaced out-of-domain distractors with authentic credential/lockout features (Password Protection, Smart Lockout, PIM).
  - `015` (**calibrated — no change**): Multi-select discrimination separating Conditional Access input signals (groups, device compliance) from grant controls (MFA, hybrid join).
  - `016` (**hardened**): Replaced out-of-domain malware and network perimeter distractors with authentic Entra identity/access risk categories (workload service risk, device compliance risk) with balanced lengths (24–27 chars).
  - `017` (**calibrated — no change**): Precise remediation discrimination between sign-in risk controls (MFA alone) and user risk remediation (MFA + secure password change).
  - `018` (**calibrated — no change**): Conceptual discrimination between Entra directory roles and Azure RBAC roles with balanced lengths (96–104 chars).
  - `019` (**hardened**): Tightened stem to eliminate giveaway role name clue ("A helpdesk technician" -> "A tier-1 support specialist") and upgraded distractors to test least privilege against User Administrator and Authentication Administrator.
  - `020` (**hardened**): Replaced out-of-domain Smart Lockout, Connect Cloud Sync, and Seamless SSO with authentic Identity Governance features (Access Reviews, Lifecycle Workflows, Terms of Use) with uniform lengths (28–38 chars).
  - `021` (**hardened**): Replaced out-of-domain Password Protection, Verified ID, and Application Proxy with authentic Identity Governance features (Entitlement Management, Terms of Use policies, Lifecycle Workflows) with balanced lengths (30–38 chars).
  - `022` (**hardened**): Replaced out-of-scope distractors (Connect sync, Domain Services, Password Protection) with authentic Entra governance/protection near-misses (Entitlement Management, Conditional Access, ID Protection), requiring candidates to distinguish PIM JIT role activation from other Entra governance engines.
- **Domain 3 (`describe-the-capabilities-of-microsoft-security-solutions`)**:
  - `001` (**hardened**): Replaced out-of-scope distractors (Network Watcher, WAF) with authentic security monitoring and threat detection near-misses (Microsoft Defender XDR, Azure Monitor alerts), testing SIEM/SOAR boundaries.
  - `002` (**calibrated — no change**): Specific scenario testing Azure DDoS IP Protection (per-IP SMB tier) vs Network Protection.
  - `003` (**calibrated — no change**): High-availability Layer 3–7 stateful firewall architecture scenario with threat intelligence.
  - `004` (**calibrated — no change**): Azure Firewall application rules FQDN filtering vs network rules and DNAT.
  - `005` (**calibrated — no change**): Azure WAF OWASP Layer 7 protection vs DDoS, NSGs, and Private Link.
  - `006` (**calibrated — no change**): NSG 5-tuple evaluation and numerical priority rule order.
  - `007` (**calibrated — no change**): Application Security Groups workload grouping vs route tables and FQDN tags.
  - `008` (**calibrated — no change**): Virtual Network peering across regions (Global VNet peering) vs VPN gateways.
  - `009` (**calibrated — no change**): Azure Private Endpoint private IP in subnet vs Service Endpoints.
  - `010` (**calibrated — no change**): Azure Bastion browser-based TLS remote access without public IP addresses (select 2).
  - `011` (**hardened**): Replaced storage category error "Storage account blob containers" with authentic Key Vault object concept "Customer-managed key objects", testing Secret objects vs Keys vs Certificates.
  - `012` (**hardened**): Replaced out-of-domain distractors (Entra Private Access, Storage Service Encryption) with authentic Key Vault tiers and architectures (Azure Key Vault Premium tier, Azure Dedicated HSM service), testing single-tenant FIPS 140 Level 3 Managed HSM.
  - `013` (**calibrated — no change**): CSPM vs CWPP vs XDR vs SOAR architecture distinctions.
  - `014` (**calibrated — no change**): Secure Score calculation and security control remediation dynamics.
  - `015` (**calibrated — no change**): Microsoft Cloud Security Benchmark default initiative and CIS/NIST mapping.
  - `016` (**calibrated — no change**): Defender for Servers workload plan vs Storage, Containers, and Key Vault plans.
  - `017` (**hardened**): Tightened stem to eliminate keyword echo giveaway ("Azure Blob Storage accounts" -> "cloud object repositories and file shares") for Microsoft Defender for Storage.
  - `018` (**hardened**): Replaced facepalm distractors (passwords, disk encryption, subnet routing) with authentic SOC mechanisms and inverted detection vs playbook execution across SIEM and SOAR.
  - `019` (**calibrated — no change**): Sentinel data connectors for multicloud log ingestion.
  - `020` (**calibrated — no change**): Sentinel scheduled analytics rules and KQL query alerts.
  - `021` (**calibrated — no change**): Sentinel investigation graph entity correlation canvas.
  - `022` (**calibrated — no change**): Automation rules and Logic Apps playbooks automated response workflows.
  - `023` (**hardened**): Replaced category-error distractors (WAF, Purview Compliance Manager) with authentic threat detection platforms (Microsoft Defender for Cloud, Microsoft Sentinel, Microsoft Purview), testing native cross-domain Microsoft Defender XDR.
  - `024` (**hardened**): Replaced non-security distractor "Mailbox auto-expanding archive" with authentic email threat protection near-miss "Safe Attachments sandbox detonation", testing Safe Links time-of-click inspection.
  - `025` (**hardened**): Replaced unrelated distractors (disk encryption, database private endpoints) with authentic security policies (Purview sensitivity labels, Entra Conditional Access MFA), testing Defender for Office 365 (Safe Attachments, Anti-phishing).
  - `026` (**hardened**): Replaced out-of-domain distractors (NSG/ASG, Purview, WAF) with authentic Defender for Endpoint capability pillars (Attack Surface Reduction rules, Next-generation antivirus, Defender Vulnerability Management), testing EDR and AIR.
  - `027` (**calibrated — no change**): Attack Surface Reduction rules blocking child processes, LSASS credential theft, and USB executables.
  - `028` (**hardened**): Replaced network flood distractor "Azure DDoS Network Protection" with the primary near-miss "Microsoft Defender for Cloud", testing CASB role of Microsoft Defender for Cloud Apps.
  - `029` (**hardened**): Replaced out-of-domain distractors (WAF, Storage) with authentic identity and endpoint threat detection services (Microsoft Defender for Endpoint, Microsoft Entra ID Protection, Microsoft Defender for Cloud), testing on-premises AD domain controller monitoring by Microsoft Defender for Identity.
  - `030` (**hardened**): Tightened stem to eliminate keyword giveaway ("risk-based vulnerability management" prompt) and replaced out-of-domain distractors with authentic Defender endpoint capabilities (Attack Surface Reduction, SmartScreen, Device Discovery), testing Microsoft Defender Vulnerability Management.
- **Domain 4 (`describe-the-capabilities-of-microsoft-compliance-solutions`)**:
  - `001` (**hardened**): Replaced distractor `c` ("Information Barriers") with authentic Purview compliance tool "Communication Compliance" (`24` chars) to require distinguishing Compliance Manager posture scoring from Communication Compliance message supervision rather than superficial keyword matching on the stem.
  - `002` (**calibrated — no change**): Service Trust Portal direct access to independent third-party audit reports (SOC, ISO/IEC 27018, FedRAMP).
  - `003` (**hardened**): Replaced caricatured advertising distractors (sponsored product placements in productivity apps, default marketing analysis) with authentic cloud privacy misconceptions (first-party marketing, de-identified telemetry sharing, opt-out administrative policies).
  - `004` (**calibrated — no change**): Microsoft Purview portal single plane across data governance, DLP, and compliance.
  - `005` (**calibrated — no change**): Compliance Manager score calculation shared responsibility (Microsoft-managed vs customer-managed actions).
  - `006` (**hardened**): Replaced redundant regex distractor `d` ("Custom regex entities") with authentic Microsoft Purview classification mechanism "Document fingerprinting" (`23` chars).
  - `007` (**calibrated — no change**): Exact Data Match (EDM) sensitive information types based on hashed database rows.
  - `008` (**calibrated — no change**): Activity explorer historical user labeling events vs Content explorer snapshot inventory.
  - `009` (**hardened**): Replaced out-of-domain Entra directory role and Intune OS patch distractors with authentic Purview compliance near-misses (retention schedules and communication compliance monitoring).
  - `010` (**hardened**): Replaced out-of-domain Intune and Exchange auditing distractors with authentic Purview policy near-misses (auto-labeling, DLP, and retention label policies).
  - `011` (**calibrated — no change**): Data Loss Prevention (DLP) detecting payment card sharing and displaying policy tips in Exchange and Teams.
  - `012` (**hardened**): Replaced non-existent distractors ("Network DLP", "Database DLP") with authentic Microsoft Purview workload locations (Teams DLP, Exchange DLP, SharePoint DLP), requiring knowledge that USB, clipboard, and print restrictions are enforced specifically by Endpoint DLP.
  - `013` (**hardened**): Tightened distractors into authentic Purview compliance capabilities (eDiscovery holds, Communication Compliance, Information Protection auto-labeling), cleanly isolating Records Management for document immutability and disposition reviews.
  - `014` (**hardened**): Replaced facepalm distractors (read-only PDF conversion, password expiration, public cloud VMs) with authentic Purview retention near-misses testing container vs item inversion, disposition review rules, and scope.
  - `015` (**calibrated — no change**): Principles of retention precedence (retention wins over deletion, longest retention period wins, explicit over implicit).
  - `016` (**calibrated — no change**): Insider Risk Management correlating M365, endpoint, and HR resignation connector signals.
  - `017` (**calibrated — no change**): eDiscovery (Premium) advanced litigation capabilities (custodian management, hold notifications, review sets, predictive coding).
  - `018` (**hardened**): Replaced informal term "Basic compliance log" with authentic Microsoft logging mechanism "Entra ID audit logs".

### Stage D: Reconciliation & Bank Gate

- **Balance**: 80/80 questions (100% of 2x exam baseline, 0 short, 0 surplus).
- **Format mix**: 73 single-select, 7 multi-select (all select-2 with non-leading runs).
- **Item status**: 80 / 80 items have `"status": "reviewed"` (100%).
- **Citations**: 76 distinct public Microsoft Learn documentation URLs.
- **Position balance**: 18 `a`, 19 `b`, 18 `c`, 18 `d` across 73 single-select items
  (24.7% / 26.0% / 24.7% / 24.7% — uniform distribution, guard PASS).
- **Length balance**: Mean delta between correct options and distractors is -0.70 characters
  (guard PASS). Longest option is key in only 15.1% of items (well below the 45% ceiling).
- **Guards & Test Suite**: `npm run check` is completely green (413/413 tests, ESLint,
  Prettier, sync-manifest-dates, strict balance).
- **Standing versus anchor**: Domain questions strictly reflect foundational conceptual discrimination
  across compliance architecture, governance mechanisms, and Purview service boundaries. Solvability
  is calibrated to require technical understanding of Purview solutions rather than superficial keyword
  or eliminative cues.
- `manifest.status` remains `"draft"` pending human-gated Phase 4 promotion.

## 2026-10-12: Option hints implementation

Implemented option-level `hintText` across the SC-900 question bank in accordance with [`CONTRIBUTING.md` § Bare option text and optional `hintText`](../../CONTRIBUTING.md):

- **Coverage**: 66 of 80 questions (82.5%) now feature `hintText` across all of their options (264 options with glosses).
- **Domain breakdown**:
  - `describe-the-concepts-of-security-compliance-and-identity`: 8 of 10 questions (32 option hints).
  - `describe-the-capabilities-of-microsoft-entra`: 20 of 22 questions (80 option hints).
  - `describe-the-capabilities-of-microsoft-security-solutions`: 26 of 30 questions (104 option hints).
  - `describe-the-capabilities-of-microsoft-compliance-solutions`: 12 of 18 questions (48 option hints).
- **Design & Pedagogical alignment**:
  - Questions with bare service, tool, feature, and principle names matching official exam item format present concise technical glosses when the candidate toggles "Show hints" during practice.
  - The 14 remaining questions feature statement-style options whose text *is* the answer content and remain intact without `hintText`, strictly observing the repository standard.
  - Every hint was neutrally phrased to define the option's specific technical role based on authoritative Microsoft Learn documentation without telegraphing answer keys.
