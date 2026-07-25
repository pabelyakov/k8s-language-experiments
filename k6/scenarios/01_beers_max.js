import { check } from 'k6';
import { maxRpsScenario } from '../lib/maxrps.js';
import * as api from '../lib/endpoints.js';
import { buildSummary } from '../lib/summary.js';

/**
 * 1) Max RPS on GET /v1/beers (baseline read).
 *
 *   k6 run k6/scenarios/01_beers_max.js
 *   k6 run -e BASE_URL=http://localhost:8080 -e MAX_RATE=15000 -e MAX_VUS=800 k6/scenarios/01_beers_max.js
 *
 * Aborts on first connection refused / transport error.
 */
export const options = {
  discardResponseBodies: true,
  scenarios: {
    beers_max: maxRpsScenario('hitBeers'),
  },
};

export function hitBeers() {
  const res = api.listBeers();
  check(res, { 'beers 200': (r) => r.status === 200 });
}

export function handleSummary(data) {
  return buildSummary(data);
}
