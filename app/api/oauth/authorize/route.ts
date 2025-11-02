import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { oauthApplications, oauthAuthorizationCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAuthorizationCode, getAuthCodeExpiry } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      const searchParams = req.nextUrl.searchParams;
      const authUrl = new URL('/oauth/authorize', req.url);
      searchParams.forEach((value, key) => authUrl.searchParams.set(key, value));
      return NextResponse.redirect(authUrl);
    }

    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || 'read';
    const state = searchParams.get('state');

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const app = await db.query.oauthApplications.findFirst({
      where: eq(oauthApplications.clientId, clientId),
    });

    if (!app || !app.active) {
      return NextResponse.json({ error: 'Invalid client' }, { status: 400 });
    }

    if (app.callbackUrl !== redirectUri) {
      return NextResponse.json({ error: 'Invalid redirect URI' }, { status: 400 });
    }

    const code = generateAuthorizationCode();
    
    await db.insert(oauthAuthorizationCodes).values({
      code,
      applicationId: app.id,
      userId: session.user.id,
      redirectUri,
      scope,
      expiresAt: getAuthCodeExpiry(),
    });

    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', code);
    if (state) redirectUrl.searchParams.set('state', state);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth authorize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
