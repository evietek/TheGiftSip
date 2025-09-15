// src/lib/rateLimit.js
// Lightweight in-memory sliding-window rate limiter.
// API: rateLimit(key, bucket, max, windowMs) -> boolean
// - key: a unique identifier (e.g., IP or userId)
// - bucket: a logical action name (e.g., 'create-order')
// - max: max requests allowed in the time window
// - windowMs: time window in milliseconds
//
// Notes:
// • Per-process only (resets on deploy/restart). Use Redis/Upstash for production multi-instance.
// • Sliding window by pruning old timestamps on every call.

const store = new Map(); // Map<bucket, Map<key, number[]>>

export function rateLimit(key, bucket = 'global', max = 60, windowMs = 60_000) {
  const now = Date.now();

  if (!store.has(bucket)) store.set(bucket, new Map());
  const bucketMap = store.get(bucket);

  let hits = bucketMap.get(key);
  if (!hits) {
    hits = [];
    bucketMap.set(key, hits);
  }

  // prune old
  const cutoff = now - windowMs;
  while (hits.length && hits[0] < cutoff) hits.shift();

  if (hits.length >= max) {
    return false;
  }

  hits.push(now);
  return true;
}

// Optional helper if you ever want to ask "how long until allowed?"
export function retryAfterMs(key, bucket = 'global', max = 60, windowMs = 60_000) {
  const bucketMap = store.get(bucket);
  const now = Date.now();
  const cutoff = now - windowMs;
  if (!bucketMap) return 0;
  const hits = bucketMap.get(key) || [];
  while (hits.length && hits[0] < cutoff) hits.shift();
  if (hits.length < max) return 0;
  return windowMs - (now - hits[0]);
}
