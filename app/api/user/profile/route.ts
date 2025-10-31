import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userProfile] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interests, phoneNumber, onboardingCompleted } = body;

    // Log before update
    console.log('Updating user profile:', { interests, phoneNumber, onboardingCompleted });

    // Create an update object with only defined values
    const updateData: any = {
      updatedAt: new Date(), // Always update the timestamp
    };

    // Only include fields that are defined
    if (interests) {
      updateData.userType = interests.join(',');
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted;
    }

    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, session.user.id));

    // Log after update
    const [updatedUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    console.log('Updated user:', updatedUser);

    // Return success response with cache control headers
    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}