import { db } from '@/lib/db';
import { siteVisits } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { path } = await request.json();
  const headersList = await headers();
  
  const generatedId = Math.floor(Math.random() * 1_000_000_000);
  await db.insert(siteVisits).values({
    id: generatedId,
    userId: session?.user?.id || null,
    ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
    userAgent: headersList.get('user-agent'),
    path,
  });

  return NextResponse.json({ success: true });
}
