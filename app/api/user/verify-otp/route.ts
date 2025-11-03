import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, verification } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const verificationRecord = await db.query.verification.findFirst({
      where: and(
        eq(verification.identifier, email),
        eq(verification.value, otp)
      ),
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > verificationRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    await db.update(user)
      .set({ emailVerified: true })
      .where(eq(user.email, email));

    await db.delete(verification).where(eq(verification.identifier, email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}