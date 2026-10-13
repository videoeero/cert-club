---
name: add-option-hints
description: Pedagogical refinement pass over one domain of an existing cert bank — add option-level hints (hintText) to items testing bare tools, services, APIs, or parameters, and separate embedded glosses into clean option text and hints, leaving statement-style items intact. Use after questions are authored and calibrated. Not for writing new questions (author-questions) and not for verifying correctness (evaluate-questions).
argument-hint: "<cert-slug> <domain-slug>"
allowed-tools: Read, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Bash
---

# Add option hints to a domain

`CONTRIBUTING.md` § Bare option text and optional `hintText` owns the rule —
option `text` should be the bare service, tool, API, or concept name matching
the live exam format, while explanatory glosses belong in the optional
`hintText` field revealed by a candidate toggle during practice. Statement-style
options whose text is the answer content stay intact with no `hintText`. This
skill is the order of operations for applying that rule to one domain.

Glosses in `hintText` are option claims: they follow the same sourcing rule as
`text`, must be verified against the cited documentation, and are checked by
`npm run check-claims` when run standalone.

## Stages

1. **Scope one domain.** Never several. Read the cert's `manifest.json`, the
   target `questions/<domain>.json`, and `review-progress.md`.
2. **Audit option shapes.** Scan every question in the domain and classify into:
   - **Candidate items**: Questions testing selection between distinct tools,
     services, APIs, CLI flags, configuration parameters, or concepts.
   - **Embedded gloss items**: Questions where options currently embed the
     definition (such as "Service X, because it provides Y").
   - **Statement-style items**: Questions whose options describe multi-clause
     architectural actions, reasoning steps, or procedures where the text
     itself is the answer content. **Bypass these entirely — no hints.**
3. **Split embedded glosses.** For items where definitions are conjoined with
   option text, trim `text` down to the bare service or tool name matching the
   live exam appearance, and place the explanatory clause into `hintText`.
4. **Draft glosses for candidate items.** For each candidate question, author
   a concise, neutral `hintText` for every option in the item.
   - **All options or none**: Never provide hints for only a subset of options
     within an item; partial hints telegraph the answer.
   - **Neutral definition**: Define what the option's mechanism or tool does,
     not whether it solves the prompt's specific scenario.
   - **Zero qualifier tells**: Do not include absolute qualifier words
     (`always`, `never`, `only`, `must`, `every`, `cannot`, `all`, `any`, `no`).
5. **Source against canonical documentation.** Glosses must reflect first-party
   vendor documentation cited by the question or official vendor references
   in `certs/VENDORS.md`. Never invent capabilities or borrow from gated sources.
6. **Check metrics and bias.** Run `npm run metrics -- <slug>`. Option text
   adjustments shift length delta; confirm the bank remains within guard
   tolerances. Never trim a key into inaccuracy to compensate for length.
7. **Iterate to green on `npm run check`.** Ensure all schema rules, unit tests,
   and formatting checks pass. If `sync-dates:check` fails, run `npm run sync-dates`.
8. **Record batch note in `review-progress.md`.** Append a dated record noting
   the questions enhanced with hints, total options glossed, and rationale.

## Stop and ask

- **A candidate item where splitting options causes duplicate option text.**
  If multiple options share the same bare tool name and differ only in their
  rationales, keep the distinctive wording in `text` or rework the item in
  `author-questions`.
- **A question where options cannot be glossed without revealing the key.**
  If any gloss gives away the answer, leave the item without hints.
- **Questions needing fundamental factual rework.** If an option or key is
  factually inaccurate, hand off to `evaluate-questions` or `author-questions`.

## Done when

- Candidate bare-term questions in the domain feature `hintText` on all options.
- Statement-style items remain intact without `hintText`.
- `review-progress.md` documents the hint coverage additions.
- `npm run check` is completely green.
