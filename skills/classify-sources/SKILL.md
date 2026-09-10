---
name: classify-sources
description: Locate a proposed certification's current official exam guide and classify every candidate documentation source on gate and authority. Use only as the first phase of assess-new-cert's recon, before any bank exists. Not for the recurring citation-drift pass on an existing bank — that's audit-sources — and not for sourcing individual questions during authoring.
allowed-tools: Read, Glob, Grep, WebSearch, WebFetch, Bash
---

# Locate and classify a cert's sources

Phase one of `assess-new-cert`'s recon. `certs/ADDING-A-CERT.md` and
`certs/VENDORS.md` own the rules this applies; this file is the order of
operations.

## Stages

1. **Find the official guide, then find the _current_ one.** Read
   `certs/VENDORS.md` first — if this vendor has a profile it names where the
   guides live, which documentation hosts are citable, and which of its
   properties must not be cited. Then fetch the guide with no credentials; if
   reading it needs an account, the recon is already in NO-GO territory.
   Vendors leave old revisions up indefinitely, and a superseded guide passes
   every other test in this skill — so read the version and date block and
   record both verbatim. A `Version 0.1` from last year is not the guide,
   however officially it is hosted. When two vendor copies exist, prefer the
   higher version, and prefer the one on the path the vendor's other guides
   use — check where an existing bank's `examUrl` points.
2. **Classify every candidate source on both axes.** _Gate_: the test is
   **registration, not price**, and the vendor's own official course fails it
   however official it is. _Authority_: is the publisher the party that owns
   the fact? A copy of the guide in a public repository passes the gate and
   fails authority — it is unciteable, and as `examUrl` it would put the whole
   blueprint on a mirror. Both get re-litigated every time. Label each URL
   citable, readable-but-not-citable (a course's public landing page is the
   standing example — it evidences coverage, never a fact), or excluded, and
   say which axis excluded it.

## Done when

The guide's version and date are recorded verbatim, and every candidate
source has one label with the axis that decided it. Hand the guide and the
label list to `skills/extract-blueprint/SKILL.md`; nothing here is written to
disk yet — `assess-new-cert` writes the findings once a verdict exists.
