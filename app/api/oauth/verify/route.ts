import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthTokens, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimitAPI } from '@/lib/oauth-middleware';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.substring(7);
  
  if (token) {
    const rateLimit = rateLimitAPI(token);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded' },
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          }
        }
      );
    }
  }
  try {
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const tokenRecord = await db.query.oauthTokens.findFirst({
      where: eq(oauthTokens.accessToken, token),
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, tokenRecord.userId),
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
      },
      scope: tokenRecord.scope,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OAuth verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
