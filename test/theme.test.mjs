import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  applyTheme,
  getTheme,
  setTheme,
  THEME_STORAGE_KEY,
} from "../src/lib/theme.ts";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  setItem(key, value) {
    this.#values.set(key, value);
  }

  removeItem(key) {
    this.#values.delete(key);
  }
}

test("theme defaults to system when storage is empty or invalid", () => {
  const storage = new MemoryStorage();
  assert.equal(getTheme(storage), "system");

  storage.setItem("cert-club.theme", "invalid");
  assert.equal(getTheme(storage), "system");
});

test("round-trips light and dark theme choices", () => {
  const storage = new MemoryStorage();

  setTheme("dark", storage);
  assert.equal(getTheme(storage), "dark");
  assert.equal(storage.getItem("cert-club.theme"), "dark");

  setTheme("light", storage);
  assert.equal(getTheme(storage), "light");
  assert.equal(storage.getItem("cert-club.theme"), "light");

  setTheme("system", storage);
  assert.equal(getTheme(storage), "system");
  assert.equal(storage.getItem("cert-club.theme"), null);
});

test("applyTheme manages document dataset when document is present", () => {
  const fakeDoc = {
    documentElement: {
      dataset: {},
    },
  };
  globalThis.document = fakeDoc;

  applyTheme("dark");
  assert.equal(fakeDoc.documentElement.dataset.theme, "dark");

  applyTheme("light");
  assert.equal(fakeDoc.documentElement.dataset.theme, "light");

  applyTheme("system");
  assert.equal(fakeDoc.documentElement.dataset.theme, undefined);

  delete globalThis.document;
});

test("the theme storage key is identical in all three places that hard-code it", () => {
  const root = new URL("../", import.meta.url).pathname;
  const storage = readFileSync(join(root, "src/lib/storage.ts"), "utf8");
  const boot = readFileSync(join(root, "index.html"), "utf8");

  const inStorage = storage.match(/theme:\s*"([^"]+)"/)?.[1];
  const inBoot = boot.match(/localStorage\.getItem\("([^"]+)"\)/)?.[1];

  assert.equal(inStorage, THEME_STORAGE_KEY, "STORAGE_KEYS.theme has drifted");
  assert.equal(
    inBoot,
    THEME_STORAGE_KEY,
    "the index.html boot script has drifted",
  );
});
