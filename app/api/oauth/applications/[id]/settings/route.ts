import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { allowedScopes, dataPermissions, applicationType } = await request.json();

    // Validate data permissions JSON
    let parsedPermissions = {};
    try {
      parsedPermissions = JSON.parse(dataPermissions);
    } catch {
      return NextResponse.json({ error: 'Invalid data permissions format' }, { status: 400 });
    }

    // Update application settings
    const result = await db
      .update(oauthApplications)
      .set({
        allowedScopes,
        dataPermissions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(oauthApplications.id, parseInt(id)),
          eq(oauthApplications.userId, session.user.id)
        )
      )
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
