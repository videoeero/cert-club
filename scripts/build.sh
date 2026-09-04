#!/usr/bin/env bash
# Build-only check: verifies the frontend produces a valid production bundle
# (catches failures tests don't — stricter tsc settings, tree-shaking,
# unresolved imports).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== frontend: build =="
npm run build

echo
echo "build OK"
