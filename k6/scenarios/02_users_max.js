import { check } from 'k6';
import { maxRpsScenario } from '../lib/maxrps.js';
import { uniqueUserName } from '../lib/helpers.js';
import * as api from '../lib/endpoints.js';
import { buildSummary } from '../lib/summary.js';

/**
 * 2) Max RPS on POST /v1/users (in-memory writes).
 *
 *   k6 run k6/scenarios/02_users_max.js
 *   k6 run -e MAX_RATE=8000 -e MAX_VUS=600 k6/scenarios/02_users_max.js
 *
 * Aborts on first connection refused / transport error.
 */
export const options = {
  discardResponseBodies: true,
  scenarios: {
    users_max: maxRpsScenario('hitUsers'),
  },
};

export function hitUsers() {
  const res = api.createUser(uniqueUserName());
  check(res, { 'create user 201': (r) => r.status === 201 });
}

export function handleSummary(data) {
  return buildSummary(data);
}
