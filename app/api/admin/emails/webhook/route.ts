import { db } from '@/lib/db';
import { emails, emailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Type:', payload.type);
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    
    if (payload.type === 'email.received') {
      const { to, from, subject, text, html } = payload.data;
      console.log('Processing email.received:');
      console.log('To:', to);
      console.log('From:', from);
      console.log('Subject:', subject);
      
      const recipientEmail = Array.isArray(to) ? to[0] : to;
      
      const [emailAddr] = await db
        .select()
        .from(emailAddresses)
        .where(eq(emailAddresses.address, recipientEmail))
        .limit(1);

      console.log('Email address found:', emailAddr ? 'YES' : 'NO');

      if (emailAddr) {
        const emailId = Math.floor(Math.random() * 1_000_000_000);
        await db.insert(emails).values({
          id: emailId,
          emailAddressId: emailAddr.id,
          from: Array.isArray(from) ? from[0] : from,
          to: recipientEmail,
          subject: subject || 'No subject',
          body: text || html || '',
          read: false,
          starred: false,
          folder: 'inbox',
        });
        console.log('✅ Email stored successfully! ID:', emailId);
      } else {
        console.log('❌ No matching email address found for:', recipientEmail);
      }
    }

    if (payload.type === 'email.delivered') {
      console.log('Email delivered event received');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
