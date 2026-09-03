# Adding a new certification bank

This document is the authoritative guide for adding a certification to
cert-prep-open — for human contributors and AI agents alike.

## Before you start

Re-read the **source boundary** section in [README.md](../README.md) and the
**question content requirements** in [CONTRIBUTING.md](../CONTRIBUTING.md).
The single rule that cannot be bent: every question must cite a public URL that
anyone can open without an account or paid subscription.

## File layout

A cert bank is exactly three files in a new subfolder of `certs/`:

```
certs/
  <slug>/
    manifest.json
    questions.json
```

`<slug>` must be a lowercase, hyphen-separated identifier (e.g. `az-900`,
`aws-clf-c02`). It must match `manifest.cert` and be the prefix of every
question ID in that bank.

## Step 1 — Register in the catalog

Add the slug to the `certs` array in [`certs/catalog.json`](./catalog.json).
The validator requires every folder to be listed and every listed slug to have a
folder.

```json
{
  "schemaVersion": 1,
  "certs": ["ccdv-f", "az-900", "aws-clf-c02", "<your-slug>"]
}
```

## Step 2 — Write `manifest.json`

```json
{
  "schemaVersion": 1,
  "cert": "<slug>",
  "name": "Full certification name",
  "examUrl": "https://example.com/public-exam-guide.pdf",
  "contentLicense": "CC-BY-SA-4.0",
  "domains": [
    { "slug": "domain-one", "name": "Domain One", "weight": 40 },
    { "slug": "domain-two", "name": "Domain Two", "weight": 60 }
  ]
}
```

**Rules enforced by the validator:**

- `cert` must equal the folder name.
- `examUrl` must be a public HTTP/HTTPS URL.
- `domains[*].slug` must be unique within the manifest.
- `domains[*].weight` values must sum to exactly 100 (±0.001). When the
  official guide gives ranges, normalise their midpoints using the
  largest-remainder method.

## Step 3 — Write `questions.json`

The file is a JSON array of question objects. The full schema is in
[`schemas/question-bank.mjs`](../schemas/question-bank.mjs). A minimal
single-select example:

```json
[
  {
    "id": "<slug>-001",
    "cert": "<slug>",
    "schemaVersion": 1,
    "type": "single",
    "domain": "domain-one",
    "difficulty": "medium",
    "status": "draft",
    "stem": "A team observes X and wants Y. What explains it?",
    "options": [
      { "id": "opt-a", "text": "First option" },
      { "id": "opt-b", "text": "Second option" },
      { "id": "opt-c", "text": "Third option" },
      { "id": "opt-d", "text": "Fourth option" }
    ],
    "correct": ["opt-c"],
    "explanation": "opt-c is correct because … opt-a is wrong because …",
    "distractorNotes": {
      "opt-a": "Plausible because …, but wrong because …"
    },
    "sourceUrl": "https://docs.example.com/relevant-page",
    "sourceNote": "Section heading or topic that supports the answer",
    "sourceCheckedAt": "2026-09-03"
  }
]
```

**Key field rules:**

| Field | Constraint |
|---|---|
| `id` | Must start with `<slug>-`; unique across the entire repository |
| `cert` | Must equal `manifest.cert` |
| `schemaVersion` | Must be `1` |
| `type` | `"single"` or `"multi"` |
| `domain` | Must match a slug declared in `manifest.domains` |
| `difficulty` | `"easy"`, `"medium"`, or `"hard"` |
| `status` | `"draft"` or `"reviewed"` |
| `correct` | Exactly one entry for `single`; two or more for `multi` |
| `sourceUrl` | Public HTTP/HTTPS URL, no paywalled or gated links |
| `sourceCheckedAt` | `YYYY-MM-DD` format |

**Per-question structural rules:**

- Option IDs must be unique within a question.
- `correct` entries must reference IDs that exist in `options`.
- For `multi` questions: the correct set must not be exactly the leading
  run of options in listed order (e.g. `["opt-a", "opt-b"]` when options
  are listed a/b/c/d) — this is guessable from position alone.
- `distractorNotes` keys must reference distractor IDs, not correct ones.

**Bank-level bias guards** (enforced once the bank reaches 20 questions):

- No single answer position may hold more than 50% of single-select answers.
- Mean correct-option length may not exceed mean distractor length by more
  than 10 characters in either direction.
- The correct option may be the single longest option in at most 45% of
  single-select questions.

Write stems as situations, not definition prompts. "What is X?" discriminates
poorly. "A team observes X and needs Y — what explains it?" discriminates well.

## Step 4 — Validate

```sh
npm run check
```

This runs the content validator, the schema tests, the linter, and the
formatter check. All must pass before opening a pull request.

## Content license

Original question text, option text, explanations, and metadata in
`questions.json` are licensed under **CC BY-SA 4.0**. By submitting a new bank
you agree to that license for your content contributions.
