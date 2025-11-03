import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { verification } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getMagicLinkEmailTemplate } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const token = `ml_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/api/user/verify-magic-link?token=${token}&email=${encodeURIComponent(email)}`;

    await db.delete(verification).where(eq(verification.identifier, `magic_${email}`));

    await db.insert(verification).values({
      id: token,
      identifier: `magic_${email}`,
      value: token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await resend.emails.send({
      from: 'BlazeNeuro <noreply@blazeneuro.com>',
      to: email,
      subject: 'Verify Your Email - BlazeNeuro',
      html: getMagicLinkEmailTemplate(magicLink),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
