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
| Describe the concepts of security, compliance, and identity | 13% | 5 | 10 | 1 |
| Describe the capabilities of Microsoft Entra | 28% | 11 | 22 | 1 |
| Describe the capabilities of Microsoft security solutions | 37% | 15 | 30 | 1 |
| Describe the capabilities of Microsoft compliance solutions | 22% | 9 | 18 | 1 |

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
