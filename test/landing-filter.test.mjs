import assert from "node:assert/strict";
import test from "node:test";

import {
  compileFilter,
  compileFilterRegex,
  filterManifests,
  isPotentiallyUnsafeRegex,
  matchesCertFilter,
} from "../src/lib/filter.ts";

function createManifest(overrides) {
  return {
    schemaVersion: 1,
    cert: "test-cert",
    name: "Test Certification",
    vendor: "Test Vendor",
    status: "stable",
    updatedAt: "2026-09-01",
    examUrl: "https://example.com/exam",
    contentLicense: "CC-BY-SA-4.0",
    domains: [{ slug: "d1", name: "Domain 1", weight: 100 }],
    ...overrides,
  };
}

const sampleManifests = [
  createManifest({
    cert: "aws-dva-c02",
    name: "AWS Certified Developer - Associate",
    vendor: "AWS",
  }),
  createManifest({
    cert: "aws-clf-c02",
    name: "AWS Certified Cloud Practitioner",
    vendor: "AWS",
  }),
  createManifest({
    cert: "ccar-f",
    name: "Claude Certified Architect: Foundations",
    vendor: "Anthropic",
  }),
  createManifest({
    cert: "ccdv-f",
    name: "Claude Certified Developer: Foundations",
    vendor: "Anthropic",
  }),
  createManifest({
    cert: "az-900",
    name: "Microsoft Certified: Azure Fundamentals",
    vendor: "Microsoft",
  }),
];

test("compileFilterRegex returns compiled regex when enclosed in /.../", () => {
  const result = compileFilterRegex("/aws|anthropic/");
  assert.ok(result.regex instanceof RegExp);
  assert.equal(result.error, null);
  assert.ok(result.regex.test("AWS"));
});

test("compileFilterRegex treats unslashed input as plain text without compiling regex", () => {
  const result = compileFilterRegex("aws|anthropic");
  assert.equal(result.regex, null);
  assert.equal(result.error, null);
});

test("compileFilterRegex handles empty/whitespace input safely", () => {
  assert.deepEqual(compileFilterRegex(""), { regex: null, error: null });
  assert.deepEqual(compileFilterRegex("   "), { regex: null, error: null });
});

test("compileFilterRegex catches invalid regular expressions without throwing", () => {
  const unclosedBracket = compileFilterRegex("/[abc/");
  assert.equal(unclosedBracket.regex, null);
  assert.ok(typeof unclosedBracket.error === "string");

  const unclosedGroup = compileFilterRegex("/(abc/");
  assert.equal(unclosedGroup.regex, null);
  assert.ok(typeof unclosedGroup.error === "string");

  const trailingSlash = compileFilterRegex("/\\/");
  assert.equal(trailingSlash.regex, null);
  assert.ok(typeof trailingSlash.error === "string");
});

test("compileFilterRegex catches catastrophic backtracking (ReDoS) patterns", () => {
  assert.equal(isPotentiallyUnsafeRegex("(a+)+"), true);
  assert.equal(isPotentiallyUnsafeRegex("(a|b+)+"), true);
  assert.equal(isPotentiallyUnsafeRegex("(?:a+)+"), true);
  assert.equal(isPotentiallyUnsafeRegex("[0-9]{3}"), false);

  const unsafe = compileFilterRegex("/(a+)+$/");
  assert.equal(unsafe.regex, null);
  assert.ok(unsafe.error?.includes("unsafe"));
});

test("matchesCertFilter matches by name (case-insensitive substring)", () => {
  const manifest = sampleManifests[0]; // AWS Certified Developer
  assert.equal(matchesCertFilter(manifest, "developer"), true);
  assert.equal(matchesCertFilter(manifest, "DEVELOPER"), true);
  assert.equal(matchesCertFilter(manifest, "associate"), true);
  assert.equal(matchesCertFilter(manifest, "architect"), false);
});

test("matchesCertFilter matches by code/cert (case-insensitive substring)", () => {
  const manifest = sampleManifests[0]; // aws-dva-c02
  assert.equal(matchesCertFilter(manifest, "dva"), true);
  assert.equal(matchesCertFilter(manifest, "DVA-C02"), true);
  assert.equal(matchesCertFilter(manifest, "aws-dva"), true);
  assert.equal(matchesCertFilter(manifest, "ccdv"), false);
});

test("matchesCertFilter matches by vendor (case-insensitive substring)", () => {
  const awsManifest = sampleManifests[0];
  const anthropicManifest = sampleManifests[2];

  assert.equal(matchesCertFilter(awsManifest, "aws"), true);
  assert.equal(matchesCertFilter(anthropicManifest, "anthropic"), true);
  assert.equal(matchesCertFilter(awsManifest, "anthropic"), false);
});

test("matchesCertFilter supports plain search terms with regex metacharacters safely", () => {
  const manifest = createManifest({
    cert: "test[code]",
    name: "C++ Foundations (AWS)",
    vendor: "Vendor+",
  });

  assert.equal(matchesCertFilter(manifest, "c++"), true);
  assert.equal(matchesCertFilter(manifest, "(aws)"), true);
  assert.equal(matchesCertFilter(manifest, "[code]"), true);
  assert.equal(matchesCertFilter(manifest, "vendor+"), true);
  assert.equal(matchesCertFilter(manifest, "[nonexistent"), false);
});

test("matchesCertFilter supports opt-in regex alternation (/.../)", () => {
  assert.equal(matchesCertFilter(sampleManifests[0], "/aws|anthropic/"), true);
  assert.equal(matchesCertFilter(sampleManifests[2], "/aws|anthropic/"), true);
  assert.equal(matchesCertFilter(sampleManifests[4], "/aws|anthropic/"), false);
});

test("matchesCertFilter supports opt-in regex anchors (^, $)", () => {
  const claudeArch = sampleManifests[2]; // Claude Certified Architect: Foundations
  assert.equal(matchesCertFilter(claudeArch, "/^claude/"), true);
  assert.equal(matchesCertFilter(claudeArch, "/^architect/"), false);
  assert.equal(matchesCertFilter(claudeArch, "/foundations$/"), true);
  assert.equal(matchesCertFilter(claudeArch, "/architect$/"), false);
});

test("matchesCertFilter supports opt-in regex character classes", () => {
  assert.equal(matchesCertFilter(sampleManifests[4], "/[0-9]{3}/"), true); // az-900
  assert.equal(matchesCertFilter(sampleManifests[2], "/[0-9]{3}/"), false); // ccar-f
});

test("matchesCertFilter returns true on empty or whitespace query", () => {
  assert.equal(matchesCertFilter(sampleManifests[0], ""), true);
  assert.equal(matchesCertFilter(sampleManifests[0], "   "), true);
});

test("compileFilter creates reusable compiled filter", () => {
  const compiled = compileFilter("developer");
  assert.equal(compiled.test(sampleManifests[0]), true);
  assert.equal(compiled.test(sampleManifests[1]), false);
});

test("filterManifests returns all manifests when query is empty", () => {
  const filtered = filterManifests(sampleManifests, "");
  assert.equal(filtered.length, sampleManifests.length);
});

test("filterManifests filters across all manifests with substring and regex", () => {
  const awsOnly = filterManifests(sampleManifests, "/^aws-/");
  assert.deepEqual(
    awsOnly.map((m) => m.cert),
    ["aws-dva-c02", "aws-clf-c02"],
  );

  const anthropicOnly = filterManifests(sampleManifests, "anthropic");
  assert.deepEqual(
    anthropicOnly.map((m) => m.cert),
    ["ccar-f", "ccdv-f"],
  );

  const developerOnly = filterManifests(sampleManifests, "developer");
  assert.deepEqual(
    developerOnly.map((m) => m.cert),
    ["aws-dva-c02", "ccdv-f"],
  );

  const none = filterManifests(sampleManifests, "nonexistent-query-string");
  assert.equal(none.length, 0);
});
