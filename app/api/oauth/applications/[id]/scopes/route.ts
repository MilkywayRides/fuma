import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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

    const isAdmin = await hasAdminAccess(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(idStr);
    const body = await req.json();
    const { allowedScopes } = body;

    await db.update(oauthApplications)
      .set({ allowedScopes, updatedAt: new Date() })
      .where(
        and(
          eq(oauthApplications.id, id),
          eq(oauthApplications.userId, session.user.id)
        )
      );

    // Update all tokens for this app to match new scopes
    await db.execute(
      sql`UPDATE "oauthTokens" 
          SET scope = ${allowedScopes} 
          WHERE "applicationId" = ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth app scopes update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
