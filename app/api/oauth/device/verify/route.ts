import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthDeviceFlow } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_code } = await request.json();

    if (!user_code || user_code.length !== 6) {
      return NextResponse.json({ error: 'Invalid user code' }, { status: 400 });
    }

    // Find and verify device flow
    const deviceFlow = await db
      .select()
      .from(oauthDeviceFlow)
      .where(
        and(
          eq(oauthDeviceFlow.userCode, user_code),
          eq(oauthDeviceFlow.verified, false)
        )
      )
      .limit(1);

    if (!deviceFlow.length) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const flow = deviceFlow[0];

    // Check if expired
    if (new Date() > flow.expiresAt) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // Mark as verified
    await db
      .update(oauthDeviceFlow)
      .set({ 
        verified: true, 
        userId: session.user.id 
      })
      .where(eq(oauthDeviceFlow.id, flow.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Device verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
