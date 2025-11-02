import crypto from 'crypto';

export function generateAppUuid(): string {
  return crypto.randomBytes(5).toString('hex');
}

export function generateClientId(): string {
  return `bn_${crypto.randomBytes(16).toString('hex')}`;
}

export function generateClientSecret(): string {
  return `bn_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateAccessToken(): string {
  return `at_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateRefreshToken(): string {
  return `rt_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateAuthorizationCode(): string {
  return `code_${crypto.randomBytes(24).toString('hex')}`;
}

export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

export function getTokenExpiry(hours: number = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function getRefreshTokenExpiry(days: number = 30): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function getAuthCodeExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
