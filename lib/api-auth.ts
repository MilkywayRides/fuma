import { db } from './db';
import { apiKeys } from './db/schema';
import { eq } from 'drizzle-orm';

export async function validateApiKey(key: string) {
  if (!key || !key.startsWith('bn_')) return null;
  
  const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
  if (!apiKey) return null;

  await db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, apiKey.id));
  return apiKey.userId;
}
