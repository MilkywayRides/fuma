import { db } from '@/lib/db';
import { papers, user } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Papers - Admin',
};

export const dynamic = 'force-dynamic';

export default async function PapersPage() {
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
    // Table might not exist yet, that's okay
    papersList = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Papers</h1>
          <Link href="/admin/papers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Paper
            </Button>
          </Link>
        </div>

        {papersList.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2 text-foreground">No papers yet</h3>
            <p className="text-muted-foreground mb-4">Create your first PDF paper to get started.</p>
            <Link href="/admin/papers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Paper
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {papersList.map((paper) => (
              <div key={paper.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-foreground">{paper.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {paper.authorName || 'Unknown'} • Created {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                    {paper.updatedAt !== paper.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(paper.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link href={`/admin/papers/${paper.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
