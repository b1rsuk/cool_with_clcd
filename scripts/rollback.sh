#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PREV="$(cat .deploy_state/previous 2>/dev/null || true)"
[ -n "$PREV" ] || { echo "No previous version recorded"; exit 1; }
echo ">> Manual rollback to $PREV"
./scripts/deploy.sh "$PREV"
