import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildCommand,
  loadConfig,
  loadEnvFile,
} from "../scripts/run-authoring-batch.mjs";

const baseConfig = {
  cli: "claude",
  claudeModel: "",
  opencodeAgent: "",
  opencodeModel: "",
  copilotModel: "auto",
  copilotEffort: "high",
  agyModel: "gemini-3.8-flash-medium",
  unattended: false,
  timeoutSeconds: 900,
};

test("claude only skips permissions when unattended", () => {
  const attended = buildCommand({ ...baseConfig, cli: "claude" }, "/x");
  assert.ok(!attended.args.includes("--dangerously-skip-permissions"));

  const unattended = buildCommand(
    { ...baseConfig, cli: "claude", unattended: true },
    "/x",
  );
  assert.ok(unattended.args.includes("--dangerously-skip-permissions"));
});

test("claude passes --model only when configured", () => {
  const withoutModel = buildCommand({ ...baseConfig, cli: "claude" }, "/x");
  assert.ok(!withoutModel.args.includes("--model"));

  const withModel = buildCommand(
    { ...baseConfig, cli: "claude", claudeModel: "claude-opus-5" },
    "/x",
  );
  const index = withModel.args.indexOf("--model");
  assert.ok(index !== -1);
  assert.equal(withModel.args[index + 1], "claude-opus-5");
});

test("opencode only auto-approves permissions when unattended", () => {
  // opencode's own --help calls --auto "dangerous!" (auto-approves every
  // permission not explicitly denied) — it must never be on by default.
  const attended = buildCommand({ ...baseConfig, cli: "opencode" }, "/x");
  assert.ok(!attended.args.includes("--auto"));

  const unattended = buildCommand(
    { ...baseConfig, cli: "opencode", unattended: true },
    "/x",
  );
  assert.ok(unattended.args.includes("--auto"));
});

test("opencode passes --agent and -m only when configured", () => {
  const bare = buildCommand({ ...baseConfig, cli: "opencode" }, "/x");
  assert.ok(!bare.args.includes("--agent"));
  assert.ok(!bare.args.includes("-m"));

  const configured = buildCommand(
    {
      ...baseConfig,
      cli: "opencode",
      opencodeAgent: "build",
      opencodeModel: "huggingface/Qwen/Qwen3.8-27B",
    },
    "/x",
  );
  const agentIndex = configured.args.indexOf("--agent");
  const modelIndex = configured.args.indexOf("-m");
  assert.equal(configured.args[agentIndex + 1], "build");
  assert.equal(configured.args[modelIndex + 1], "huggingface/Qwen/Qwen3.8-27B");
});

test("copilot always gets --allow-all-tools in -p mode", () => {
  // Copilot CLI's own --help lists --allow-all-tools in its canonical -p
  // example: without it, -p hangs on a permission prompt nobody answers.
  const attended = buildCommand({ ...baseConfig, cli: "copilot" }, "/x");
  assert.ok(attended.args.includes("--allow-all-tools"));
  assert.ok(!attended.args.includes("--no-ask-user"));

  const unattended = buildCommand(
    { ...baseConfig, cli: "copilot", unattended: true },
    "/x",
  );
  assert.ok(unattended.args.includes("--no-ask-user"));
});

test("copilot omits --effort when explicitly blanked", () => {
  // Non-reasoning models reject --effort outright; an explicitly blank
  // AUTHORING_COPILOT_EFFORT is how a developer opts out of the flag.
  const withEffort = buildCommand({ ...baseConfig, cli: "copilot" }, "/x");
  assert.ok(withEffort.args.includes("--effort"));

  const withoutEffort = buildCommand(
    { ...baseConfig, cli: "copilot", copilotEffort: "" },
    "/x",
  );
  assert.ok(!withoutEffort.args.includes("--effort"));
});

test("agy always gets --print-timeout matching the configured timeout", () => {
  // agy's own print-timeout defaults to 5m regardless of the orchestrator's
  // spawnSync timeout, so a longer AUTHORING_TIMEOUT must be passed through.
  const { args } = buildCommand(
    { ...baseConfig, cli: "agy", timeoutSeconds: 120 },
    "/x",
  );
  const index = args.indexOf("--print-timeout");
  assert.ok(index !== -1);
  assert.equal(args[index + 1], "120s");
});

test("agy only skips permissions when unattended", () => {
  const attended = buildCommand({ ...baseConfig, cli: "agy" }, "/x");
  assert.ok(!attended.args.includes("--dangerously-skip-permissions"));

  const unattended = buildCommand(
    { ...baseConfig, cli: "agy", unattended: true },
    "/x",
  );
  assert.ok(unattended.args.includes("--dangerously-skip-permissions"));
});

test("buildCommand throws on an unsupported CLI", () => {
  assert.throws(
    () => buildCommand({ ...baseConfig, cli: "bogus" }, "/x"),
    /Unhandled CLI: bogus/,
  );
});

test("loadEnvFile parses flat key=value lines, skipping blanks and comments", () => {
  const dir = mkdtempSync(join(tmpdir(), "authoring-batch-"));
  const path = join(dir, "config.env");
  writeFileSync(
    path,
    [
      "# a comment",
      "",
      "AUTHORING_CLI=agy",
      "AUTHORING_AGY_MODEL= gemini-3.8-flash-medium ",
      "AUTHORING_UNATTENDED=",
    ].join("\n"),
  );

  try {
    const values = loadEnvFile(path);
    assert.equal(values.AUTHORING_CLI, "agy");
    assert.equal(values.AUTHORING_AGY_MODEL, "gemini-3.8-flash-medium");
    assert.equal(values.AUTHORING_UNATTENDED, "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadEnvFile returns an empty object for a missing file", () => {
  assert.deepEqual(loadEnvFile("/nonexistent/path.env"), {});
});

test("loadEnvFile strips matching wrapping quotes", () => {
  const dir = mkdtempSync(join(tmpdir(), "authoring-batch-"));
  const path = join(dir, "config.env");
  writeFileSync(
    path,
    [
      'AUTHORING_TIMEOUT="900"',
      "AUTHORING_COPILOT_MODEL='auto'",
      // Mismatched quotes are not a wrapping pair — left untouched.
      "AUTHORING_CLAUDE_MODEL=\"mismatched'",
    ].join("\n"),
  );

  try {
    const values = loadEnvFile(path);
    assert.equal(values.AUTHORING_TIMEOUT, "900");
    assert.equal(values.AUTHORING_COPILOT_MODEL, "auto");
    assert.equal(values.AUTHORING_CLAUDE_MODEL, "\"mismatched'");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadEnvFile strips a leading UTF-8 BOM", () => {
  const dir = mkdtempSync(join(tmpdir(), "authoring-batch-"));
  const path = join(dir, "config.env");
  writeFileSync(path, "﻿AUTHORING_CLI=agy\n");

  try {
    assert.equal(loadEnvFile(path).AUTHORING_CLI, "agy");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadConfig requires the file only when AUTHORING_CLI isn't in env", () => {
  assert.throws(
    () => loadConfig({ configPath: "/nonexistent/config.env", env: {} }),
    /Missing \/nonexistent\/config\.env/,
  );

  const config = loadConfig({
    configPath: "/nonexistent/config.env",
    env: { AUTHORING_CLI: "claude" },
  });
  assert.equal(config.cli, "claude");
});

test("loadConfig rejects an unsupported AUTHORING_CLI", () => {
  assert.throws(
    () =>
      loadConfig({
        configPath: "/nonexistent/config.env",
        env: { AUTHORING_CLI: "bogus" },
      }),
    /AUTHORING_CLI must be one of/,
  );
});

test("loadConfig rejects a non-integer AUTHORING_TIMEOUT", () => {
  assert.throws(
    () =>
      loadConfig({
        configPath: "/nonexistent/config.env",
        env: { AUTHORING_CLI: "claude", AUTHORING_TIMEOUT: "15m" },
      }),
    /AUTHORING_TIMEOUT must be a positive whole number of seconds/,
  );
});

test("loadConfig parses AUTHORING_UNATTENDED case-insensitively, accepting 1", () => {
  const truthyValues = ["true", "TRUE", "True", "1"];
  for (const value of truthyValues) {
    const config = loadConfig({
      configPath: "/nonexistent/config.env",
      env: { AUTHORING_CLI: "claude", AUTHORING_UNATTENDED: value },
    });
    assert.equal(config.unattended, true, `expected ${value} to be truthy`);
  }

  const config = loadConfig({
    configPath: "/nonexistent/config.env",
    env: { AUTHORING_CLI: "claude", AUTHORING_UNATTENDED: "nope" },
  });
  assert.equal(config.unattended, false);
});

test("loadConfig treats a whitespace-only AUTHORING_COPILOT_EFFORT as blank", () => {
  const config = loadConfig({
    configPath: "/nonexistent/config.env",
    env: { AUTHORING_CLI: "copilot", AUTHORING_COPILOT_EFFORT: "   " },
  });
  assert.equal(config.copilotEffort, "");
});
