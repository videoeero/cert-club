# cert-prep-open

Open, non-paywalled practice exams for vendor certifications whose study
material is already public.

Starting with **Claude Certified Developer – Foundations (CCDV-F)**, then
generalizing to comparable entry-level certs (AZ-900, AI-900, the GitHub
Copilot cert).

> **Status: pre-alpha.** No app yet. See [`PLAN.md`](./PLAN.md) for the
> v1 scope, question schema, and phase-by-phase build order.

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

| Source                                                      | Status                          | Usable?                      |
| ----------------------------------------------------------- | ------------------------------- | ---------------------------- |
| `docs.claude.com` — API reference, Agent SDK, tool use, MCP | Public                          | ✅ Primary source            |
| Official exam guide / blueprint (domains + weights)         | Public                          | ✅ Drives question weighting |
| Anthropic Partner Academy course content (Skilljar)         | Gated to Claude Partner Network | ❌ Never                     |
| Real exam items                                             | Confidential                    | ❌ Never                     |

Questions are written **only** from the first two rows. The citation
requirement (`sourceUrl` on every question) is what makes that auditable
rather than merely claimed.

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

## Design principles

- **No backend.** Static site plus JSON question banks. Progress and
  bookmarks live in your browser's `localStorage`.
- **No accounts, no analytics, no telemetry.** Nothing about your study
  session leaves your machine.
- **Every question cites its source.** Non-negotiable.

## Running locally

Not yet applicable — no app scaffold exists. This section lands in
Phase 3.

## Licensing

Two licenses, because code and question content are different assets:

- **Code:** TBD (MIT or Apache-2.0) — Phase 0
- **Question content:** TBD (likely CC-BY-SA 4.0) — Phase 0

## Disclaimer

Independent and unofficial. Not affiliated with, endorsed by, or
sponsored by Anthropic, Microsoft, GitHub, or any certification body.
"Claude", "Anthropic", and all certification names are the marks of their
respective owners.
