#!/usr/bin/env bash
# Lint-only check: read-only verification that the codebase is formatted
# and free of lint errors. Exits non-zero on any failure. Suitable for CI
# and pre-commit hooks.
#
# To auto-fix locally: `npm run format` (prettier) and `node_modules/.bin/eslint --fix .`.
set -euo pipefail

cd "$(dirname "$0")/.."

fail=0

echo "== prettier --check =="
npm run format:check || {
  echo "FAIL: prettier --check" >&2
  fail=1
}

echo
echo "== eslint =="
npm run lint || {
  echo "FAIL: eslint" >&2
  fail=1
}

if [ "$fail" -ne 0 ]; then
  echo
  echo "lint failed — see output above" >&2
  exit 1
fi
echo
echo "lint OK"
