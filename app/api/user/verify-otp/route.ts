import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otp, phoneNumber } = await req.json();

    // @ts-ignore - checking custom field in session
    if (!session.otp || session.otp.code !== otp || session.otp.phoneNumber !== phoneNumber) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired (15 minutes)
    // @ts-ignore - checking custom field in session
    if (Date.now() - session.otp.timestamp > 900000) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      );
    }

    // Update user phone verification status
    await db
      .update(user)
      .set({
        phoneNumber,
        phoneVerified: true,
      })
      .where(eq(user.id, session.user.id));

    // Clear OTP from session
    // @ts-ignore - removing custom field from session
    delete session.otp;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}