import http from 'k6/http';
import { abortIfServiceDown } from './abort.js';
import { baseUrl, jsonHeaders, tagged } from './helpers.js';

function opts(endpoint, extraTags = {}, expectedStatuses) {
  const o = Object.assign({ headers: jsonHeaders() }, tagged(endpoint, extraTags));
  if (expectedStatuses && expectedStatuses.length) {
    o.responseCallback = http.expectedStatuses(...expectedStatuses);
  }
  return o;
}

function wrap(res, context) {
  abortIfServiceDown(res, context);
  return res;
}

export function health() {
  return wrap(http.get(`${baseUrl()}/health`, opts('health', {}, [200])), 'GET /health');
}

export function listBeers() {
  return wrap(http.get(`${baseUrl()}/v1/beers`, opts('beers', {}, [200])), 'GET /v1/beers');
}

export function createUser(name, expectedStatuses = [201]) {
  return wrap(
    http.post(
      `${baseUrl()}/v1/users`,
      JSON.stringify({ name }),
      opts('users_create', {}, expectedStatuses),
    ),
    'POST /v1/users',
  );
}

export function listUsers(
  { page = 1, pageSize = 20, sort = 'created_at', order = 'desc' } = {},
  extraTags = {},
) {
  const qs = `page=${page}&page_size=${pageSize}&sort=${sort}&order=${order}`;
  return wrap(
    http.get(`${baseUrl()}/v1/users?${qs}`, opts('users_list', extraTags, [200])),
    'GET /v1/users',
  );
}

export function createVote(userId, beerId, extraTags = {}, expectedStatuses = [201]) {
  return wrap(
    http.post(
      `${baseUrl()}/v1/votes`,
      JSON.stringify({ user_id: userId, beer_id: beerId }),
      opts('votes_create', extraTags, expectedStatuses),
    ),
    'POST /v1/votes',
  );
}

export function getResults() {
  return wrap(
    http.get(`${baseUrl()}/v1/results`, opts('results', {}, [200])),
    'GET /v1/results',
  );
}
