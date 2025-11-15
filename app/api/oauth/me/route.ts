import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { oauthTokens, oauthApplications, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7);

    // Verify token and get application permissions
    const tokenData = await db
      .select({
        token: oauthTokens,
        app: oauthApplications,
        user: user,
      })
      .from(oauthTokens)
      .innerJoin(oauthApplications, eq(oauthTokens.applicationId, oauthApplications.id))
      .innerJoin(user, eq(oauthTokens.userId, user.id))
      .where(eq(oauthTokens.accessToken, accessToken))
      .limit(1);

    if (!tokenData.length) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { token, app, user: userData } = tokenData[0];

    // Check token expiry
    if (new Date() > token.expiresAt) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // Parse data permissions
    const dataPermissions = JSON.parse(app.dataPermissions || '{}');
    
    // Filter user data based on permissions
    const filteredData: any = {};
    
    if (dataPermissions.id) filteredData.id = userData.id;
    if (dataPermissions.name) filteredData.name = userData.name;
    if (dataPermissions.email) filteredData.email = userData.email;
    if (dataPermissions.image) filteredData.image = userData.image;
    if (dataPermissions.role) filteredData.role = userData.role;
    if (dataPermissions.userType) filteredData.userType = userData.userType;
    if (dataPermissions.phoneNumber) filteredData.phoneNumber = userData.phoneNumber;
    if (dataPermissions.credits) filteredData.credits = userData.credits;
    if (dataPermissions.createdAt) filteredData.createdAt = userData.createdAt;
    if (dataPermissions.emailVerified) filteredData.emailVerified = userData.emailVerified;
    if (dataPermissions.phoneVerified) filteredData.phoneVerified = userData.phoneVerified;

    // Always include basic info if no specific permissions set
    if (Object.keys(dataPermissions).length === 0) {
      filteredData.id = userData.id;
      filteredData.name = userData.name;
      filteredData.email = userData.email;
    }

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('OAuth user data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
