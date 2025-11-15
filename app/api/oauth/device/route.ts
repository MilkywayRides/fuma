import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthApplications, oauthDeviceFlow } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { checkRateLimit, addSecurityHeaders } from '@/lib/oauth-rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute
    if (!checkRateLimit(request, 5, 60000)) {
      const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      return addSecurityHeaders(response);
    }

    const { client_id, scope = 'read' } = await request.json();

    if (!client_id) {
      const response = NextResponse.json({ error: 'client_id is required' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Verify application exists
    const app = await db.select().from(oauthApplications).where(eq(oauthApplications.clientId, client_id)).limit(1);
    if (!app.length || !app[0].active) {
      const response = NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Generate codes
    const deviceCode = crypto.randomBytes(32).toString('hex');
    const userCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store device flow
    await db.insert(oauthDeviceFlow).values({
      deviceCode,
      userCode,
      applicationId: app[0].id,
      scope,
      expiresAt,
    });

    const response = NextResponse.json({
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: `${process.env.NEXT_PUBLIC_APP_URL}/oauth/device`,
      verification_uri_complete: `${process.env.NEXT_PUBLIC_APP_URL}/oauth/device?user_code=${userCode}`,
      expires_in: 900, // 15 minutes
      interval: 5, // Poll every 5 seconds
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Device flow error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addSecurityHeaders(response);
  }
}
