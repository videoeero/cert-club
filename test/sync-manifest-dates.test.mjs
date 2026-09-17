import assert from "node:assert/strict";
import test from "node:test";

import {
  SyncDatesError,
  applyManifestUpdatedAt,
  deriveCertUpdatedDate,
  localCalendarDate,
  syncManifestDates,
} from "../scripts/sync-manifest-dates.mjs";

test("deriveCertUpdatedDate returns git author date when working tree is clean", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [
    { id: "q1", sourceCheckedAt: "2026-09-05" },
    { id: "q2", sourceCheckedAt: "2026-09-07" },
  ];
  const gitRunner = (args) => {
    if (args.includes("status")) return "";
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
  });
  assert.equal(date, "2026-09-08");
});

test("deriveCertUpdatedDate uses today when there are uncommitted working-tree changes", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-05" }];
  const gitRunner = (args) => {
    if (args.includes("status")) {
      return " M certs/test-cert/questions/domain.json\n";
    }
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
    today: "2026-09-15",
  });
  assert.equal(date, "2026-09-15");
});

test("deriveCertUpdatedDate parses unstaged porcelain status with leading space correctly", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [];
  const gitRunner = (args) => {
    if (args.includes("status")) {
      return " M certs/test-cert/questions/domain.json\n";
    }
    return "2026-09-08";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
    today: "2026-09-15",
  });
  assert.equal(date, "2026-09-15");
});

test("deriveCertUpdatedDate ignores uncommitted changes if only manifest.json is modified", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-05" }];
  const gitRunner = (args) => {
    if (args.includes("status")) {
      return " M certs/test-cert/manifest.json\n";
    }
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
    today: "2026-09-15",
  });
  assert.equal(date, "2026-09-08");
});

test("deriveCertUpdatedDate handles quoted paths in status output", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-05" }];
  const gitRunner = (args) => {
    if (args.includes("status")) {
      return ' M "certs/test-cert/manifest.json"\n';
    }
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
    today: "2026-09-15",
  });
  assert.equal(date, "2026-09-08");
});

test("deriveCertUpdatedDate treats other *-manifest.json files as uncommitted changes", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-05" }];
  const gitRunner = (args) => {
    if (args.includes("status")) {
      return "?? certs/test-cert/old-manifest.json\n";
    }
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
    today: "2026-09-15",
  });
  assert.equal(date, "2026-09-15");
});

test("deriveCertUpdatedDate elevates date if question sourceCheckedAt is newer than git", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-12" }];
  const gitRunner = (args) => {
    if (args.includes("status")) return "";
    if (args.includes("log")) return "2026-09-08";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
  });
  assert.equal(date, "2026-09-12");
});

test("deriveCertUpdatedDate falls back to manifest.updatedAt when git log is empty", () => {
  const manifest = { cert: "test-cert", updatedAt: "2026-09-04" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-02" }];
  const gitRunner = () => "";

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
  });
  assert.equal(date, "2026-09-04");
});

test("syncManifestDates passes in check mode when manifests are in sync", async () => {
  const fakeCatalog = { schemaVersion: 1, certs: ["test-cert"] };
  const fakeManifest = {
    schemaVersion: 1,
    cert: "test-cert",
    status: "draft",
    updatedAt: "2026-09-08",
  };
  const fakeQuestions = [{ id: "q1", sourceCheckedAt: "2026-09-01" }];

  await assert.doesNotReject(() =>
    syncManifestDates({
      check: true,
      readJsonFn: async (path) => {
        if (path.endsWith("catalog.json")) return fakeCatalog;
        return { ...fakeManifest };
      },
      readQuestionsFn: async () => fakeQuestions,
      gitRunner: (args) => {
        if (args.includes("status")) return "";
        if (args.includes("log")) return "2026-09-08";
        return "";
      },
    }),
  );
});

test("syncManifestDates rejects in check mode when manifest date is out of sync", async () => {
  const fakeCatalog = { schemaVersion: 1, certs: ["test-cert"] };
  const fakeManifest = {
    schemaVersion: 1,
    cert: "test-cert",
    status: "draft",
    updatedAt: "2026-09-01",
  };
  const fakeQuestions = [{ id: "q1", sourceCheckedAt: "2026-09-01" }];

  await assert.rejects(
    () =>
      syncManifestDates({
        check: true,
        readJsonFn: async (path) => {
          if (path.endsWith("catalog.json")) return fakeCatalog;
          return { ...fakeManifest };
        },
        readQuestionsFn: async () => fakeQuestions,
        gitRunner: (args) => {
          if (args.includes("status")) return "";
          if (args.includes("log")) return "2026-09-08";
          return "";
        },
      }),
    (error) => {
      assert(error instanceof SyncDatesError);
      assert.match(error.message, /out of sync/);
      return true;
    },
  );
});

test("syncManifestDates records previous and updated dates when writing updates", async () => {
  const written = [];
  const fakeCatalog = { schemaVersion: 1, certs: ["test-cert"] };
  const fakeManifest = {
    schemaVersion: 1,
    cert: "test-cert",
    updatedAt: "2026-09-01",
  };
  const fakeQuestions = [{ id: "q1", sourceCheckedAt: "2026-09-01" }];

  const updates = await syncManifestDates({
    check: false,
    readJsonFn: async (path) => {
      if (path.endsWith("catalog.json")) return fakeCatalog;
      return { ...fakeManifest };
    },
    readQuestionsFn: async () => fakeQuestions,
    writeJsonFn: async (path, content) => {
      written.push({ path, content });
    },
    gitRunner: (args) => {
      if (args.includes("status")) return "";
      if (args.includes("log")) return "2026-09-11";
      return "";
    },
  });

  assert.equal(updates.length, 1);
  assert.equal(updates[0].cert, "test-cert");
  assert.equal(updates[0].previous, "2026-09-01");
  assert.equal(updates[0].updated, "2026-09-11");
  assert.notEqual(updates[0].previous, updates[0].updated);
  assert.equal(written.length, 1);
  assert.match(written[0].content, /"updatedAt": "2026-09-11"/);
});

test("applyManifestUpdatedAt places updatedAt directly after status", () => {
  const manifestWithoutUpdatedAt = {
    schemaVersion: 1,
    cert: "test-cert",
    name: "Test Cert",
    status: "draft",
    examUrl: "https://example.com",
    contentLicense: "CC-BY-SA-4.0",
    domains: [],
  };

  const updated = applyManifestUpdatedAt(
    manifestWithoutUpdatedAt,
    "2026-09-11",
  );
  assert.equal(updated.updatedAt, "2026-09-11");
  const keys = Object.keys(updated);
  assert.equal(keys.indexOf("updatedAt"), keys.indexOf("status") + 1);
});

test("applyManifestUpdatedAt preserves position when updatedAt already exists", () => {
  const manifest = {
    schemaVersion: 1,
    cert: "test-cert",
    name: "Test Cert",
    status: "draft",
    updatedAt: "2026-09-01",
    examUrl: "https://example.com",
  };

  const updated = applyManifestUpdatedAt(manifest, "2026-09-11");
  assert.equal(updated.updatedAt, "2026-09-11");
  const keys = Object.keys(updated);
  assert.equal(keys.indexOf("updatedAt"), keys.indexOf("status") + 1);
});

test("SyncDatesError formats aggregate messages", () => {
  const error = new SyncDatesError(["first issue", "second issue"]);
  assert.equal(error.name, "SyncDatesError");
  assert.equal(error.messages.length, 2);
  assert.match(error.message, /first issue/);
});

test("localCalendarDate formats date as YYYY-MM-DD in local time", () => {
  const testDate = new Date(2026, 8, 5); // Sept 5, 2026
  assert.equal(localCalendarDate(testDate), "2026-09-05");
});

test("deriveCertUpdatedDate defaults today to localCalendarDate when uncommitted changes exist", (t) => {
  t.mock.timers.enable({
    apis: ["Date"],
    now: new Date("2026-09-12T12:00:00.000Z"),
  });
  const manifest = { cert: "test-cert", updatedAt: "2026-09-01" };
  const questions = [{ id: "q1", sourceCheckedAt: "2026-09-01" }];
  const gitRunner = (args) => {
    if (args.includes("status")) return " M certs/test-cert/questions/d1.json";
    return "";
  };

  const date = deriveCertUpdatedDate("test-cert", manifest, questions, {
    gitRunner,
  });
  assert.equal(date, localCalendarDate());
});
