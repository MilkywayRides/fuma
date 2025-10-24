import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-me'
);

const alg = 'HS256';

export async function verify(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [alg],
    });
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}