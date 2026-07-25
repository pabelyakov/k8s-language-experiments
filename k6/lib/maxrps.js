import { envInt } from './helpers.js';

/**
 * Ramping arrival-rate profile to discover practical max RPS.
 *
 * Env:
 *   START_RATE      default 100   (req/s at first stage)
 *   MAX_RATE        default 10000
 *   STAGE_TIME      default 20s
 *   PRE_VUS         default 50
 *   MAX_VUS         default 500
 */
export function maxRpsScenario(execName = 'default') {
  const startRate = envInt('START_RATE', 100);
  const maxRate = envInt('MAX_RATE', 10000);
  const stageTime = __ENV.STAGE_TIME || '20s';
  const preVUs = envInt('PRE_VUS', 50);
  const maxVUs = envInt('MAX_VUS', 500);

  // Build ascending stages: start → 25% → 50% → 75% → 100% → hold at max
  const points = [
    startRate,
    Math.max(startRate, Math.floor(maxRate * 0.25)),
    Math.max(startRate, Math.floor(maxRate * 0.5)),
    Math.max(startRate, Math.floor(maxRate * 0.75)),
    maxRate,
    maxRate,
  ];

  // unique non-decreasing targets
  const stages = [];
  let prev = 0;
  for (const target of points) {
    const t = Math.max(prev, target);
    stages.push({ target: t, duration: stageTime });
    prev = t;
  }

  return {
    executor: 'ramping-arrival-rate',
    startRate,
    timeUnit: '1s',
    preAllocatedVUs: preVUs,
    maxVUs,
    stages,
    exec: execName,
  };
}
