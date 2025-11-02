import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { generateAppUuid, generateClientId, generateClientSecret, hashSecret } from '@/lib/oauth';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, description, homepageUrl, callbackUrl } = body;

    if (!name || !homepageUrl || !callbackUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uuid = generateAppUuid();
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const hashedSecret = hashSecret(clientSecret);

    const result = await db.insert(oauthApplications).values({
      uuid,
      clientId,
      clientSecret: hashedSecret,
      name,
      description: description || null,
      homepageUrl,
      callbackUrl,
      userId: session.user.id,
    }).returning();

    return NextResponse.json({
      ...result[0],
      clientSecret,
    });
  } catch (error) {
    console.error('OAuth app creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
