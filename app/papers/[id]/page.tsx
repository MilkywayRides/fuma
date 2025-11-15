import { db } from '@/lib/db';
import { papers, user } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PaperViewer } from '@/components/paper-viewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicPaperPage({ params }: PageProps) {
  const { id } = await params;
  console.log('Looking for paper with ID:', id);
  
  let paper;
  
  try {
    const result = await db.select({
      id: papers.id,
      title: papers.title,
      content: papers.content,
      authorName: user.name,
      createdAt: papers.createdAt,
      updatedAt: papers.updatedAt,
    }).from(papers)
      .leftJoin(user, sql`${papers.authorId} = ${user.id}`)
      .where(eq(papers.id, id))
      .limit(1);

    paper = result[0];
    console.log('Found paper:', paper ? 'Yes' : 'No');
  } catch (error) {
    console.error('Database error fetching paper:', error);
    notFound();
  }

  if (!paper) {
    console.log('Paper not found, returning 404');
    notFound();
  }

  let pages = [];
  
  try {
    const content = JSON.parse(paper.content);
    if (Array.isArray(content) && content.length > 0 && content[0].pageId) {
      pages = content;
    } else if (Array.isArray(content)) {
      pages = [{
        id: '1',
        name: 'Page 1',
        elements: content.map(el => ({ ...el, pageId: '1' }))
      }];
    } else {
      pages = [{ id: '1', name: 'Page 1', elements: [] }];
    }
  } catch (error) {
    console.error('Failed to parse paper content:', error);
    pages = [{ id: '1', name: 'Page 1', elements: [] }];
  }

  return (
    <PaperViewer
      title={paper.title}
      pages={pages}
      authorName={paper.authorName || 'Unknown'}
      createdAt={paper.createdAt}
      updatedAt={paper.updatedAt}
    />
  );
}
