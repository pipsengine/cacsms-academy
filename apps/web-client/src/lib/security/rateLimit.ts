type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const buckets = new Map<string, { count: number; resetAtMs: number }>();

export function getClientIp(req: Request): string {
  const header = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (!header) return 'unknown';
  const first = header.split(',')[0]?.trim();
  return first || 'unknown';
}

export function rateLimit({ key, limit, windowMs }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAtMs) {
    buckets.set(key, { count: 1, resetAtMs: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true };
}
