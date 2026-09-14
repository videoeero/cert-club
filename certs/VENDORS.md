# Vendor sourcing profiles

Where each certification vendor publishes its exam guides, which of its
documentation hosts may be cited, and — the part that cannot be worked out from
the banks themselves — which of its properties must **not** be cited.

The positive lists here are largely derivable: every bank's `manifest.examUrl`
and its questions' `sourceUrl` hosts are in the repository already. The
negative lists are not. Nothing in `certs/` records that a host is a legacy
redirect, that a vendor keeps superseded guide revisions live, or that an
official-looking property is gated — absence of a citation is not evidence of
anything. Those are learned by hitting them, and this file is where that gets
written down instead of being rediscovered.

**This file rots.** Every entry is what was true on the date it records, and a
stale profile is worse than none, because it reads as authoritative and nothing
cross-checks it. `audit-sources` owns keeping it current: it fetches every
cited host on a schedule, so it is the only workflow positioned to notice that
a vendor has moved. Re-date an entry when you have re-confirmed it, not when
you have merely read it here.

Add a vendor when its first bank lands, from what that work established. Do not
write a profile for a vendor with no bank — a guessed profile is the same
fabrication problem in a new place.

## Anthropic

_Checked 2026-09-14 · banks: `ccdv-f`, `ccar-f`, `ccar-p`_

- **Exam guides** are PDFs on Anthropic's Everpath CDN, all under one
  instructor path, with adjacent numeric IDs per guide:
  `https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F<id>%2F<Guide+Name>.pdf`
  The Partner Academy certification page for a cert links its guide directly.
- **Current guides carry a version block** on page 1:
  `Version 1.0 · Effective July 2026 · Exam code: CCAR-F`. Read it.
- **Superseded revisions stay live indefinitely, on other instructor paths.**
  A `Version 0.1 · Last Updated: Feb 10 2025` copy of the CCAR-F guide still
  returns 200 from Anthropic's own CDN. It passes every gate and authority
  test and is the wrong document. Prefer the higher version, and prefer the
  instructor path the other guides use.
- **The model lineup turns over faster than anything else on these hosts, and
  retired models stay documented.** Confirmed 2026-09-13: the current lineup is
  Claude Fable 5.1, Claude Opus 5, Claude Sonnet 5 and Claude Haiku 4.5. Pages
  keep listing superseded models with a parenthetical
  `([retired, except on Bedrock and Google Cloud])`, and Claude 3.5 Sonnet has
  dropped off the pricing table entirely. A bank that names a model in a stem
  acquires an expiry date it does not advertise — grep for model names every
  pass and diff against `platform.claude.com/docs/en/models/overview`.
- **API surfaces are superseded in place, with the old shape left documented.**
  Confirmed 2026-09-13: manual extended thinking (`thinking.type: "enabled"`
  with `budget_tokens`) is deprecated on the Claude 4.6 models and returns a
  **400** on 4.7 and later; `tool_choice` values `any` and `tool` return a
  **400** on Claude Fable 5.1 and Mythos 5.1; and assistant-turn prefill 400s
  from Claude 4.6 onward. In each case the superseding feature is a different
  page (adaptive thinking, strict tool use, structured outputs), so the old
  page stays live, accurate for old models, and wrong for new ones. Read the
  deprecation banner at the top of a page before trusting a question keyed on
  its API shape.
- **Citable documentation:**
  - `https://platform.claude.com/docs/en/*` — platform and API
  - `https://code.claude.com/docs/en/*` — Claude Code
  - `https://www.anthropic.com/engineering/*` — engineering posts
  - `https://modelcontextprotocol.io/docs/*` — MCP
- **These docs render client-side.** Append `.md` to a page URL to read it as
  text: `curl -sL https://code.claude.com/docs/en/mcp.md`. This works on
  `modelcontextprotocol.io` too, including its `/specification/` paths.
- **`anthropic.com/engineering` posts are revised in place, keeping their
  publication date.** `building-effective-agents` still reads "Published Dec 19,
  2024", but as of 2026-09-13 it carries an editorial note that "much of the
  tooling landscape described in this post has changed since December 2024",
  its framework list has been rewritten (LangGraph and Bedrock's agent
  framework replaced by the Claude Agent SDK and AWS's Strands), and its
  routing example's models refreshed from the 3.5 generation to Haiku 4.5 and
  Sonnet 4.5. There is no version block, no changelog and no revision-pinned
  URL — unlike the exam guides and `modelcontextprotocol.io`, an engineering
  post gives you **no way to tell from the URL or the date that it moved**.
  The only detection is re-reading the prose. Treat any post cited by many
  questions as requiring a full claim-by-claim read every pass, not a liveness
  check.
- **`modelcontextprotocol.io` is revision-scoped, and old revisions never
  die.** Live paths come in two shapes: unversioned (`/docs/learn/architecture`)
  and pinned (`/docs/2026-07-28/learn/architecture`). The unversioned form
  302s to the current revision, so it silently re-points as revisions land —
  fine for a claim that is revision-independent, wrong for anything a revision
  can change. Superseded revisions stay live and return 200 forever:
  `/specification/2024-11-05/server/resources` still documents
  `resources/subscribe`, a method the current revision no longer has. This is
  the same trap as the superseded exam guides above — 200 and authentically
  Anthropic-published is not the same as current. **Cite the pinned
  current-revision path**, and pin a superseded revision only when the stem
  names that revision.
- **The deprecation registry is the cheap way to check currency:**
  `/specification/<revision>/deprecated` tabulates every Deprecated feature
  with its SEP, migration path, and earliest-removal revision. Read it before
  trusting any MCP question. As of `2026-07-28`: Roots, Sampling, Logging and
  Dynamic Client Registration are Deprecated (earliest removal is the first
  revision released on or after 2027-07-28); HTTP+SSE has been Deprecated
  since `2025-03-26`. Nothing has been removed yet.
- **Do not cite:**
  - `docs.anthropic.com` — legacy. It still answers, which is the trap:
    platform pages land on restructured `platform.claude.com` paths, and
    Claude Code pages land on `code.claude.com/docs`, a section root that no
    longer establishes any specific claim.
  - `anthropic-partners.skilljar.com` / Partner Academy course content —
    gated behind registration. The certification landing pages are readable
    as coverage evidence only.
  - Third-party repositories that re-host the guide PDFs. Open to read, so
    they pass the gate; not published by Anthropic, so they fail authority.
    The one you will find is recorded below.

### Prior art: `Amey-Thakur/CLAUDE-CERTIFICATIONS`

> **Calibration only — never a `sourceUrl` or `examUrl`.** It is open to read,
> so it passes the gate test, and it fails the authority test in `AGENTS.md`:
> the exam-guide PDFs it hosts are copies, and a copy can be stale, partial or
> edited with nothing here to reveal it. Cite Anthropic's own copy — the
> Partner Academy certification page links the guide on the Everpath CDN
> above. An agent has already been led from this record to the wrong
> `examUrl`, which is why the rule sits next to the record rather than only in
> a review file.

Recorded because it is the first thing a search for these exams turns up, and
because rediscovering it costs a day. It is real, MIT licensed, actively
maintained, and holds several hundred questions across the four Claude certs
plus flashcards, cheat sheets and the guide PDFs. What inspecting it
established:

- **It independently confirms the blueprint.** Identical domains and weights
  for `ccdv-f`, and the same exam facts. Two unrelated readings agree, which
  is worth more than either alone.
- **It arrived at keyed-object options independently** rather than positional
  indices — the same conclusion `schemas/question-bank.mjs` reaches.
- **All of its questions are single-answer.** Its schema structurally cannot
  express multiple-response, though the real exams include "Select TWO/THREE"
  items. Useful as a warning, not a model.
- **It carries no per-question citation of any kind.** No `sourceUrl`, no doc
  reference, no provenance. That gap maps exactly onto this repository's
  non-negotiable citation requirement — **provenance is the differentiator
  here, not question volume.**

**Usage rule:** cross-check and calibration only. Do not copy questions or
rationales, MIT licence notwithstanding. Importing someone else's uncited bank
would destroy the one property that makes this project worth building.

## Microsoft

_Checked 2026-09-03 · bank: `az-900`_

- **Exam guides** are study guides on Microsoft Learn, keyed by exam code:
  `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/<exam-code>`
- **Citable documentation:** `https://learn.microsoft.com/*`.
- No excluded properties recorded yet. One bank, one host — this profile has
  not been stress-tested, so treat its silence as untested rather than clean.

## AWS

_Checked 2026-09-11 · bank: `aws-clf-c02`_

- **Exam guides** are HTML on the AWS docs site:
  `https://docs.aws.amazon.com/aws-certification/latest/<guide-slug>/<guide-slug>.html`
- **Citable documentation:** `https://docs.aws.amazon.com/*`, and
  `https://aws.amazon.com/*` for product and compliance pages that state a
  verifiable fact.
- **Do not cite:**
  - `explore.skillbuilder.aws` / AWS Skill Builder — gated behind account
    registration. Official practice question sets and exam prep materials may
    be reviewed as calibration for difficulty and question style, but must
    never be cited as a `sourceUrl`.

## Google

No bank yet, so no profile. Write one from the first Google cert's recon.
