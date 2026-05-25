// Tiny in-process TTL+LRU cache. Identical birth inputs produce identical
// charts, so caching cuts CPU dramatically under load. Per-instance only;
// swap the get/set for Redis when running many replicas at high scale.

interface Entry<T> {
  value: T;
  expires: number;
}

class TTLCache<T> {
  private map = new Map<string, Entry<T>>();
  constructor(
    private max = 1000,
    private ttlMs = 1000 * 60 * 60 * 24,
  ) {}

  get(key: string): T | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expires) {
      this.map.delete(key);
      return undefined;
    }
    // refresh recency
    this.map.delete(key);
    this.map.set(key, e);
    return e.value;
  }

  set(key: string, value: T) {
    if (this.map.size >= this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

const store = new Map<string, TTLCache<any>>();

function bucket<T>(name: string, max: number, ttlMs: number): TTLCache<T> {
  let c = store.get(name);
  if (!c) {
    c = new TTLCache<T>(max, ttlMs);
    store.set(name, c);
  }
  return c;
}

// Wrap an async producer with a cache keyed by `key`.
export async function cached<T>(
  bucketName: string,
  key: string,
  producer: () => Promise<T>,
  opts: { max?: number; ttlMs?: number } = {},
): Promise<T> {
  const c = bucket<T>(
    bucketName,
    opts.max ?? 2000,
    opts.ttlMs ?? 1000 * 60 * 60 * 24,
  );
  const hit = c.get(key);
  if (hit !== undefined) return hit;
  const value = await producer();
  c.set(key, value);
  return value;
}
