import assert from "node:assert/strict";
import test from "node:test";

import { skillKey } from "../scripts/lib/skills.mjs";

test("keys a skill by its domain and its own slug", () => {
  assert.notEqual(
    skillKey("first", "overview"),
    skillKey("second", "overview"),
  );
  assert.equal(skillKey("first", "overview"), skillKey("first", "overview"));
});

test("cannot be collided by a slug that looks like a joined key", () => {
  // Slugs are lowercase alphanumerics and hyphens per the schema, so the NUL
  // separator can never appear inside one.
  assert.notEqual(skillKey("a", "b-c"), skillKey("a-b", "c"));
});
