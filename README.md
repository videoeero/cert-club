# Cert Club

> The first rule of Cert Club is you talk about Cert Club, because you're
> stressed about the exam.

Open, non-paywalled practice exams for vendor certifications whose study
material is already public.

Currently includes **Claude Certified Developer – Foundations (CCDV-F)** at
full coverage, plus **Microsoft Certified: Azure Fundamentals (AZ-900)** and
**AWS Certified Cloud Practitioner (CLF-C02)** as **draft** banks — 18
questions each, published to prove the schema generalises rather than to
rehearse those exams. Each cert's `manifest.json` declares its `status`
(`draft` | `stable`), and the app badges the draft ones.

> **Status: pre-alpha.** The core quiz flow and three certification banks are
> in place; deployment remains. See [`PLAN.md`](./PLAN.md) for the v1 scope,
> question schema, and phase-by-phase build order.

## Why this exists

For entry-level certifications, the vendor documents the material
publicly — but the _practice question_ experience is mostly locked behind
paid bootcamps (K21 Academy, Datrick, CloudThat and similar all
repackage the same public docs commercially).

The docs are free. The questions shouldn't cost $300.

## What this is not

**This project does not reproduce real exam questions or paywalled course
content.** That is not a soft preference; it is the constraint the whole
design serves.

Every question here is original, written against public documentation,
and carries a citation back to the specific doc section it tests. This is
the same model the commercial prep vendors already operate legally.
Copying an actual exam bank is a different thing, and we don't do it.

If you are looking for exam dumps, this is the wrong repository.

### The source boundary

For CCDV-F specifically:

| Source                                                           | Status                               | Usable?                      |
| ---------------------------------------------------------------- | ------------------------------------ | ---------------------------- |
| `platform.claude.com`, `code.claude.com` — API, Agent SDK, tools | Public                               | ✅ Primary source            |
| `modelcontextprotocol.io` — MCP specification and concepts       | Public                               | ✅ Primary source            |
| Official exam guide / blueprint (domains + weights)              | Public                               | ✅ Drives question weighting |
| Anthropic Academy course _landing pages_ (syllabus, objectives)  | Public, no account                   | ⚠️ Coverage cross-check only |
| Anthropic Academy / Partner Academy _course content_             | Requires registration, free or gated | ❌ Never                     |
| Real exam items                                                  | Confidential                         | ❌ Never                     |

Questions are written **only** from the rows marked as primary sources and the
exam guide. The citation requirement (`sourceUrl` on every question) is what
makes that auditable rather than merely claimed.

The boundary is drawn at the **gate, not the vendor**. Some Anthropic Academy
courses cost nothing, but the lessons still sit behind a registration wall, so
they are excluded on the same footing as paid ones. Their public landing pages
are not behind that wall and may be read — but only to ask "is this skill
covered?", never as a citation, and never to calibrate how deep a question
should go. Courses teach you to build; this exam tests what to choose.

## About the exam (CCDV-F)

One of four certifications in Anthropic's Claude Certification Program
(Associate, Developer, Architect Foundations, Architect Professional).

- $125, delivered via Pearson VUE / OnVUE
- 53 questions, 120 minutes, 720/1000 to pass
- **Single-select and multiple-response** items
- Tests hands-on skill, not just theory: API integration, Agent SDK,
  tool use, MCP servers, structured output, prompt/context engineering,
  evals, cost optimization, security, observability

Domain weights are recorded in `certs/ccdv-f/manifest.json` (see
`PLAN.md` § Verified exam facts).

## About the exam (AZ-900)

**Draft bank — 18 questions.** Coverage is proportional to the blueprint but
far short of a full rehearsal.

The AZ-900 bank follows Microsoft's July 20, 2026 skills outline. Because the
official domain weights are ranges, the manifest normalizes their midpoints to
28%, 39%, and 33% using the largest-remainder method. Every question cites the
current public Microsoft Learn page that supports its answer.

## About the exam (AWS Certified Cloud Practitioner)

**Draft bank — 18 questions.** Coverage is proportional to the blueprint but
far short of a full rehearsal.

The AWS Certified Cloud Practitioner bank follows the current CLF-C02 exam
guide. Its 18 questions use the official 24%, 30%, 34%, and 12% domain weights
to produce a proportional 4/6/6/2 split, and six are multiple-response items.
Every question cites the public AWS documentation that supports its answer.

## Design principles

- **No backend.** Static site plus JSON question banks. Progress and
  bookmarks live in your browser's `localStorage`.
- **No accounts, no analytics, no telemetry.** Nothing about your study
  session leaves your machine.
- **Every question cites its source.** Non-negotiable.

## Running locally

Requires Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Vite serves the app at the local URL it prints. The question banks stay as
static JSON files and are loaded at runtime from `certs/<cert-slug>/`.

To produce and preview a production build:

```sh
npm run build
npm run preview
```

## Contributing a new cert bank

See [`certs/ADDING-A-CERT.md`](./certs/ADDING-A-CERT.md) for the step-by-step
guide covering file layout, manifest format, question schema, bias-guard rules,
and the mandatory validation step.

## Licensing

Two licenses, because code and question content are different assets:

- **Code:** [MIT License](./LICENSE)
- **Question content:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

The content license applies to original question text, explanations,
option text, and related question-bank metadata. Contributions must meet
the provenance requirements in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Disclaimer

Independent and unofficial. Not affiliated with, endorsed by, or sponsored by
Anthropic, Microsoft, Amazon Web Services, or any certification body.
"Claude", "Anthropic", "AWS", "Amazon Web Services", and all certification
names are the marks of their respective owners.
