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
    return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
  }, "must be a valid calendar date");

export const domainSchema = z
  .object({
    slug: slugSchema,
    name: z.string().min(1),
    weight: z.number().positive().max(100),
  })
  .strict();

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
        message: "multi-select questions must have at least two correct options",
      });
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
  });
