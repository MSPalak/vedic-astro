// Per-IP sliding-window rate limiter (in-process). Protects CPU and the
// AI key from abuse. Per-instance state is the right scope for a single
// Render instance; swap for Redis if the app scales to many replicas.

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Periodic sweep so the map can't grow without bound.
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      if (hits.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((hits[0] + windowMs - now) / 1000),
    );
    return { ok: false, retryAfterSec };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfterSec: 0 };
}

// Client IP behind Render's proxy (first x-forwarded-for hop) with a
// local-dev fallback.
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim().slice(0, 64);
  return req.headers.get("x-real-ip")?.slice(0, 64) ?? "local";
}

export function tooMany(retryAfterSec: number) {
  return new Response(
    JSON.stringify({
      error: "Too many requests — please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
