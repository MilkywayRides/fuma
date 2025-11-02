import { NextRequest } from 'next/server';

const tokenRequestCounts = new Map<string, { count: number; resetAt: number }>();
const apiRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  store: Map<string, { count: number; resetAt: number }>
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

export function rateLimitToken(clientId: string) {
  return checkRateLimit(clientId, 10, 60000, tokenRequestCounts);
}

export function rateLimitAPI(token: string) {
  return checkRateLimit(token, 100, 60000, apiRequestCounts);
}

export function getClientIdentifier(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}
