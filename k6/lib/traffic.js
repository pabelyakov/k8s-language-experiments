import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import {
  parseJson,
  pickWeighted,
  randomChoice,
  randomInt,
  uniqueUserName,
} from './helpers.js';
import * as api from './endpoints.js';

export const usersCreated = new Counter('users_created');
export const votesOk = new Counter('votes_ok');
export const votesConflict = new Counter('votes_conflict');
export const edgeCases = new Counter('edge_cases');

const SORTS = ['name', 'created_at', 'id'];
const ORDERS = ['asc', 'desc'];
const PAGE_SIZES = [10, 20, 50];

/**
 * Shared traffic mix for load / stress / spike.
 *
 * Weights (~100):
 *  35 create user → vote
 *  20 results
 *  15 list users (normal)
 *  10 beers
 *   5 health
 *  10 edge / negative
 *   5 heavy list (page_size=100, sort=name)
 */
export function runMixedIteration() {
  const action = pickWeighted([
    { name: 'create_and_vote', weight: 35, run: createAndVote },
    { name: 'results', weight: 20, run: readResults },
    { name: 'list_users', weight: 15, run: listUsersNormal },
    { name: 'beers', weight: 10, run: readBeers },
    { name: 'health', weight: 5, run: readHealth },
    { name: 'edge', weight: 10, run: edgeTraffic },
    { name: 'list_heavy', weight: 5, run: listUsersHeavy },
  ]);

  action.run();
  sleep(Number(__ENV.SLEEP || 0.1));
}

function createAndVote() {
  const userRes = api.createUser(uniqueUserName());
  const user = parseJson(userRes);
  const created = check(userRes, {
    'create+vote: user 201': (r) => r.status === 201,
    'create+vote: user id': () => Boolean(user?.id),
  });
  if (!created || !user?.id) {
    return;
  }
  usersCreated.add(1);

  const beerId = randomInt(1, 10);
  const voteRes = api.createVote(user.id, beerId);
  if (
    check(voteRes, {
      'create+vote: vote 201': (r) => r.status === 201,
    })
  ) {
    votesOk.add(1);
  }
}

function readResults() {
  const res = api.getResults();
  check(res, {
    'results: 200': (r) => r.status === 200,
    'results: 10 beers': (r) => parseJson(r)?.results?.length === 10,
  });
}

function listUsersNormal() {
  const res = api.listUsers({
    page: randomInt(1, 5),
    pageSize: randomChoice(PAGE_SIZES),
    sort: randomChoice(SORTS),
    order: randomChoice(ORDERS),
  });
  check(res, {
    'list users: 200': (r) => r.status === 200,
    'list users: has items': (r) => Array.isArray(parseJson(r)?.items),
  });
}

function listUsersHeavy() {
  const res = api.listUsers(
    {
      page: 1,
      pageSize: 100,
      sort: 'name',
      order: 'asc',
    },
    { case: 'heavy' },
  );
  check(res, {
    'heavy list: 200': (r) => r.status === 200,
  });
}

function readBeers() {
  const res = api.listBeers();
  check(res, {
    'beers: 200': (r) => r.status === 200,
    'beers: 10 items': (r) => parseJson(r)?.items?.length === 10,
  });
}

function readHealth() {
  const res = api.health();
  check(res, {
    'health: 200': (r) => r.status === 200,
  });
}

function edgeTraffic() {
  const kind = randomChoice(['duplicate', 'unknown_user', 'bad_beer', 'empty_name']);
  edgeCases.add(1, { case: kind });

  if (kind === 'empty_name') {
    const res = api.createUser('', [400]);
    check(res, { 'edge empty name: 400': (r) => r.status === 400 });
    return;
  }

  if (kind === 'unknown_user') {
    const res = api.createVote(
      '00000000-0000-0000-0000-000000000000',
      3,
      { case: 'unknown_user' },
      [404],
    );
    check(res, { 'edge unknown user: 404': (r) => r.status === 404 });
    return;
  }

  // Need a real user for duplicate / bad_beer
  const userRes = api.createUser(uniqueUserName());
  const user = parseJson(userRes);
  if (userRes.status !== 201 || !user?.id) {
    return;
  }
  usersCreated.add(1);

  if (kind === 'bad_beer') {
    const res = api.createVote(user.id, 99, { case: 'bad_beer' }, [400]);
    check(res, { 'edge bad beer: 400': (r) => r.status === 400 });
    return;
  }

  // duplicate: first vote ok, second 409
  const first = api.createVote(user.id, randomInt(1, 10));
  if (first.status === 201) {
    votesOk.add(1);
  }
  const second = api.createVote(user.id, 1, { case: 'duplicate' }, [409]);
  if (
    check(second, {
      'edge duplicate: 409': (r) => r.status === 409,
    })
  ) {
    votesConflict.add(1);
  }
}
