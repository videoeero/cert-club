# {{name}} review record

Scaffolded on {{today}} by `scripts/scaffold-cert.mjs`. No questions have been
authored yet.

## Bank status: `draft`

`manifest.status` is `draft`. A freshly scaffolded bank has zero questions, so
every declared domain is empty by construction.

Promote to `stable` only when coverage is genuinely proportional across all
domains, judged per domain against the manifest weights rather than by total
question count, and record that reasoning here. The standard bank authoring target
is 2x the official exam question count (`2 * manifest.examQuestionCount`), providing
two full non-overlapping mock exam sessions.

## Blueprint normalization

Domain weights were supplied directly to `scripts/scaffold-cert.mjs` as
{{weightList}}. If these were derived from published ranges, replace this
paragraph with the exact ranges and the `--normalize` arithmetic (midpoint,
scale to 100, floor, largest remainder) that produced them, the way
`az-900/review-progress.md` and `aws-clf-c02/review-progress.md` do.

{{distributionTable}}

## Known coverage limits

No questions exist yet. `npm run check` will fail until every domain listed
above holds at least one question with a real, checkable `sourceUrl` — do not
add a placeholder question to make the gate pass; a placeholder needs a
fabricated `sourceUrl`, which this project never does.
