import { z } from "zod";

export const SCHEMA_VERSION = 1;

const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be a lowercase, hyphen-separated slug",
  );

const sourceUrlSchema = z
  .string()
  .min(1)
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) {
      return false;
    }
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "must use HTTP or HTTPS");

const checkedDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value)
    );
  }, "must be a valid calendar date");

export const domainSchema = z
  .object({
    slug: slugSchema,
    name: z.string().min(1),
    weight: z.number().positive().max(100),
  })
  .strict();

export const catalogSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    certs: z.array(slugSchema).min(1),
  })
  .strict()
  .superRefine((catalog, context) => {
    const seen = new Set();

    catalog.certs.forEach((cert, index) => {
      if (seen.has(cert)) {
        context.addIssue({
          code: "custom",
          path: ["certs", index],
          message: `duplicate cert slug "${cert}"`,
        });
      }
      seen.add(cert);
    });
  });

export const manifestSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    cert: slugSchema,
    name: z.string().min(1),
    examUrl: sourceUrlSchema,
    contentLicense: z.string().min(1),
    domains: z.array(domainSchema).min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    const seen = new Set();

    manifest.domains.forEach((domain, index) => {
      if (seen.has(domain.slug)) {
        context.addIssue({
          code: "custom",
          path: ["domains", index, "slug"],
          message: `duplicate domain slug "${domain.slug}"`,
        });
      }
      seen.add(domain.slug);
    });

    const totalWeight = manifest.domains.reduce(
      (sum, domain) => sum + domain.weight,
      0,
    );
    if (Math.abs(totalWeight - 100) > 0.001) {
      context.addIssue({
        code: "custom",
        path: ["domains"],
        message: `domain weights must total 100, received ${totalWeight}`,
      });
    }
  });

export const optionSchema = z
  .object({
    id: slugSchema,
    text: z.string().min(1),
  })
  .strict();

export const questionSchema = z
  .object({
    id: slugSchema,
    cert: slugSchema,
    schemaVersion: z.literal(SCHEMA_VERSION),
    type: z.enum(["single", "multi"]),
    domain: slugSchema,
    subdomain: slugSchema.optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    status: z.enum(["draft", "reviewed"]),
    stem: z.string().min(1),
    options: z.array(optionSchema).min(2),
    correct: z.array(slugSchema).min(1),
    explanation: z.string().min(1),
    distractorNotes: z.record(slugSchema, z.string().min(1)).optional(),
    sourceUrl: sourceUrlSchema,
    sourceNote: z.string().min(1),
    sourceCheckedAt: checkedDateSchema,
  })
  .strict()
  .superRefine((question, context) => {
    const optionIds = new Set();

    question.options.forEach((option, index) => {
      if (optionIds.has(option.id)) {
        context.addIssue({
          code: "custom",
          path: ["options", index, "id"],
          message: `duplicate option ID "${option.id}"`,
        });
      }
      optionIds.add(option.id);
    });

    const correctIds = new Set();
    question.correct.forEach((optionId, index) => {
      if (!optionIds.has(optionId)) {
        context.addIssue({
          code: "custom",
          path: ["correct", index],
          message: `references unknown option ID "${optionId}"`,
        });
      }
      if (correctIds.has(optionId)) {
        context.addIssue({
          code: "custom",
          path: ["correct", index],
          message: `duplicate correct option ID "${optionId}"`,
        });
      }
      correctIds.add(optionId);
    });

    if (question.type === "single" && question.correct.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["correct"],
        message: "single-select questions must have exactly one correct option",
      });
    }
    if (question.type === "multi" && question.correct.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["correct"],
        message:
          "multi-select questions must have at least two correct options",
      });
    }

    // A multi-select answer key that is exactly the leading options is
    // solvable positionally, without reading the question.
    if (question.type === "multi" && question.correct.length >= 2) {
      const positions = question.correct
        .map((optionId) =>
          question.options.findIndex((option) => option.id === optionId),
        )
        .sort((left, right) => left - right);

      if (
        positions.every((position, index) => position === index) &&
        positions.length < question.options.length
      ) {
        context.addIssue({
          code: "custom",
          path: ["correct"],
          message:
            "correct options must not be exactly the first options in listed order, which makes the answer guessable from position alone",
        });
      }
    }

    for (const optionId of Object.keys(question.distractorNotes ?? {})) {
      if (!optionIds.has(optionId)) {
        context.addIssue({
          code: "custom",
          path: ["distractorNotes", optionId],
          message: `references unknown option ID "${optionId}"`,
        });
      } else if (correctIds.has(optionId)) {
        context.addIssue({
          code: "custom",
          path: ["distractorNotes", optionId],
          message: "must reference a distractor, not a correct option",
        });
      }
    }
  });

export const POSITION_BIAS_MIN_SAMPLE = 20;
export const POSITION_BIAS_MAX_SHARE = 0.5;

export const LENGTH_BIAS_MIN_SAMPLE = 20;
export const LENGTH_BIAS_MAX_MEAN_DELTA = 10;
export const LENGTH_BIAS_MAX_LONGEST_SHARE = 0.45;

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function optionLengths(question) {
  const correct = new Set(question.correct);
  const keys = [];
  const distractors = [];

  for (const option of question.options) {
    (correct.has(option.id) ? keys : distractors).push(option.text.length);
  }

  return { keys, distractors };
}

export const questionBankSchema = z
  .array(questionSchema)
  .superRefine((questions, context) => {
    const seen = new Set();

    questions.forEach((question, index) => {
      if (seen.has(question.id)) {
        context.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `duplicate question ID "${question.id}"`,
        });
      }
      seen.add(question.id);
    });

    // Bank-level guard: if one position holds most of the single-select
    // answers, the bank can be passed with a fixed positional heuristic.
    const singles = questions.filter(
      (question) => question.type === "single" && question.correct.length === 1,
    );

    if (singles.length >= POSITION_BIAS_MIN_SAMPLE) {
      const counts = new Map();

      for (const question of singles) {
        const position = question.options.findIndex(
          (option) => option.id === question.correct[0],
        );
        if (position >= 0) {
          counts.set(position, (counts.get(position) ?? 0) + 1);
        }
      }

      for (const [position, count] of counts) {
        const share = count / singles.length;
        if (share > POSITION_BIAS_MAX_SHARE) {
          context.addIssue({
            code: "custom",
            path: [],
            message: `single-select answers are biased toward position ${position + 1}: ${count} of ${singles.length} (${Math.round(share * 100)}%) exceed the ${Math.round(POSITION_BIAS_MAX_SHARE * 100)}% ceiling`,
          });
        }
      }
    }

    // Bank-level guard: if correct options are systematically longer than
    // their distractors, the bank is partly solvable on typography alone.
    const scored = questions.filter((question) => {
      const { keys, distractors } = optionLengths(question);
      return keys.length > 0 && distractors.length > 0;
    });

    if (scored.length >= LENGTH_BIAS_MIN_SAMPLE) {
      const deltas = scored.map((question) => {
        const { keys, distractors } = optionLengths(question);
        return mean(keys) - mean(distractors);
      });
      const meanDelta = mean(deltas);

      // Checked in both directions: a bank whose keys are reliably shorter is
      // just as guessable as one whose keys are reliably longer.
      if (Math.abs(meanDelta) > LENGTH_BIAS_MAX_MEAN_DELTA) {
        context.addIssue({
          code: "custom",
          path: [],
          message: `correct options are length-biased: they run ${meanDelta > 0 ? "longer" : "shorter"} than their distractors by a mean of ${Math.abs(meanDelta).toFixed(1)} characters across ${scored.length} questions, which exceeds the ${LENGTH_BIAS_MAX_MEAN_DELTA} character ceiling`,
        });
      }
    }

    const scoredSingles = scored.filter(
      (question) => question.type === "single" && question.correct.length === 1,
    );

    if (scoredSingles.length >= LENGTH_BIAS_MIN_SAMPLE) {
      const longest = scoredSingles.filter((question) => {
        const key = question.options.find(
          (option) => option.id === question.correct[0],
        );
        return question.options.every(
          (option) =>
            option.id === key.id || option.text.length < key.text.length,
        );
      }).length;
      const share = longest / scoredSingles.length;

      if (share > LENGTH_BIAS_MAX_LONGEST_SHARE) {
        context.addIssue({
          code: "custom",
          path: [],
          message: `single-select answers are biased toward the longest option: the key is the longest option in ${longest} of ${scoredSingles.length} (${Math.round(share * 100)}%), which exceeds the ${Math.round(LENGTH_BIAS_MAX_LONGEST_SHARE * 100)}% ceiling`,
        });
      }
    }
  });
