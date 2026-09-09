import assert from "node:assert/strict";
import test from "node:test";

import { parsePositiveInteger } from "../scripts/lib/cli.mjs";

test("reads a plain positive integer", () => {
  assert.equal(parsePositiveInteger("18"), 18);
  assert.equal(parsePositiveInteger("1"), 1);
  assert.equal(parsePositiveInteger(" 7 "), 7);
});

test("rejects a value with trailing junk rather than truncating it", () => {
  // Number.parseInt read these as 18, 10 and 45 — a typo became a plausible
  // value and the run continued with the wrong number.
  assert.equal(parsePositiveInteger("18questions"), null);
  assert.equal(parsePositiveInteger("10s"), null);
  assert.equal(parsePositiveInteger("45m"), null);
  assert.equal(parsePositiveInteger("40abc"), null);
});

test("rejects values outside a positive integer", () => {
  assert.equal(parsePositiveInteger("0"), null);
  assert.equal(parsePositiveInteger("-5"), null);
  assert.equal(parsePositiveInteger("2.5"), null);
  assert.equal(parsePositiveInteger(""), null);
});

test("rejects a missing argument instead of throwing", () => {
  assert.equal(parsePositiveInteger(undefined), null);
  assert.equal(parsePositiveInteger(null), null);
});
