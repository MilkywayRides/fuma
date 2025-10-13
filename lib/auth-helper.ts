import { headers } from 'next/headers';
import { auth } from './auth';
import { validateApiKey } from './api-auth';
import { NextResponse } from 'next/server';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export async function getUserId() {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  
  if (apiKey) {
    const validUserId = await validateApiKey(apiKey);
    if (!validUserId) {
      throw new Error('Invalid API key');
    }
    return validUserId;
  }
  
  const headersObject = Array.from(headersList.entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const session = await auth.api.getSession({ headers: headersObject });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function withAuth<T>(handler: (userId: string) => Promise<T>) {
  try {
    const userId = await getUserId();
    return await handler(userId);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' || error.message === 'Invalid API key' ? 401 : 500 
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}