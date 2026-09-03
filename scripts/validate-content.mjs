import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  manifestSchema,
  questionBankSchema,
} from "../schemas/question-bank.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class ContentValidationError extends Error {
  constructor(messages) {
    super(
      `Content validation failed:\n${messages.map((message) => `- ${message}`).join("\n")}`,
    );
    this.name = "ContentValidationError";
  }
}

function formatIssues(label, issues) {
  return issues.map((issue) => {
    const location = issue.path.length > 0 ? `.${issue.path.join(".")}` : "";
    return `${label}${location}: ${issue.message}`;
  });
}

export function validateCertContent(folderName, manifestInput, questionsInput) {
  const manifestResult = manifestSchema.safeParse(manifestInput);
  const questionsResult = questionBankSchema.safeParse(questionsInput);
  const messages = [];

  if (!manifestResult.success) {
    messages.push(...formatIssues("manifest", manifestResult.error.issues));
  }
  if (!questionsResult.success) {
    messages.push(...formatIssues("questions", questionsResult.error.issues));
  }
  if (messages.length > 0) {
    throw new ContentValidationError(messages);
  }

  const manifest = manifestResult.data;
  const questions = questionsResult.data;
  const domains = new Set(manifest.domains.map((domain) => domain.slug));

  if (manifest.cert !== folderName) {
    messages.push(
      `manifest.cert: expected "${folderName}" to match the cert folder, received "${manifest.cert}"`,
    );
  }

  questions.forEach((question, index) => {
    if (question.cert !== manifest.cert) {
      messages.push(
        `questions.${index}.cert: expected "${manifest.cert}", received "${question.cert}"`,
      );
    }
    if (!question.id.startsWith(`${manifest.cert}-`)) {
      messages.push(
        `questions.${index}.id: must start with the cert slug "${manifest.cert}-"`,
      );
    }
    if (!domains.has(question.domain)) {
      messages.push(
        `questions.${index}.domain: "${question.domain}" is not declared in the manifest`,
      );
    }
  });

  if (messages.length > 0) {
    throw new ContentValidationError(messages);
  }

  return { manifest, questions };
}

async function readJson(path) {
  let source;
  try {
    source = await readFile(path, "utf8");
  } catch (error) {
    throw new ContentValidationError([`${path}: ${error.message}`]);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new ContentValidationError([
      `${path}: invalid JSON (${error.message})`,
    ]);
  }
}

export async function validateRepository(root = repositoryRoot) {
  const certsPath = join(root, "certs");
  let entries;

  try {
    entries = await readdir(certsPath, { withFileTypes: true });
  } catch (error) {
    throw new ContentValidationError([`${certsPath}: ${error.message}`]);
  }

  const certFolders = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (certFolders.length === 0) {
    throw new ContentValidationError([`${certsPath}: no cert folders found`]);
  }

  const questionIds = new Set();
  let questionCount = 0;

  for (const folder of certFolders) {
    const certPath = join(certsPath, folder.name);
    const [manifestInput, questionsInput] = await Promise.all([
      readJson(join(certPath, "manifest.json")),
      readJson(join(certPath, "questions.json")),
    ]);
    const { questions } = validateCertContent(
      folder.name,
      manifestInput,
      questionsInput,
    );

    questions.forEach((question) => {
      if (questionIds.has(question.id)) {
        throw new ContentValidationError([
          `questions: duplicate repository-wide question ID "${question.id}"`,
        ]);
      }
      questionIds.add(question.id);
    });
    questionCount += questions.length;
  }

  return { manifestCount: certFolders.length, questionCount };
}

async function main() {
  try {
    const result = await validateRepository();
    console.log(
      `Validated ${result.manifestCount} cert manifest(s) and ${result.questionCount} question(s).`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
