import assert from "node:assert/strict";
import test from "node:test";

import {
  UNRELIABILITY_NOTE,
  assessStaleness,
  buildOfflineReport,
  checkLiveness,
  groupSourcesByUrl,
} from "../scripts/check-sources.mjs";

function question(overrides = {}) {
  return {
    id: "demo-1",
    cert: "demo",
    sourceUrl: "https://example.com/docs/page",
    sourceCheckedAt: "2026-01-01",
    ...overrides,
  };
}

test("groupSourcesByUrl treats anchored citations as one page", () => {
  const base = "https://example.com/docs/page";
  const questions = [
    question({
      id: "a",
      sourceUrl: `${base}#first`,
      sourceCheckedAt: "2026-02-01",
    }),
    question({
      id: "b",
      sourceUrl: `${base}#second`,
      sourceCheckedAt: "2026-01-10",
    }),
    question({ id: "c", sourceUrl: base, sourceCheckedAt: "2026-03-01" }),
  ];

  const grouped = groupSourcesByUrl(questions);

  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].url, base);
  assert.equal(grouped[0].questionCount, 3);
  assert.equal(grouped[0].oldestCheckedAt, "2026-01-10");
  // The anchors are kept so an author can still find the cited section.
  assert.deepEqual(grouped[0].citedUrls, [
    base,
    `${base}#first`,
    `${base}#second`,
  ]);
});

test("groupSourcesByUrl dedupes by sourceUrl and preserves the oldest date", () => {
  const questions = [
    question({ id: "a", sourceCheckedAt: "2026-03-01" }),
    question({ id: "b", sourceCheckedAt: "2026-01-15" }),
    question({
      id: "c",
      sourceUrl: "https://example.com/docs/other",
      sourceCheckedAt: "2026-02-01",
    }),
  ];

  const grouped = groupSourcesByUrl(questions);

  assert.equal(grouped.length, 2);
  const page = grouped.find(
    (source) => source.url === "https://example.com/docs/page",
  );
  assert.equal(page.oldestCheckedAt, "2026-01-15");
  assert.equal(page.newestCheckedAt, "2026-03-01");
  assert.equal(page.questionCount, 2);

  const other = grouped.find(
    (source) => source.url === "https://example.com/docs/other",
  );
  assert.equal(other.oldestCheckedAt, "2026-02-01");
  assert.equal(other.questionCount, 1);
});

test("assessStaleness computes age against an injected today", () => {
  const sources = [
    { url: "https://example.com/a", oldestCheckedAt: "2026-01-01" },
  ];

  const [result] = assessStaleness(sources, {
    today: new Date("2026-01-31T00:00:00.000Z"),
    maxAgeDays: 180,
  });

  assert.equal(result.ageDays, 30);
  assert.equal(result.stale, false);
});

test("staleness is not flagged exactly at the max-age boundary", () => {
  const sources = [
    { url: "https://example.com/a", oldestCheckedAt: "2026-01-01" },
  ];

  // 2026-01-01 + 180 days is 2026-06-30.
  const [atBoundary] = assessStaleness(sources, {
    today: new Date("2026-06-30T00:00:00.000Z"),
    maxAgeDays: 180,
  });
  assert.equal(atBoundary.ageDays, 180);
  assert.equal(atBoundary.stale, false);

  const [pastBoundary] = assessStaleness(sources, {
    today: new Date("2026-07-01T00:00:00.000Z"),
    maxAgeDays: 180,
  });
  assert.equal(pastBoundary.ageDays, 181);
  assert.equal(pastBoundary.stale, true);
});

test("buildOfflineReport includes the manifest examUrl alongside grouped sources", () => {
  const manifest = { cert: "demo", examUrl: "https://example.com/exam-guide" };
  const questions = [question()];

  const report = buildOfflineReport(manifest, questions, {
    today: new Date("2026-01-01T00:00:00.000Z"),
    maxAgeDays: 180,
  });

  assert.equal(report.cert, "demo");
  assert.equal(report.examUrl, "https://example.com/exam-guide");
  assert.equal(report.sources.length, 1);
  assert.equal(report.staleCount, 0);
});

function fakeResponse({ ok, status, url, redirected = false }) {
  return { ok, status, url, redirected };
}

test("checkLiveness classifies a plain 200 as ok", async () => {
  const fetcher = async (url) => fakeResponse({ ok: true, status: 200, url });

  const [result] = await checkLiveness(["https://example.com/ok"], {
    fetcher,
  });

  assert.equal(result.status, "ok");
  assert.equal(result.finalUrl, "https://example.com/ok");
});

test("checkLiveness does not call an anchored citation a redirect", async () => {
  // fetch strips the fragment from Response.url, so the requested and final
  // URLs differ as strings without anything having moved.
  const url = "https://example.com/docs/page#a-section";
  const fetcher = async () =>
    fakeResponse({
      ok: true,
      status: 200,
      url: "https://example.com/docs/page",
      redirected: false,
    });

  const [result] = await checkLiveness([url], { fetcher });

  assert.equal(result.status, "ok");
});

test("checkLiveness reports a redirect landing on 200 with the final URL", async () => {
  const fetcher = async () =>
    fakeResponse({
      ok: true,
      status: 200,
      url: "https://example.com/new-path",
      redirected: true,
    });

  const [result] = await checkLiveness(["https://example.com/old-path"], {
    fetcher,
  });

  assert.equal(result.status, "redirected");
  assert.equal(result.finalUrl, "https://example.com/new-path");
});

test("checkLiveness surfaces a 404 as unconfirmed, never dead", async () => {
  const fetcher = async (url) => fakeResponse({ ok: false, status: 404, url });

  const [result] = await checkLiveness(["https://example.com/missing"], {
    fetcher,
  });

  assert.equal(result.status, "client-error");
  assert.notEqual(result.status, "dead");
  assert.ok(!JSON.stringify(result).includes("dead"));
});

test("checkLiveness classifies a server error", async () => {
  const fetcher = async (url) => fakeResponse({ ok: false, status: 503, url });

  const [result] = await checkLiveness(["https://example.com/down"], {
    fetcher,
  });

  assert.equal(result.status, "server-error");
});

test("checkLiveness falls back to GET when HEAD returns 405", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push(init.method);
    if (init.method === "HEAD") {
      return fakeResponse({ ok: false, status: 405, url });
    }
    return fakeResponse({ ok: true, status: 200, url });
  };

  const [result] = await checkLiveness(["https://example.com/head-blocked"], {
    fetcher,
  });

  assert.deepEqual(calls, ["HEAD", "GET"]);
  assert.equal(result.status, "ok");
});

test("checkLiveness classifies an aborted request as a timeout", async () => {
  const fetcher = async () => {
    const error = new Error("The operation was aborted");
    error.name = "TimeoutError";
    throw error;
  };

  const [result] = await checkLiveness(["https://example.com/slow"], {
    fetcher,
  });

  assert.equal(result.status, "timeout");
});

test("checkLiveness classifies a thrown network failure distinctly from a timeout", async () => {
  const fetcher = async () => {
    throw new Error("getaddrinfo ENOTFOUND example.com");
  };

  const [result] = await checkLiveness(["https://example.com/unreachable"], {
    fetcher,
  });

  assert.equal(result.status, "network-error");
});

test("checkLiveness bounds concurrency to the requested limit", async () => {
  const concurrency = 2;
  let inFlight = 0;
  let maxObserved = 0;

  const fetcher = async (url) => {
    inFlight += 1;
    maxObserved = Math.max(maxObserved, inFlight);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 5));
    inFlight -= 1;
    return fakeResponse({ ok: true, status: 200, url });
  };

  const urls = Array.from(
    { length: 8 },
    (_, index) => `https://example.com/${index}`,
  );
  await checkLiveness(urls, { fetcher, concurrency });

  assert.ok(
    maxObserved <= concurrency,
    `expected at most ${concurrency} in flight, observed ${maxObserved}`,
  );
  assert.ok(maxObserved > 1, "expected some overlap given a positive delay");
});

test("checkLiveness resolves every URL, preserving input order", async () => {
  const fetcher = async (url) => fakeResponse({ ok: true, status: 200, url });
  const urls = [
    "https://example.com/a",
    "https://example.com/b",
    "https://example.com/c",
  ];

  const results = await checkLiveness(urls, { fetcher, concurrency: 2 });

  assert.deepEqual(
    results.map((result) => result.url),
    urls,
  );
});

test("the unreliability note points at the recorded false-404 precedent", () => {
  assert.match(UNRELIABILITY_NOTE, /ccdv-f\/review-progress\.md/);
  assert.match(UNRELIABILITY_NOTE, /unconfirmed/i);
});

test("retries with GET on the statuses hosts reject HEAD with", async () => {
  // A false "this citation is gone" is the one error this tool must not make.
  for (const headStatus of [403, 404, 405, 501]) {
    const seen = [];
    const fetcher = async (url, init) => {
      seen.push(init.method);
      return init.method === "HEAD"
        ? fakeResponse({ ok: false, status: headStatus, url })
        : fakeResponse({ ok: true, status: 200, url });
    };

    const [result] = await checkLiveness(["https://example.com/p"], {
      fetcher,
    });

    assert.deepEqual(seen, ["HEAD", "GET"], `status ${headStatus}`);
    assert.equal(result.status, "ok", `status ${headStatus}`);
  }
});

test("keeps a genuine failure unconfirmed when GET also fails", async () => {
  const fetcher = async (url) => fakeResponse({ ok: false, status: 404, url });

  const [result] = await checkLiveness(["https://example.com/gone"], {
    fetcher,
  });

  assert.equal(result.status, "client-error");
  assert.notEqual(result.status, "dead");
});

test("survives a fetcher that rejects with something other than an Error", async () => {
  // fetcher is injectable, so a rejection can carry anything a caller throws.
  const fetcher = async () => {
    throw "connection reset";
  };

  const [result] = await checkLiveness(["https://example.com/p"], { fetcher });

  assert.equal(result.status, "network-error");
  assert.equal(result.detail, "connection reset");
});
