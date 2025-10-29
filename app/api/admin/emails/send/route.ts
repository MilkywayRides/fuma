import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sentEmails, emailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { from, to, subject, body } = await req.json();

  const [emailAddress] = await db
    .select()
    .from(emailAddresses)
    .where(eq(emailAddresses.address, from))
    .limit(1);

  if (!emailAddress || emailAddress.userId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid sender address' }, { status: 403 });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    const [sent] = await db.insert(sentEmails).values({
      id: Math.floor(Math.random() * 1_000_000_000),
      emailAddressId: emailAddress.id,
      to,
      subject,
      body,
      status: 'sent',
    }).returning();

    return NextResponse.json(sent);
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
