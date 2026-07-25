import http from 'k6/http';
import { baseUrl, jsonHeaders, tagged } from './helpers.js';

function opts(endpoint, extraTags = {}, expectedStatuses) {
  const o = Object.assign({ headers: jsonHeaders() }, tagged(endpoint, extraTags));
  if (expectedStatuses && expectedStatuses.length) {
    o.responseCallback = http.expectedStatuses(...expectedStatuses);
  }
  return o;
}

export function health() {
  return http.get(`${baseUrl()}/health`, opts('health', {}, [200]));
}

export function listBeers() {
  return http.get(`${baseUrl()}/v1/beers`, opts('beers', {}, [200]));
}

export function createUser(name, expectedStatuses = [201]) {
  return http.post(
    `${baseUrl()}/v1/users`,
    JSON.stringify({ name }),
    opts('users_create', {}, expectedStatuses),
  );
}

export function listUsers(
  { page = 1, pageSize = 20, sort = 'created_at', order = 'desc' } = {},
  extraTags = {},
) {
  const qs = `page=${page}&page_size=${pageSize}&sort=${sort}&order=${order}`;
  return http.get(
    `${baseUrl()}/v1/users?${qs}`,
    opts('users_list', extraTags, [200]),
  );
}

export function createVote(userId, beerId, extraTags = {}, expectedStatuses = [201]) {
  return http.post(
    `${baseUrl()}/v1/votes`,
    JSON.stringify({ user_id: userId, beer_id: beerId }),
    opts('votes_create', extraTags, expectedStatuses),
  );
}

export function getResults() {
  return http.get(`${baseUrl()}/v1/results`, opts('results', {}, [200]));
}
