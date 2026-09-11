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

_Checked 2026-09-10 · banks: `ccdv-f`, `ccar-f`_

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
- **Citable documentation:**
  - `https://platform.claude.com/docs/en/*` — platform and API
  - `https://code.claude.com/docs/en/*` — Claude Code
  - `https://www.anthropic.com/engineering/*` — engineering posts
  - `https://modelcontextprotocol.io/docs/*` — MCP
- **These docs render client-side.** Append `.md` to a page URL to read it as
  text: `curl -sL https://code.claude.com/docs/en/mcp.md`.
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
    See the firewall in `PLAN.md` § Prior art.

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
