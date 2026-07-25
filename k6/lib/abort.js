import exec from 'k6/execution';

/**
 * beer-vote keeps state in memory. If the process dies/restarts mid-test,
 * data is wiped — continuing the run is meaningless. Abort immediately.
 */
export function abortIfServiceDown(res, context = '') {
  if (!res) {
    exec.test.abort(`empty response${context ? ` (${context})` : ''} — aborting`);
  }

  // k6 uses status 0 for network/transport failures (connection refused, reset, dial error, ...)
  if (res.status === 0) {
    const detail = res.error || res.error_code || 'status=0';
    exec.test.abort(
      `service unreachable: ${detail}${context ? ` [${context}]` : ''} — aborting (in-memory state would be lost on restart)`,
    );
  }
}
