#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

NEW_TAG="${1:?Usage: deploy.sh <image-tag>}"
STATE_DIR=".deploy_state"
mkdir -p "$STATE_DIR"
PREV_TAG="$(cat "$STATE_DIR/current" 2>/dev/null || true)"

wait_healthy() {
  for _ in $(seq 1 20); do
    status="$(docker inspect -f '{{.State.Health.Status}}' converter 2>/dev/null || echo none)"
    [ "$status" = "healthy" ] && return 0
    sleep 3
  done
  return 1
}

echo ">> Deploying tag: $NEW_TAG (previous: ${PREV_TAG:-none})"
export IMAGE_TAG="$NEW_TAG"
docker compose pull
docker compose up -d --remove-orphans

if wait_healthy; then
  echo "$NEW_TAG" > "$STATE_DIR/current"
  [ -n "$PREV_TAG" ] && echo "$PREV_TAG" > "$STATE_DIR/previous"
  echo ">> Deploy OK"
  docker image prune -f >/dev/null
  exit 0
fi

echo "!! New version is unhealthy" >&2
docker compose logs --tail=30 app >&2 || true

if [ -n "$PREV_TAG" ]; then
  echo ">> ROLLBACK to $PREV_TAG"
  export IMAGE_TAG="$PREV_TAG"
  docker compose up -d
  wait_healthy && echo ">> Rollback OK" || echo "!! Rollback is unhealthy too" >&2
else
  echo "!! No previous version to roll back to" >&2
fi
exit 1
