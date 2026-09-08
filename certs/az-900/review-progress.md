# AZ-900 review record

The bank follows the official AZ-900 skills outline measured as of July 20,
2026. Sources and the exam guide were checked on September 3, 2026.

## Bank status: `draft`

`manifest.status` is `draft`. Every question here is `reviewed` and sourced,
but 18 questions against a 40-question exam is a schema-generalisation
proof, not a rehearsal — the bank exists to show that another vendor’s
blueprint, weights and sourcing rules fit the same schema as CCDV-F.

Promote to `stable` when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here.

## Blueprint normalization

Microsoft publishes domain ranges of 25-30%, 35-40%, and 30-35%. The manifest
uses the midpoint of each range, normalizes the midpoints to 100%, floors each
result, and assigns the remaining point by largest remainder. This produces
28%, 39%, and 33%.

The 18 questions follow the same distribution:

| Domain                                      | Questions |
| ------------------------------------------- | --------: |
| Describe cloud concepts                     |         5 |
| Describe Azure architecture and services    |         7 |
| Describe Azure management and governance    |         6 |

Six questions are multiple-response items. All 18 are marked `reviewed`.

## Accuracy and pattern review

An independent review checked every answer key and source-to-claim pairing
against the cited live Microsoft page. All 18 keys agreed with their sources,
all questions mapped to the July 2026 blueprint, and no retired or renamed
content was found.

The same review measured answer cues even though the bank is below the
validator's 20-question threshold:

- Mean correct-option length minus distractor length: 4.3 characters.
- Correct answer was the longest option in 4 of 12 single-select questions.
- The most common single-select answer position appeared in 4 of 12 questions.
- No multiple-response key was a leading run of options.

This is a forcing-function bank for validating multi-cert support, not a
full-size replacement for Microsoft's learning material. Future expansion
should prioritize availability zones, compute-type comparisons, management
groups, and serverless concepts.
