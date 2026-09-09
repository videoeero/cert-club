import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  catalogSchema,
  manifestSchema,
  questionBankSchema,
} from "../schemas/question-bank.mjs";
import { ContentValidationError } from "./lib/errors.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "./lib/read-certs.mjs";

// Re-exported because this module has been the import site for the error type
// since before the shared library existed.
export { ContentValidationError };

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  const skillsByDomain = new Map(
    manifest.domains
      .filter((domain) => domain.skills !== undefined)
      .map((domain) => [
        domain.slug,
        new Set(domain.skills.map((skill) => skill.slug)),
      ]),
  );

  if (manifest.cert !== folderName) {
    messages.push(
      `manifest.cert: expected "${folderName}" to match the cert folder, received "${manifest.cert}"`,
    );
  }

  // The app fetches one questions/<domain-slug>.json file per manifest
  // domain, so a domain with no matching questions is a runtime 404 waiting
  // to happen, not a merely thin domain.
  const domainsWithQuestions = new Set(
    questions.map((question) => question.domain),
  );
  for (const domain of domains) {
    if (!domainsWithQuestions.has(domain)) {
      messages.push(
        `manifest.domains: "${domain}" has no questions/${domain}.json file`,
      );
    }
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
      return;
    }

    // Only enforced for domains that publish a skill breakdown, so cert banks
    // without one keep using subdomain as a free-form label.
    const skills = skillsByDomain.get(question.domain);
    if (!skills) {
      return;
    }
    if (question.subdomain === undefined) {
      messages.push(
        `questions.${index}.subdomain: is required because domain "${question.domain}" declares skills`,
      );
    } else if (!skills.has(question.subdomain)) {
      messages.push(
        `questions.${index}.subdomain: "${question.subdomain}" is not a skill of domain "${question.domain}"`,
      );
    }
  });

  if (messages.length > 0) {
    throw new ContentValidationError(messages);
  }

  return { manifest, questions };
}

export function validateCatalog(catalogInput, folderNames) {
  const catalogResult = catalogSchema.safeParse(catalogInput);
  if (!catalogResult.success) {
    throw new ContentValidationError(
      formatIssues("catalog", catalogResult.error.issues),
    );
  }

  const catalogCerts = catalogResult.data.certs;
  const catalogSet = new Set(catalogCerts);
  const folderSet = new Set(folderNames);
  const messages = [];

  for (const cert of catalogCerts) {
    if (!folderSet.has(cert)) {
      messages.push(`catalog.certs: "${cert}" has no matching cert folder`);
    }
  }
  for (const folderName of folderNames) {
    if (!catalogSet.has(folderName)) {
      messages.push(
        `certs/${folderName}: cert folder is not listed in catalog.json`,
      );
    }
  }

  if (messages.length > 0) {
    throw new ContentValidationError(messages);
  }

  return catalogCerts;
}

export async function validateRepository(root = repositoryRoot) {
  const certsPath = join(root, "certs");
  const certFolders = await listCertFolders(certsPath);

  if (certFolders.length === 0) {
    throw new ContentValidationError([`${certsPath}: no cert folders found`]);
  }

  const catalogInput = await readJson(join(certsPath, "catalog.json"));
  validateCatalog(catalogInput, certFolders);

  const questionIds = new Set();
  let questionCount = 0;

  for (const folderName of certFolders) {
    const certPath = join(certsPath, folderName);
    const [manifestInput, questionsInput] = await Promise.all([
      readJson(join(certPath, "manifest.json")),
      readCertQuestions(certPath),
    ]);
    const { questions } = validateCertContent(
      folderName,
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
