import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthTokens, user, oauthApiLogs } from '@/lib/db/schema';
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

    await db.insert(oauthApiLogs).values({
      applicationId: tokenRecord.applicationId,
      endpoint: '/api/oauth/verify',
      method: 'GET',
      statusCode: 200,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    }).catch(() => {});

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, tokenRecord.userId),
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const scopes = tokenRecord.scope.split(',').map(s => s.trim()).filter(Boolean);
    const userData: any = { id: userRecord.id };
    
    if (scopes.includes('profile') || scopes.includes('all') || scopes.includes('read')) {
      userData.name = userRecord.name;
    }
    if (scopes.includes('email') || scopes.includes('all') || scopes.includes('read')) {
      userData.email = userRecord.email;
    }
    if (scopes.includes('phone') || scopes.includes('all')) {
      userData.phoneNumber = userRecord.phoneNumber;
      userData.phoneVerified = userRecord.phoneVerified;
    }
    if (scopes.includes('role') || scopes.includes('all') || scopes.includes('read')) {
      userData.role = userRecord.role;
    }
    if (scopes.includes('credits') || scopes.includes('all')) {
      userData.credits = userRecord.credits;
    }
    
    return NextResponse.json({
      user: userData,
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
