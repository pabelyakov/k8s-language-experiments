import { envFloat, envInt, envMs } from '../lib/helpers.js';
import { runMixedIteration } from '../lib/traffic.js';
import { buildSummary, defaultThresholds } from '../lib/summary.js';

/**
 * Sudden spike then cool-down.
 *
 *   k6 run -e BASE_URL=http://localhost:8080 k6/scenarios/spike.js
 *   k6 run -e SPIKE_VUS=150 -e BASE_URL=... k6/scenarios/spike.js
 */
const BASE_VUS = envInt('BASE_VUS', 10);
const SPIKE_VUS = envInt('SPIKE_VUS', 150);

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: BASE_VUS },
        { duration: '30s', target: BASE_VUS },
        { duration: '20s', target: SPIKE_VUS },
        { duration: '2m', target: SPIKE_VUS },
        { duration: '30s', target: BASE_VUS },
        { duration: '1m', target: BASE_VUS },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '20s',
    },
  },
  thresholds: defaultThresholds({
    p95Ms: envMs('P95_MS', 1000),
    failRate: envFloat('FAIL_RATE', 0.15),
    checksRate: envFloat('CHECKS_RATE', 0.85),
  }),
};

export default function () {
  runMixedIteration();
}

export function handleSummary(data) {
  return buildSummary(data);
}
