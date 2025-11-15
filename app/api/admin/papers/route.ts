import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { papers } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

export async function POST(request: Request) {
  try {
    console.log('Creating new paper...');
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log('Session user:', session?.user?.id, 'Role:', session?.user?.role);

    if (!session?.user?.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();
    console.log('Paper data:', { title: title?.substring(0, 50), contentLength: content?.length });

    if (!title || !content) {
      console.log('Missing title or content');
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const id = generateId();
    console.log('Generated paper ID:', id);

    const result = await db.insert(papers).values({
      id,
      title,
      content,
      authorId: session.user.id,
    });

    console.log('Paper inserted successfully:', id);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Failed to create paper:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Fetching all papers...');
    const allPapers = await db.select().from(papers);
    console.log('Found papers:', allPapers.length);
    return NextResponse.json({ papers: allPapers });
  } catch (error) {
    console.error('Failed to fetch papers:', error);
    return NextResponse.json({ error: 'Failed to fetch papers', details: error.message }, { status: 500 });
  }
}
