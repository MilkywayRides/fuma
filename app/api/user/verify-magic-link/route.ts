import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verification, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/sign-in?error=invalid', req.url));
    }

    const verificationRecord = await db.query.verification.findFirst({
      where: and(
        eq(verification.identifier, `magic_${email}`),
        eq(verification.value, token)
      ),
    });

    if (!verificationRecord || new Date() > verificationRecord.expiresAt) {
      return NextResponse.redirect(new URL('/sign-in?error=expired', req.url));
    }

    await db.update(user)
      .set({ emailVerified: true })
      .where(eq(user.email, email));

    await db.delete(verification).where(eq(verification.identifier, `magic_${email}`));

    return NextResponse.redirect(new URL('/?verified=true', req.url));
  } catch (error) {
    console.error('Verify magic link error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=failed', req.url));
  }
}
