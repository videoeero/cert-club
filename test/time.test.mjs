import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCalendarDate,
  formatRemainingTime,
  formatUsedTime,
} from "../src/lib/time.ts";

test("formatCalendarDate formats ISO date strings in en-US short format", () => {
  assert.equal(formatCalendarDate("2026-09-07"), "Sep 7, 2026");
  assert.equal(formatCalendarDate("2026-09-11"), "Sep 11, 2026");
  assert.equal(formatCalendarDate("2026-01-01"), "Jan 1, 2026");
  assert.equal(formatCalendarDate("2026-12-31"), "Dec 31, 2026");
});

test("formatCalendarDate handles leap years correctly", () => {
  assert.equal(formatCalendarDate("2024-02-29"), "Feb 29, 2024");
});

test("formatCalendarDate returns unparsable input untouched", () => {
  assert.equal(formatCalendarDate("not-a-date"), "not-a-date");
  assert.equal(formatCalendarDate(""), "");
  assert.equal(formatCalendarDate("2026-09"), "2026-09");
  assert.equal(formatCalendarDate("2026-09-07e0"), "2026-09-07e0");
  assert.equal(formatCalendarDate(" 2026 - 09 - 07 "), " 2026 - 09 - 07 ");
  assert.equal(formatCalendarDate("+2026-09-07"), "+2026-09-07");
  assert.equal(formatCalendarDate("2026-9-7"), "2026-9-7");
});

test("formatCalendarDate rejects extreme out-of-bounds dates without throwing", () => {
  assert.equal(formatCalendarDate("100000000-01-01"), "100000000-01-01");
});

test("formatCalendarDate rejects rollover dates without shifting to next month", () => {
  assert.equal(formatCalendarDate("2026-02-31"), "2026-02-31");
  assert.equal(formatCalendarDate("2026-04-31"), "2026-04-31");
  assert.equal(formatCalendarDate("2026-13-01"), "2026-13-01");
});

test("formatRemainingTime formats mm:ss and h:mm:ss", () => {
  assert.equal(formatRemainingTime(65), "01:05");
  assert.equal(formatRemainingTime(3665), "1:01:05");
  assert.equal(formatRemainingTime(-10), "00:00");
});

test("formatUsedTime formats elapsed duration", () => {
  assert.equal(
    formatUsedTime("2026-09-07T10:00:00.000Z", "2026-09-07T11:23:45.000Z"),
    "1h 23m 45s",
  );
  assert.equal(
    formatUsedTime("2026-09-07T10:00:00.000Z", "2026-09-07T10:00:00.500Z"),
    "< 1s",
  );
});
