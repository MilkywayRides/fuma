import { db } from '@/lib/db';
import { emails, emailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Webhook received:', payload.type);
    
    if (payload.type === 'email.received') {
      const { to, from, subject, text } = payload.data;
      
      const [emailAddr] = await db
        .select()
        .from(emailAddresses)
        .where(eq(emailAddresses.address, to))
        .limit(1);

      if (emailAddr) {
        await db.insert(emails).values({
          id: Math.floor(Math.random() * 1_000_000_000),
          emailAddressId: emailAddr.id,
          from,
          to,
          subject,
          body: text || '',
          read: false,
          starred: false,
          folder: 'inbox',
        });
        console.log('Email stored in inbox:', subject);
      }
    }

    if (payload.type === 'email.delivered') {
      console.log('Email delivered:', payload.data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
