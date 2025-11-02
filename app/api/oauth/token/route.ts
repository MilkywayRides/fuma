import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthApplications, oauthAuthorizationCodes, oauthTokens } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateAccessToken, generateRefreshToken, getTokenExpiry, getRefreshTokenExpiry, verifySecret } from '@/lib/oauth';
import { rateLimitToken } from '@/lib/oauth-middleware';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const clientId = body.client_id;
  
  if (clientId) {
    const rateLimit = rateLimitToken(clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', error_description: 'Too many token requests' },
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          }
        }
      );
    }
  }
  try {
    const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = body;

    if (grant_type === 'authorization_code') {
      if (!code || !client_id || !client_secret || !redirect_uri) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const app = await db.query.oauthApplications.findFirst({
        where: eq(oauthApplications.clientId, client_id),
      });

      if (!app || !app.active) {
        return NextResponse.json({ error: 'Invalid client' }, { status: 401 });
      }

      if (!verifySecret(client_secret, app.clientSecret)) {
        return NextResponse.json({ error: 'Invalid client credentials' }, { status: 401 });
      }

      const authCode = await db.query.oauthAuthorizationCodes.findFirst({
        where: and(
          eq(oauthAuthorizationCodes.code, code),
          eq(oauthAuthorizationCodes.applicationId, app.id),
          eq(oauthAuthorizationCodes.used, false)
        ),
      });

      if (!authCode) {
        return NextResponse.json({ error: 'Invalid authorization code' }, { status: 400 });
      }

      if (new Date() > authCode.expiresAt) {
        return NextResponse.json({ error: 'Authorization code expired' }, { status: 400 });
      }

      if (authCode.redirectUri !== redirect_uri) {
        return NextResponse.json({ error: 'Invalid redirect URI' }, { status: 400 });
      }

      await db.update(oauthAuthorizationCodes)
        .set({ used: true })
        .where(eq(oauthAuthorizationCodes.id, authCode.id));

      const accessToken = generateAccessToken();
      const refreshTokenValue = generateRefreshToken();

      await db.insert(oauthTokens).values({
        accessToken,
        refreshToken: refreshTokenValue,
        applicationId: app.id,
        userId: authCode.userId,
        scope: authCode.scope,
        expiresAt: getTokenExpiry(1),
        refreshExpiresAt: getRefreshTokenExpiry(30),
      });

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshTokenValue,
        scope: authCode.scope,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (grant_type === 'refresh_token') {
      if (!refresh_token || !client_id || !client_secret) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const app = await db.query.oauthApplications.findFirst({
        where: eq(oauthApplications.clientId, client_id),
      });

      if (!app || !app.active) {
        return NextResponse.json({ error: 'Invalid client' }, { status: 401 });
      }

      if (!verifySecret(client_secret, app.clientSecret)) {
        return NextResponse.json({ error: 'Invalid client credentials' }, { status: 401 });
      }

      const token = await db.query.oauthTokens.findFirst({
        where: and(
          eq(oauthTokens.refreshToken, refresh_token),
          eq(oauthTokens.applicationId, app.id)
        ),
      });

      if (!token) {
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 400 });
      }

      if (new Date() > token.refreshExpiresAt) {
        return NextResponse.json({ error: 'Refresh token expired' }, { status: 400 });
      }

      await db.delete(oauthTokens).where(eq(oauthTokens.id, token.id));

      const newAccessToken = generateAccessToken();
      const newRefreshToken = generateRefreshToken();

      await db.insert(oauthTokens).values({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        applicationId: app.id,
        userId: token.userId,
        scope: token.scope,
        expiresAt: getTokenExpiry(1),
        refreshExpiresAt: getRefreshTokenExpiry(30),
      });

      return NextResponse.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: token.scope,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported grant type' }, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OAuth token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
