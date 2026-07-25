#!/usr/bin/env bash
# 4) Fill N users+votes (low rate) → max RPS on GET /v1/results
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BASE_URL="${BASE_URL:-http://localhost:8080}"
TARGET_USERS="${TARGET_USERS:-10000000}"
FILL_RATE="${FILL_RATE:-40}"
FILL_VUS="${FILL_VUS:-5}"

echo "==> [04a] filling ${TARGET_USERS} users+votes at ~${FILL_RATE} rps (BASE_URL=${BASE_URL})"
k6 run \
  -e "BASE_URL=${BASE_URL}" \
  -e "TARGET_USERS=${TARGET_USERS}" \
  -e "FILL_RATE=${FILL_RATE}" \
  -e "FILL_VUS=${FILL_VUS}" \
  k6/scenarios/04a_fill_users_votes.js

echo "==> [04b] max RPS on /v1/results"
k6 run \
  -e "BASE_URL=${BASE_URL}" \
  -e "START_RATE=${START_RATE:-100}" \
  -e "MAX_RATE=${MAX_RATE:-10000}" \
  -e "MAX_VUS=${MAX_VUS:-500}" \
  -e "STAGE_TIME=${STAGE_TIME:-20s}" \
  k6/scenarios/04b_results_max.js
