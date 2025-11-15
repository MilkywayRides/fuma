import { db } from '@/lib/db';
import { papers, user } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Papers',
};

export const dynamic = 'force-dynamic';

export default async function PublicPapersPage() {
  let papersList: any[] = [];

  try {
    papersList = await db.select({
      id: papers.id,
      title: papers.title,
      authorName: user.name,
      createdAt: papers.createdAt,
      updatedAt: papers.updatedAt,
    }).from(papers)
      .leftJoin(user, sql`${papers.authorId} = ${user.id}`)
      .orderBy(desc(papers.updatedAt));
  } catch (error) {
    console.error('Failed to fetch papers:', error);
    papersList = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Papers</h1>
          <p className="text-muted-foreground">Browse our collection of papers and documents</p>
        </div>

        {papersList.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2 text-foreground">No papers available</h3>
            <p className="text-muted-foreground">Check back later for new papers.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {papersList.map((paper) => (
              <div key={paper.id} className="border border-border rounded-lg p-6 hover:shadow-lg transition-all bg-card group">
                <div className="flex items-start justify-between mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <Link href={`/papers/${paper.id}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-foreground line-clamp-2">{paper.title}</h3>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>By {paper.authorName || 'Unknown'}</p>
                  <p>Created {new Date(paper.createdAt).toLocaleDateString()}</p>
                  {paper.updatedAt !== paper.createdAt && (
                    <p>Updated {new Date(paper.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
