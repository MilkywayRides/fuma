import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { oauthTokens } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(idStr);
    const body = await req.json();
    const { scope } = body;

    if (!scope) {
      return NextResponse.json({ error: 'Scope is required' }, { status: 400 });
    }

    await db.update(oauthTokens)
      .set({ scope })
      .where(
        and(
          eq(oauthTokens.id, id),
          eq(oauthTokens.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(idStr);

    await db.delete(oauthTokens)
      .where(
        and(
          eq(oauthTokens.id, id),
          eq(oauthTokens.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token revocation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
