import { envFloat, envInt, envMs } from '../lib/helpers.js';
import { runMixedIteration } from '../lib/traffic.js';
import { buildSummary, defaultThresholds } from '../lib/summary.js';

/**
 * Main meetup load profile — mixed traffic across all endpoints.
 *
 *   k6 run k6/scenarios/load.js
 *   k6 run -e BASE_URL=http://localhost:8080 -e VUS=50 -e DURATION=5m k6/scenarios/load.js
 *
 * Env:
 *   BASE_URL   default http://localhost:8080
 *   VUS        default 50
 *   DURATION   default 5m  (sustain)
 *   RAMP_UP    default 30s
 *   RAMP_DOWN  default 30s
 *   SLEEP      default 0.1 (seconds between iterations)
 *   P95_MS     default 300
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
