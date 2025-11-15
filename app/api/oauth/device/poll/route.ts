import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthDeviceFlow, oauthTokens, oauthApplications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { device_code, client_id } = await request.json();

    if (!device_code || !client_id) {
      return NextResponse.json({ error: 'device_code and client_id are required' }, { status: 400 });
    }

    // Get device flow record
    const deviceFlow = await db
      .select({
        deviceFlow: oauthDeviceFlow,
        app: oauthApplications,
      })
      .from(oauthDeviceFlow)
      .innerJoin(oauthApplications, eq(oauthDeviceFlow.applicationId, oauthApplications.id))
      .where(
        and(
          eq(oauthDeviceFlow.deviceCode, device_code),
          eq(oauthApplications.clientId, client_id)
        )
      )
      .limit(1);

    if (!deviceFlow.length) {
      return NextResponse.json({ error: 'Invalid device_code' }, { status: 400 });
    }

    const flow = deviceFlow[0].deviceFlow;
    const app = deviceFlow[0].app;

    // Check if expired
    if (new Date() > flow.expiresAt) {
      return NextResponse.json({ error: 'expired_token' }, { status: 400 });
    }

    // Check if not yet verified
    if (!flow.verified || !flow.userId) {
      return NextResponse.json({ error: 'authorization_pending' }, { status: 400 });
    }

    // Generate tokens
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(oauthTokens).values({
      accessToken,
      refreshToken,
      applicationId: app.id,
      userId: flow.userId,
      scope: flow.scope,
      expiresAt,
      refreshExpiresAt,
    });

    // Clean up device flow
    await db.delete(oauthDeviceFlow).where(eq(oauthDeviceFlow.id, flow.id));

    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: flow.scope,
    });
  } catch (error) {
    console.error('Device poll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
