import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url).pathname;
const TOKENS = join(SRC, "styles/tokens.css");
const THEMES = join(SRC, "styles/themes.css");

function cssFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const files = cssFiles(SRC);
const read = (path) => readFileSync(path, "utf8");

function declaredIn(source) {
  return new Set(
    [...source.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
  );
}

test("every token referenced is defined in tokens.css or themes.css", () => {
  const defined = new Set([
    ...declaredIn(read(TOKENS)),
    ...declaredIn(read(THEMES)),
  ]);

  const missing = new Map();
  for (const file of files) {
    for (const [, name] of read(file).matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
      if (!defined.has(name)) {
        missing.set(name, (missing.get(name) ?? new Set()).add(file));
      }
    }
  }

  assert.deepEqual(
    [...missing.keys()],
    [],
    `undefined tokens referenced: ${[...missing]
      .map(([name, where]) => `${name} (${[...where].join(", ")})`)
      .join("; ")}`,
  );
});

test("colour literals appear only in themes.css", () => {
  // `transparent` and `currentColor` are keywords, not literals; #-hex,
  // rgb()/rgba() and hsl()/hsla() are the forms that hard-code a theme.
  const literal = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;
  const offenders = [];

  for (const file of files) {
    if (file === THEMES) continue;
    for (const [index, line] of read(file).split("\n").entries()) {
      if (literal.test(line))
        offenders.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `colour literals outside themes.css:\n${offenders.join("\n")}`,
  );
});

test("every theme block declares the identical set of seeds", () => {
  // CSS cannot share a declaration body between a media query and a selector,
  // so the two dark blocks are duplicated by necessity. That duplication is
  // exactly what rots silently, hence this check.
  const source = read(THEMES);
  const blocks = [...source.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);

  assert.ok(blocks.length >= 3, "expected at least three theme blocks");

  const reference = [...declaredIn(blocks[0])].sort();
  for (const [index, block] of blocks.entries()) {
    assert.deepEqual(
      [...declaredIn(block)].sort(),
      reference,
      `theme block #${index + 1} declares a different set of properties`,
    );
  }
});

test("the two dark blocks declare identical values", () => {
  const source = read(THEMES);
  const blocks = [...source.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);
  const normalise = (block) =>
    [...block.matchAll(/^\s*(--[a-z0-9-]+\s*:[^;]+);/gm)]
      .map((m) => m[1].replace(/\s+/g, " ").trim())
      .sort();

  const [systemDark, forcedDark] = [blocks.at(-2), blocks.at(-1)];
  assert.deepEqual(
    normalise(systemDark),
    normalise(forcedDark),
    "the prefers-color-scheme block and the [data-theme='dark'] block have drifted",
  );
});
