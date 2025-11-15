import { db } from '@/lib/db';
import { papers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { EditPaperClient } from './edit-paper-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaperPage({ params }: PageProps) {
  const { id } = await params;
  console.log('Looking for admin paper with ID:', id);
  
  let paper;
  
  try {
    const result = await db.select()
      .from(papers)
      .where(eq(papers.id, id))
      .limit(1);

    paper = result[0];
    console.log('Found admin paper:', paper ? 'Yes' : 'No');
  } catch (error) {
    console.error('Database error fetching admin paper:', error);
    notFound();
  }

  if (!paper) {
    console.log('Admin paper not found, returning 404');
    notFound();
  }

  const paperData = paper;
  let pages = [];
  
  try {
    const content = JSON.parse(paperData.content);
    // Handle both old format (elements array) and new format (pages array)
    if (Array.isArray(content) && content.length > 0 && content[0].pageId) {
      // New format with pages
      pages = content;
    } else if (Array.isArray(content)) {
      // Old format - convert to new format
      pages = [{
        id: '1',
        name: 'Page 1',
        elements: content.map(el => ({ ...el, pageId: '1' }))
      }];
    } else {
      // Default empty page
      pages = [{ id: '1', name: 'Page 1', elements: [] }];
    }
  } catch (error) {
    console.error('Failed to parse admin paper content:', error);
    pages = [{ id: '1', name: 'Page 1', elements: [] }];
  }

  return (
    <EditPaperClient
      paperId={paperData.id}
      initialTitle={paperData.title}
      initialPages={pages}
    />
  );
}
