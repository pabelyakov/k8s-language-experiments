#!/usr/bin/env bash
# 3) Fill N users (low rate) → max RPS on POST /v1/votes
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BASE_URL="${BASE_URL:-http://localhost:8080}"
TARGET_USERS="${TARGET_USERS:-1000000}"
FILL_RATE="${FILL_RATE:-50}"
FILL_VUS="${FILL_VUS:-5}"
ID_FILE="${ID_FILE:-k6/data/user-ids.txt}"
DATA_DIR="$(dirname "$ID_FILE")"
UIDS_RAW="${DATA_DIR}/uids.raw"

mkdir -p "$DATA_DIR"

echo "==> [03a] filling ${TARGET_USERS} users at ~${FILL_RATE} rps (BASE_URL=${BASE_URL})"
echo "    IDs → ${ID_FILE}"

# console.log(UID=...) goes to --console-output (plain), not mixed with summary
k6 run \
  --console-output="${UIDS_RAW}" \
  -e "BASE_URL=${BASE_URL}" \
  -e "TARGET_USERS=${TARGET_USERS}" \
  -e "FILL_RATE=${FILL_RATE}" \
  -e "FILL_VUS=${FILL_VUS}" \
  k6/scenarios/03a_fill_users.js

grep -oE 'UID=[0-9a-fA-F-]+' "${UIDS_RAW}" | sed 's/^UID=//' > "${ID_FILE}"

COUNT="$(wc -l < "${ID_FILE}" | tr -d ' ')"
echo "==> captured ${COUNT} user ids"

if [[ "${COUNT}" -lt 1 ]]; then
  echo "ERROR: no user ids captured. See ${UIDS_RAW}" >&2
  exit 1
fi

echo "==> [03b] max RPS on /v1/votes"
k6 run \
  -e "BASE_URL=${BASE_URL}" \
  -e "ID_FILE=${ID_FILE}" \
  -e "START_RATE=${START_RATE:-100}" \
  -e "MAX_RATE=${MAX_RATE:-10000}" \
  -e "MAX_VUS=${MAX_VUS:-500}" \
  -e "STAGE_TIME=${STAGE_TIME:-20s}" \
  k6/scenarios/03b_votes_max.js
