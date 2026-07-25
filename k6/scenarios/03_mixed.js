import { envFloat, envInt, envMs } from '../lib/helpers.js';
import { runMixedIteration } from '../lib/traffic.js';
import { buildSummary, defaultThresholds } from '../lib/summary.js';

/**
 * 5) Mixed traffic across endpoints.
 *
 *   k6 run k6/scenarios/05_mixed.js
 *   k6 run -e VUS=50 -e DURATION=5m k6/scenarios/05_mixed.js
 *
 * Aborts on first connection refused (via lib/endpoints.js).
 */
const VUS = envInt('VUS', 50);
const DURATION = __ENV.DURATION || '5m';
const RAMP_UP = __ENV.RAMP_UP || '30s';
const RAMP_DOWN = __ENV.RAMP_DOWN || '30s';

export const options = {
  scenarios: {
    mixed_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: RAMP_DOWN, target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: defaultThresholds({
    p95Ms: envMs('P95_MS', 300),
    failRate: envFloat('FAIL_RATE', 0.05),
    checksRate: envFloat('CHECKS_RATE', 0.95),
  }),
};

export default function () {
  runMixedIteration();
}

export function handleSummary(data) {
  return buildSummary(data);
}
