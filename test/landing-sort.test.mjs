import assert from "node:assert/strict";
import test from "node:test";

import {
  parseSortOption,
  sortManifests,
  toSortOption,
} from "../src/lib/sort.ts";

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

test("parseSortOption parses known sort keys and defaults safely", () => {
  assert.deepEqual(parseSortOption("name-asc"), {
    field: "name",
    direction: "asc",
  });
  assert.deepEqual(parseSortOption("name-desc"), {
    field: "name",
    direction: "desc",
  });
  assert.deepEqual(parseSortOption("cert-asc"), {
    field: "cert",
    direction: "asc",
  });
  assert.deepEqual(parseSortOption("cert-desc"), {
    field: "cert",
    direction: "desc",
  });
  assert.deepEqual(parseSortOption("updatedAt-desc"), {
    field: "updatedAt",
    direction: "desc",
  });
  assert.deepEqual(parseSortOption("updatedAt-asc"), {
    field: "updatedAt",
    direction: "asc",
  });
  assert.deepEqual(parseSortOption("vendor-asc"), {
    field: "vendor",
    direction: "asc",
  });
  assert.deepEqual(parseSortOption("vendor-desc"), {
    field: "vendor",
    direction: "desc",
  });
  assert.deepEqual(parseSortOption("unknown-key"), {
    field: "name",
    direction: "asc",
  });
  assert.deepEqual(parseSortOption(""), {
    field: "name",
    direction: "asc",
  });
});

test("toSortOption converts field and direction to option string", () => {
  assert.equal(toSortOption("name", "asc"), "name-asc");
  assert.equal(toSortOption("name", "desc"), "name-desc");
  assert.equal(toSortOption("cert", "asc"), "cert-asc");
  assert.equal(toSortOption("cert", "desc"), "cert-desc");
  assert.equal(toSortOption("updatedAt", "desc"), "updatedAt-desc");
  assert.equal(toSortOption("updatedAt", "asc"), "updatedAt-asc");
  assert.equal(toSortOption("vendor", "asc"), "vendor-asc");
  assert.equal(toSortOption("vendor", "desc"), "vendor-desc");
});

test("sortManifests sorts alphabetically ascending by default", () => {
  const certs = [
    createManifest({ cert: "b-cert", name: "Beta Cert" }),
    createManifest({ cert: "a-cert", name: "Alpha Cert" }),
    createManifest({ cert: "c-cert", name: "Gamma Cert" }),
  ];

  const sorted = sortManifests(certs, "name", "asc");
  assert.deepEqual(
    sorted.map((c) => c.name),
    ["Alpha Cert", "Beta Cert", "Gamma Cert"],
  );
});

test("sortManifests sorts alphabetically descending", () => {
  const certs = [
    createManifest({ cert: "b-cert", name: "Beta Cert" }),
    createManifest({ cert: "a-cert", name: "Alpha Cert" }),
    createManifest({ cert: "c-cert", name: "Gamma Cert" }),
  ];

  const sorted = sortManifests(certs, "name", "desc");
  assert.deepEqual(
    sorted.map((c) => c.name),
    ["Gamma Cert", "Beta Cert", "Alpha Cert"],
  );
});

test("sortManifests sorts by cert code ascending", () => {
  const certs = [
    createManifest({ cert: "sc-900", name: "Security Fundamentals" }),
    createManifest({ cert: "ai-103", name: "Azure AI Apps" }),
    createManifest({ cert: "az-900", name: "Azure Fundamentals" }),
  ];

  const sorted = sortManifests(certs, "cert", "asc");
  assert.deepEqual(
    sorted.map((c) => c.cert),
    ["ai-103", "az-900", "sc-900"],
  );
});

test("sortManifests sorts by cert code descending", () => {
  const certs = [
    createManifest({ cert: "sc-900", name: "Security Fundamentals" }),
    createManifest({ cert: "ai-103", name: "Azure AI Apps" }),
    createManifest({ cert: "az-900", name: "Azure Fundamentals" }),
  ];

  const sorted = sortManifests(certs, "cert", "desc");
  assert.deepEqual(
    sorted.map((c) => c.cert),
    ["sc-900", "az-900", "ai-103"],
  );
});

test("sortManifests sorts by vendor ascending, with name as secondary sort", () => {
  const certs = [
    createManifest({
      cert: "c1",
      vendor: "Microsoft",
      name: "Azure Fundamentals",
    }),
    createManifest({
      cert: "c2",
      vendor: "Anthropic",
      name: "Claude Developer",
    }),
    createManifest({ cert: "c3", vendor: "AWS", name: "Cloud Practitioner" }),
    createManifest({
      cert: "c4",
      vendor: "Anthropic",
      name: "Claude Architect",
    }),
  ];

  const sorted = sortManifests(certs, "vendor", "asc");
  assert.deepEqual(
    sorted.map((c) => `${c.vendor}: ${c.name}`),
    [
      "Anthropic: Claude Architect",
      "Anthropic: Claude Developer",
      "AWS: Cloud Practitioner",
      "Microsoft: Azure Fundamentals",
    ],
  );
});

test("sortManifests sorts by vendor descending with secondary sort by name", () => {
  const certs = [
    createManifest({
      cert: "c1",
      vendor: "Microsoft",
      name: "Azure Fundamentals",
    }),
    createManifest({
      cert: "c2",
      vendor: "Anthropic",
      name: "Claude Developer",
    }),
    createManifest({
      cert: "c3",
      vendor: "Anthropic",
      name: "Claude Architect",
    }),
    createManifest({
      cert: "c4",
      vendor: "AWS",
      name: "Cloud Practitioner",
    }),
    createManifest({
      cert: "c5",
      vendor: "AWS",
      name: "AI Practitioner",
    }),
  ];

  const sorted = sortManifests(certs, "vendor", "desc");
  assert.deepEqual(
    sorted.map((c) => `${c.vendor}: ${c.name}`),
    [
      "Microsoft: Azure Fundamentals",
      "AWS: AI Practitioner",
      "AWS: Cloud Practitioner",
      "Anthropic: Claude Architect",
      "Anthropic: Claude Developer",
    ],
  );
});

test("sortManifests sorts by updatedAt descending (newest first)", () => {
  const certs = [
    createManifest({ cert: "c1", name: "Cert 1", updatedAt: "2026-05-01" }),
    createManifest({ cert: "c2", name: "Cert 2", updatedAt: "2026-10-14" }),
    createManifest({ cert: "c3", name: "Cert 3", updatedAt: "2026-08-15" }),
  ];

  const sorted = sortManifests(certs, "updatedAt", "desc");
  assert.deepEqual(
    sorted.map((c) => c.cert),
    ["c2", "c3", "c1"],
  );
});

test("sortManifests sorts by updatedAt ascending (oldest first)", () => {
  const certs = [
    createManifest({ cert: "c1", name: "Cert 1", updatedAt: "2026-05-01" }),
    createManifest({ cert: "c2", name: "Cert 2", updatedAt: "2026-10-14" }),
    createManifest({ cert: "c3", name: "Cert 3", updatedAt: "2026-08-15" }),
  ];

  const sorted = sortManifests(certs, "updatedAt", "asc");
  assert.deepEqual(
    sorted.map((c) => c.cert),
    ["c1", "c3", "c2"],
  );
});

test("sortManifests uses cert slug as secondary sort on tie", () => {
  const certs = [
    createManifest({
      cert: "z-slug",
      name: "Same Name",
      updatedAt: "2026-09-01",
    }),
    createManifest({
      cert: "a-slug",
      name: "Same Name",
      updatedAt: "2026-09-01",
    }),
  ];

  const sortedAsc = sortManifests(certs, "name", "asc");
  assert.deepEqual(
    sortedAsc.map((c) => c.cert),
    ["a-slug", "z-slug"],
  );
});
