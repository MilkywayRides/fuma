import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, session.user.id));
  return NextResponse.json(keys.map(k => ({ ...k, key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}` })));
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const key = `bn_${crypto.randomBytes(32).toString('hex')}`;
  const generatedId = Math.floor(Math.random() * 1_000_000_000);
  const [newKey] = await db.insert(apiKeys).values({
    id: generatedId,
    key,
    name,
    userId: session.user.id,
  }).returning();

  return NextResponse.json({ ...newKey, key });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  return NextResponse.json({ success: true });
}
