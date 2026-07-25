import { check, fail, sleep } from 'k6';
import { envFloat, envMs, parseJson, uniqueUserName } from '../lib/helpers.js';
import * as api from '../lib/endpoints.js';
import { buildSummary, defaultThresholds } from '../lib/summary.js';

/**
 * Tiny happy-path sanity check before a real load run.
 *
 *   k6 run k6/scenarios/smoke.js
 *   k6 run -e BASE_URL=http://localhost:8080 k6/scenarios/smoke.js
 */
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: defaultThresholds({
    p95Ms: envMs('P95_MS', 500),
    failRate: envFloat('FAIL_RATE', 0.01),
    checksRate: envFloat('CHECKS_RATE', 0.99),
  }),
};

export default function () {
  const health = api.health();
  if (
    !check(health, {
      'health status 200': (r) => r.status === 200,
      'health service beer-vote': (r) => parseJson(r)?.service === 'beer-vote',
    })
  ) {
    fail(`health failed: ${health.status} ${health.body}`);
  }

  const beers = api.listBeers();
  if (
    !check(beers, {
      'beers status 200': (r) => r.status === 200,
      'beers has 10 items': (r) => parseJson(r)?.items?.length === 10,
    })
  ) {
    fail(`beers failed: ${beers.status} ${beers.body}`);
  }

  const userRes = api.createUser(uniqueUserName());
  const user = parseJson(userRes);
  if (
    !check(userRes, {
      'create user 201': (r) => r.status === 201,
      'create user has id': () => Boolean(user?.id),
    })
  ) {
    fail(`create user failed: ${userRes.status} ${userRes.body}`);
  }

  const list = api.listUsers({ page: 1, pageSize: 20, sort: 'created_at', order: 'desc' });
  if (
    !check(list, {
      'list users 200': (r) => r.status === 200,
      'list users has items': (r) => Array.isArray(parseJson(r)?.items),
    })
  ) {
    fail(`list users failed: ${list.status} ${list.body}`);
  }

  const voteRes = api.createVote(user.id, 3);
  if (
    !check(voteRes, {
      'create vote 201': (r) => r.status === 201,
      'vote beer_id 3': (r) => parseJson(r)?.beer_id === 3,
    })
  ) {
    fail(`create vote failed: ${voteRes.status} ${voteRes.body}`);
  }

  const dup = api.createVote(user.id, 1, { case: 'duplicate' }, [409]);
  check(dup, {
    'duplicate vote 409': (r) => r.status === 409,
  });

  const results = api.getResults();
  if (
    !check(results, {
      'results 200': (r) => r.status === 200,
      'results has 10 beers': (r) => parseJson(r)?.results?.length === 10,
    })
  ) {
    fail(`results failed: ${results.status} ${results.body}`);
  }

  sleep(1);
}

export function handleSummary(data) {
  return buildSummary(data);
}
