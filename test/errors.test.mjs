import assert from "node:assert/strict";
import test from "node:test";

import {
  AggregateMessageError,
  ContentValidationError,
} from "../scripts/lib/errors.mjs";

test("lists every message as a bullet under the headline", () => {
  const error = new AggregateMessageError("Something failed:", [
    "first problem",
    "second problem",
  ]);

  assert.equal(
    error.message,
    "Something failed:\n- first problem\n- second problem",
  );
});

test("leaves the headline alone when there are no messages", () => {
  const error = new AggregateMessageError("Something failed:");

  assert.equal(error.message, "Something failed:");
  assert.deepEqual(error.messages, []);
});

test("exposes the messages for callers that re-aggregate them", () => {
  const error = new AggregateMessageError("Something failed:", [
    "only problem",
  ]);

  assert.deepEqual(error.messages, ["only problem"]);
});

test("copies the messages so a caller cannot mutate them afterwards", () => {
  const input = ["first problem"];
  const error = new AggregateMessageError("Something failed:", input);
  input.push("added later");

  assert.deepEqual(error.messages, ["first problem"]);
});

test("is catchable as an Error", () => {
  const error = new AggregateMessageError("Something failed:", ["problem"]);

  assert.ok(error instanceof Error);
  assert.equal(error.name, "AggregateMessageError");
});

test("reports content validation failures under their own name", () => {
  const error = new ContentValidationError(["bad field"]);

  assert.ok(error instanceof AggregateMessageError);
  assert.equal(error.name, "ContentValidationError");
  assert.equal(error.message, "Content validation failed:\n- bad field");
});
