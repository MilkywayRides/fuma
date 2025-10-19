import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  const query = searchParams.get('query');

  try {
    if (action === 'getUserData' && userId) {
      const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      if (!userData.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user: userData[0] });
    }

    if (action === 'executeQuery' && query) {
      if (!query.trim().toUpperCase().startsWith('SELECT')) {
        return NextResponse.json({ error: 'Only SELECT queries allowed' }, { status: 403 });
      }
      const result = await db.execute(sql.raw(query));
      return NextResponse.json({ result: result.rows });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId, query } = await req.json();

  try {
    if (action === 'getUserData') {
      const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      if (!userData.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user: userData[0] });
    }

    if (action === 'executeQuery') {
      if (!query.trim().toUpperCase().startsWith('SELECT')) {
        return NextResponse.json({ error: 'Only SELECT queries allowed' }, { status: 403 });
      }
      const result = await db.execute(sql.raw(query));
      return NextResponse.json({ result: result.rows });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
