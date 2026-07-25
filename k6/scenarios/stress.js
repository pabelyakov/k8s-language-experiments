import { envFloat, envInt, envMs } from '../lib/helpers.js';
import { runMixedIteration } from '../lib/traffic.js';
import { buildSummary, defaultThresholds } from '../lib/summary.js';

/**
 * Higher pressure with staged ramp.
 *
 *   k6 run -e BASE_URL=http://localhost:8080 k6/scenarios/stress.js
 *   k6 run -e VUS_MAX=200 -e BASE_URL=... k6/scenarios/stress.js
 */
const VUS_MAX = envInt('VUS_MAX', 200);

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: Math.max(20, Math.floor(VUS_MAX * 0.1)) },
        { duration: '2m', target: Math.max(50, Math.floor(VUS_MAX * 0.5)) },
        { duration: '3m', target: VUS_MAX },
        { duration: '3m', target: VUS_MAX },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: defaultThresholds({
    p95Ms: envMs('P95_MS', 800),
    failRate: envFloat('FAIL_RATE', 0.1),
    checksRate: envFloat('CHECKS_RATE', 0.9),
  }),
};

export default function () {
  runMixedIteration();
}

export function handleSummary(data) {
  return buildSummary(data);
}
