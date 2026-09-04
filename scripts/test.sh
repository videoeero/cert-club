#!/usr/bin/env bash
# Run the full test suite: content validation + Node test runner.
# Suitable for CI and pre-push verification.
set -euo pipefail

cd "$(dirname "$0")/.."

validate_fail=0
test_fail=0

echo "== content validation: validate-content.mjs =="
npm run validate || validate_fail=1

echo
echo "== test runner: node --test =="
npm test || test_fail=1

if [ "$validate_fail" -ne 0 ] || [ "$test_fail" -ne 0 ]; then
  echo
  v_status=$([ "$validate_fail" -ne 0 ] && echo "FAIL" || echo "OK")
  t_status=$([ "$test_fail" -ne 0 ] && echo "FAIL" || echo "OK")
  echo "tests failed — validate ${v_status}, tests ${t_status}" >&2
  exit 1
fi
echo
echo "tests OK"
