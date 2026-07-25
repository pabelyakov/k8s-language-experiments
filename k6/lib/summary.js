import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

export function buildSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

export function defaultThresholds({ p95Ms = 300, failRate = 0.01, checksRate = 0.99 } = {}) {
  return {
    checks: [`rate>${checksRate}`],
    // Intentional 4xx in edge traffic are tagged expected_status!=2xx via separate checks;
    // http_req_failed counts non-2xx. Keep threshold loose enough or exclude via scenario design.
    // We treat only unexpected failures via checks; allow some http_req_failed for negative cases.
    http_req_failed: [`rate<${Math.max(failRate, 0.15)}`],
    http_req_duration: [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:health}': [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:beers}': [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:users_create}': [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:users_list}': [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:votes_create}': [`p(95)<${p95Ms}`],
    'http_req_duration{endpoint:results}': [`p(95)<${p95Ms}`],
  };
}
