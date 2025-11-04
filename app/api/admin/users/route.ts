import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.select().from(user);
  return NextResponse.json({ users });
}
