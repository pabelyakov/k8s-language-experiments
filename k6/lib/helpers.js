export function baseUrl() {
  return (__ENV.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
}

export function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export function randomInt(min, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

export function randomChoice(items) {
  return items[randomInt(0, items.length - 1)];
}

export function uniqueUserName() {
  // Keep under 64 chars; unique enough across VUs/iters.
  return `user_${__VU}_${__ITER}_${Date.now()}_${randomInt(1000, 9999)}`;
}

export function parseJson(res) {
  try {
    return res.json();
  } catch (_) {
    return null;
  }
}

export function tagged(endpoint, extra = {}) {
  return { tags: { endpoint, ...extra } };
}

/**
 * Weighted random pick.
 * weights: [{ name, weight, run: () => void }, ...]
 */
export function pickWeighted(weights) {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const item of weights) {
    roll -= item.weight;
    if (roll <= 0) {
      return item;
    }
  }
  return weights[weights.length - 1];
}

export function envInt(name, fallback) {
  const raw = __ENV[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function envFloat(name, fallback) {
  const raw = __ENV[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function envMs(name, fallbackMs) {
  // Accept plain ms number, or strings like "300ms" / "1s"
  const raw = __ENV[name];
  if (raw === undefined || raw === '') {
    return fallbackMs;
  }
  if (/^\d+(\.\d+)?ms$/i.test(raw)) {
    return Number.parseFloat(raw);
  }
  if (/^\d+(\.\d+)?s$/i.test(raw)) {
    return Number.parseFloat(raw) * 1000;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallbackMs;
}
