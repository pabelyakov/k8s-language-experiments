import { sleep } from 'k6';
import { abortIfServiceDown } from './abort.js';
import { envInt, parseJson, randomInt, uniqueUserName } from './helpers.js';
import * as api from './endpoints.js';

/**
 * Exact N iterations at approximate total FILL_RATE req/s.
 * Uses shared-iterations + per-VU sleep.
 */
export function fillOptions({ iterations, exec = 'default' }) {
  const vus = envInt('FILL_VUS', 5);
  return {
    executor: 'shared-iterations',
    vus,
    iterations,
    maxDuration: __ENV.FILL_MAX_DURATION || '48h',
    gracefulStop: '30s',
    exec,
  };
}

export function fillSleep() {
  const vus = envInt('FILL_VUS', 5);
  const rate = envInt('FILL_RATE', 50); // target total creates/s across VUs
  const delay = vus / Math.max(rate, 1);
  sleep(delay);
}

export function createUserOrAbort() {
  const res = api.createUser(uniqueUserName());
  abortIfServiceDown(res, 'fill createUser');
  const body = parseJson(res);
  if (res.status !== 201 || !body?.id) {
    // Non-transport errors: keep going unless it's a hard crash (already aborted on status 0)
    return null;
  }
  return body.id;
}

export function createUserAndVoteOrAbort() {
  const userId = createUserOrAbort();
  if (!userId) {
    fillSleep();
    return null;
  }
  const vote = api.createVote(userId, randomInt(1, 10));
  abortIfServiceDown(vote, 'fill createVote');
  fillSleep();
  return { userId, voteStatus: vote.status };
}
