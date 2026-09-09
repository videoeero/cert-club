import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ContentValidationError } from "../scripts/lib/errors.mjs";
import {
  listCertFolders,
  readCertQuestions,
  readJson,
} from "../scripts/lib/read-certs.mjs";

/**
 * These helpers read the filesystem, so the fixtures are built in a temp tree
 * rather than under test/fixtures/ — a dot-file fixture cannot be committed
 * reliably, and what gets skipped is the point of several of these cases.
 */
async function withTempTree(build) {
  const root = await mkdtemp(join(tmpdir(), "cert-club-read-certs-"));
  try {
    return await build(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeQuestions(certPath, files) {
  await mkdir(join(certPath, "questions"), { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    await writeFile(
      join(certPath, "questions", name),
      typeof contents === "string" ? contents : JSON.stringify(contents),
    );
  }
}

test("reads and parses a JSON file", async () => {
  await withTempTree(async (root) => {
    const path = join(root, "manifest.json");
    await writeFile(path, JSON.stringify({ cert: "demo-cert" }));
    assert.deepEqual(await readJson(path), { cert: "demo-cert" });
  });
});

test("names the missing file when a read fails", async () => {
  await withTempTree(async (root) => {
    const path = join(root, "absent.json");
    await assert.rejects(readJson(path), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /absent\.json: ENOENT/);
      return true;
    });
  });
});

test("names the file and the reason when JSON is malformed", async () => {
  await withTempTree(async (root) => {
    const path = join(root, "broken.json");
    await writeFile(path, "{ not json");
    await assert.rejects(readJson(path), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /broken\.json: invalid JSON \(/);
      return true;
    });
  });
});

test("flattens every question file in filename order", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "beta.json": [{ id: "b1" }],
      "alpha.json": [{ id: "a1" }, { id: "a2" }],
    });

    const questions = await readCertQuestions(certPath);
    assert.deepEqual(
      questions.map((question) => question.id),
      ["a1", "a2", "b1"],
    );
  });
});

test("ignores dot-files sitting beside the question banks", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": [{ id: "a1" }],
      // An AppleDouble sibling: plausible filename, not JSON at all.
      "._alpha.json": " not json",
    });

    const questions = await readCertQuestions(certPath);
    assert.deepEqual(
      questions.map((question) => question.id),
      ["a1"],
    );
  });
});

test("skips files that are not JSON", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": [{ id: "a1" }],
      "notes.md": "working notes",
    });

    const questions = await readCertQuestions(certPath);
    assert.deepEqual(
      questions.map((question) => question.id),
      ["a1"],
    );
  });
});

test("reports every malformed question file in one error", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": "{ broken",
      "beta.json": [{ id: "b1" }],
      "gamma.json": "also broken",
    });

    await assert.rejects(readCertQuestions(certPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.equal(error.messages.length, 2);
      assert.match(error.message, /alpha\.json: invalid JSON/);
      assert.match(error.message, /gamma\.json: invalid JSON/);
      return true;
    });
  });
});

test("rejects a question file holding a lone question instead of a bank", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": { id: "a1" },
    });

    await assert.rejects(readCertQuestions(certPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /alpha\.json: expected a JSON array/);
      return true;
    });
  });
});

test("rejects a question file holding null rather than passing it on", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": [{ id: "a1" }],
      "beta.json": "null",
    });

    await assert.rejects(readCertQuestions(certPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /beta\.json: expected a JSON array/);
      return true;
    });
  });
});

test("reports malformed and wrongly-shaped files together", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await writeQuestions(certPath, {
      "alpha.json": "{ broken",
      "beta.json": { id: "b1" },
    });

    await assert.rejects(readCertQuestions(certPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.equal(error.messages.length, 2);
      assert.match(error.message, /alpha\.json: invalid JSON/);
      assert.match(error.message, /beta\.json: expected a JSON array/);
      return true;
    });
  });
});

test("names the questions directory when it is missing", async () => {
  await withTempTree(async (root) => {
    const certPath = join(root, "demo-cert");
    await mkdir(certPath, { recursive: true });
    await assert.rejects(readCertQuestions(certPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /questions: ENOENT/);
      return true;
    });
  });
});

test("lists cert folders in sorted order, skipping dot-directories", async () => {
  await withTempTree(async (root) => {
    const certsPath = join(root, "certs");
    for (const name of ["zeta-cert", "alpha-cert", ".localtool"]) {
      await mkdir(join(certsPath, name), { recursive: true });
    }
    await writeFile(join(certsPath, "catalog.json"), "{}");

    assert.deepEqual(await listCertFolders(certsPath), [
      "alpha-cert",
      "zeta-cert",
    ]);
  });
});

test("names the certs directory when it cannot be listed", async () => {
  await withTempTree(async (root) => {
    const certsPath = join(root, "certs");
    await assert.rejects(listCertFolders(certsPath), (error) => {
      assert.ok(error instanceof ContentValidationError);
      assert.match(error.message, /certs: ENOENT/);
      return true;
    });
  });
});
