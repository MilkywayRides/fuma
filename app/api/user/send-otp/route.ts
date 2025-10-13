import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Rate limiting object
const rateLimiter: { [key: string]: { count: number; timestamp: number } } = {};

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await req.json();

    // Basic phone number validation
    if (!phoneNumber?.match(/^\+?[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Rate limiting (3 attempts per 15 minutes)
    const now = Date.now();
    const key = `${session.user.id}:${now}`;
    const userLimit = rateLimiter[key];

    if (userLimit && userLimit.count >= 3 && now - userLimit.timestamp < 900000) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP (in real app, use a proper OTP service)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in session (in real app, use proper OTP storage)
    // @ts-ignore - adding custom field to session
    session.otp = {
      code: otp,
      phoneNumber,
      timestamp: now,
    };

    // Update rate limiting
    rateLimiter[key] = {
      count: (userLimit?.count || 0) + 1,
      timestamp: now,
    };

    // In a real app, send OTP via SMS service
    console.log('OTP:', otp); // For development only

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}