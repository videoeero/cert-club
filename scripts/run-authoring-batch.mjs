#!/usr/bin/env node
/**
 * Loops author-questions -> evaluate-questions across a list of domains,
 * driving whichever CLI/model the developer configured in model_config.env.
 * That file is gitignored on purpose (see model_config.example.env): which
 * CLI you run — Claude Code, opencode, GH Copilot CLI, agy — is a per-machine
 * choice, same reasoning as the gitignored skill installs in skills/README.md.
 *
 * This script only dispatches prompts to a CLI binary; it never commits.
 * Review the diff after each domain (or the whole run) and commit yourself —
 * AGENTS.md's "don't commit unless asked" applies to this tooling too.
 *
 * Usage:
 *   node scripts/run-authoring-batch.mjs <cert-slug> [domain...]
 *
 * With no domains given, every domain declared in the cert's manifest.json
 * runs, in manifest order.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";

import { parsePositiveInteger } from "./lib/cli.mjs";
import { listCertFolders, readJson } from "./lib/read-certs.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const SUPPORTED_CLIS = ["claude", "opencode", "copilot", "agy"];

// agy is told to time out at exactly AUTHORING_TIMEOUT via --print-timeout;
// spawnSync's own timeout needs slack past that so agy reports its own
// timeout diagnostic instead of racing it with a bare SIGTERM at the wire.
const SPAWN_TIMEOUT_GRACE_SECONDS = 5;

/**
 * Deliberately not a real .env parser (no multiline, no export keyword, no
 * escaping): one obvious failure mode instead of a parser's worth of edge
 * cases. Matching wrapping quotes are stripped, because "quote every value"
 * is a common enough .env habit that not doing this turns a copy-pasted
 * convention into a silently wrong literal string.
 */
export function loadEnvFile(path) {
  const values = {};
  if (!existsSync(path)) {
    return values;
  }
  // A UTF-8 BOM (common from Windows editors) would otherwise become part of
  // the first key, so "AUTHORING_CLI" silently never matches.
  const contents = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    const isQuoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (isQuoted) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

/**
 * `configPath`/`env` are parameterized (rather than hardcoding
 * model_config.env/process.env) so tests can exercise fallback precedence,
 * AUTHORING_CLI/AUTHORING_TIMEOUT rejection, and AUTHORING_UNATTENDED parsing
 * against a temp file and a synthetic env object, with nothing global to
 * restore afterwards. Throws instead of exiting, matching how validation
 * failures are reported everywhere else in scripts/ (e.g.
 * validate-content.mjs's ContentValidationError) — the caller decides how to
 * turn that into an exit code.
 */
export function loadConfig({
  configPath = join(repoRoot, "model_config.env"),
  env = process.env,
} = {}) {
  const fileExists = existsSync(configPath);
  // A CI run or container can supply every AUTHORING_* value as a real env
  // var; only demand the file when it's the sole source of AUTHORING_CLI.
  if (!fileExists && !env.AUTHORING_CLI) {
    throw new Error(
      `Missing ${configPath}.\n` +
        "Copy model_config.example.env to model_config.env and fill in your CLI/model, " +
        "or set AUTHORING_CLI (and friends) as environment variables.",
    );
  }
  const fromFile = fileExists ? loadEnvFile(configPath) : {};
  // Environment variables win over the file, so a one-off override doesn't
  // require editing the file back and forth. An explicitly blank value (e.g.
  // "AUTHORING_COPILOT_MODEL=" left empty in the file) must fall through to
  // the default too — ?? alone treats "" as present and never applies it.
  const get = (key, fallback = "") => {
    const raw = env[key] ?? fromFile[key];
    return raw !== undefined && raw !== "" ? raw : fallback;
  };
  // Present-but-blank must stay distinguishable from absent here: some
  // models (non-reasoning ones on Copilot) reject --effort outright, and
  // blanking the var is how a developer opts out of it entirely rather than
  // falling back to the "high" default. Trimmed so a whitespace-only env var
  // (unlike a file value, never trimmed by loadEnvFile) counts as blank too.
  const getRaw = (key) => {
    const raw = env[key] ?? fromFile[key];
    return typeof raw === "string" ? raw.trim() : raw;
  };

  const cli = get("AUTHORING_CLI");
  if (!SUPPORTED_CLIS.includes(cli)) {
    throw new Error(
      `AUTHORING_CLI must be one of ${SUPPORTED_CLIS.join(", ")}; got ${JSON.stringify(cli)}.`,
    );
  }

  const rawTimeout = get("AUTHORING_TIMEOUT", "900");
  const timeoutSeconds = parsePositiveInteger(rawTimeout);
  if (timeoutSeconds === null) {
    throw new Error(
      `AUTHORING_TIMEOUT must be a positive whole number of seconds; got ${JSON.stringify(rawTimeout)}.`,
    );
  }

  const rawCopilotEffort = getRaw("AUTHORING_COPILOT_EFFORT");
  const copilotEffort =
    rawCopilotEffort === undefined ? "high" : rawCopilotEffort;

  return {
    cli,
    claudeModel: get("AUTHORING_CLAUDE_MODEL"),
    opencodeAgent: get("AUTHORING_OPENCODE_AGENT"),
    opencodeModel: get("AUTHORING_OPENCODE_MODEL"),
    copilotModel: get("AUTHORING_COPILOT_MODEL", "auto"),
    copilotEffort,
    agyModel: get("AUTHORING_AGY_MODEL", "gemini-3.8-flash-medium"),
    unattended: ["true", "1"].includes(
      get("AUTHORING_UNATTENDED", "false").trim().toLowerCase(),
    ),
    timeoutSeconds,
  };
}

/**
 * One command per backend. Every backend runs with cwd = repoRoot so it
 * resolves this repo's project skills the same way an interactive session
 * would (confirmed live for agy and claude; opencode and copilot follow the
 * same "run from the project you want it to see" convention in their own
 * headless-workflow examples).
 */
export function buildCommand(config, prompt) {
  switch (config.cli) {
    case "claude":
      return {
        command: "claude",
        args: [
          "-p",
          prompt,
          ...(config.claudeModel ? ["--model", config.claudeModel] : []),
          ...(config.unattended ? ["--dangerously-skip-permissions"] : []),
        ],
      };
    case "opencode":
      return {
        command: "opencode",
        args: [
          "run",
          "--pure",
          ...(config.opencodeAgent ? ["--agent", config.opencodeAgent] : []),
          ...(config.opencodeModel ? ["-m", config.opencodeModel] : []),
          // opencode's own --help calls --auto "dangerous!" — auto-approves
          // every permission it isn't explicitly denied — so it stays gated
          // behind the same unattended flag as claude/agy's skip-permissions.
          ...(config.unattended ? ["--auto"] : []),
          prompt,
        ],
      };
    case "copilot":
      return {
        command: "copilot",
        args: [
          "-C",
          repoRoot,
          "-p",
          prompt,
          "--model",
          config.copilotModel,
          // Non-reasoning models reject --effort outright, so an explicitly
          // blank AUTHORING_COPILOT_EFFORT omits the flag instead of passing "".
          ...(config.copilotEffort ? ["--effort", config.copilotEffort] : []),
          "--no-auto-update",
          "--silent",
          // Copilot CLI's own --help lists this in its canonical -p example:
          // required in non-interactive mode, or -p hangs on a permission
          // prompt nobody is there to answer.
          "--allow-all-tools",
          ...(config.unattended ? ["--no-ask-user"] : []),
        ],
      };
    case "agy":
      return {
        command: "agy",
        args: [
          "-p",
          prompt,
          "--model",
          config.agyModel,
          // agy's own print-timeout defaults to 5m regardless of the
          // spawnSync timeout below, so a longer AUTHORING_TIMEOUT would
          // otherwise be silently overridden by agy killing itself first.
          "--print-timeout",
          `${config.timeoutSeconds}s`,
          ...(config.unattended ? ["--dangerously-skip-permissions"] : []),
        ],
      };
    default:
      throw new Error(`Unhandled CLI: ${config.cli}`);
  }
}

function runStep(config, prompt, label) {
  const { command, args } = buildCommand(config, prompt);
  console.log(`\n=== ${label} (${config.cli}) ===`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    timeout: (config.timeoutSeconds + SPAWN_TIMEOUT_GRACE_SECONDS) * 1000,
  });
  if (result.error) {
    const timedOut = result.error.code === "ETIMEDOUT";
    console.error(
      timedOut
        ? `${label} timed out after ${config.timeoutSeconds}s.`
        : `Failed to run ${command}: ${result.error.message}`,
    );
    return false;
  }
  if (result.signal) {
    console.error(`${label} was terminated by signal ${result.signal}.`);
    return false;
  }
  if (result.status !== 0) {
    console.error(`${label} exited with status ${result.status}.`);
    return false;
  }
  return true;
}

const USAGE =
  "Usage: node scripts/run-authoring-batch.mjs <cert-slug> [domain...]";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      `${USAGE}\n\n` +
        "With no domains given, every domain declared in the cert's manifest.json runs, in manifest order.",
    );
    return;
  }

  const [certSlug, ...requestedDomains] = args;
  if (!certSlug) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  const knownCerts = await listCertFolders(join(repoRoot, "certs"));
  if (!knownCerts.includes(certSlug)) {
    console.error(`Unknown cert: ${certSlug}\nKnown: ${knownCerts.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const manifestPath = join(repoRoot, "certs", certSlug, "manifest.json");
  const manifest = await readJson(manifestPath);
  const domainSlugs = (manifest.domains ?? []).map((domain) => domain.slug);

  const domains = [
    ...new Set(requestedDomains.length > 0 ? requestedDomains : domainSlugs),
  ];
  if (domains.length === 0) {
    console.error(
      `No domains to run: ${certSlug}'s manifest declares none, and none were requested.`,
    );
    process.exitCode = 1;
    return;
  }
  const unknown = domains.filter((slug) => !domainSlugs.includes(slug));
  if (unknown.length > 0) {
    console.error(
      `Unknown domain(s) for ${certSlug}: ${unknown.join(", ")}\nKnown: ${domainSlugs.join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  const config = loadConfig();
  console.log(
    `Running author-questions -> evaluate-questions for ${domains.length} domain(s) ` +
      `of ${certSlug} via ${config.cli}.`,
  );

  for (const domain of domains) {
    const authored = runStep(
      config,
      `/author-questions ${certSlug} ${domain}`,
      `author-questions: ${domain}`,
    );
    if (!authored) {
      process.exitCode = 1;
      return;
    }

    const evaluated = runStep(
      config,
      `/evaluate-questions ${certSlug} ${domain}`,
      `evaluate-questions: ${domain}`,
    );
    if (!evaluated) {
      process.exitCode = 1;
      return;
    }
  }

  console.log(
    "\nAll domains done. Review the diff and review-progress.md before committing " +
      "— this script never commits on its own.",
  );
}

// Guarded so importing this module for its exported helpers (buildCommand,
// loadEnvFile — see test/run-authoring-batch.test.mjs) never runs the batch.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
