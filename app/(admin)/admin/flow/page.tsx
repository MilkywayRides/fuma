import { db } from '@/lib/db';
import { flowcharts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function FlowPage() {
  const allFlowcharts = await db.select().from(flowcharts).orderBy(desc(flowcharts.createdAt));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Flowcharts</h1>
          <p className="text-muted-foreground mt-2">Create and manage flowcharts</p>
        </div>
        <Link
          href="/admin/flow/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Flowchart
        </Link>
      </div>

      <div className="space-y-4">
        {allFlowcharts.length === 0 ? (
          <p className="text-muted-foreground">No flowcharts yet. Create your first one!</p>
        ) : (
          allFlowcharts.map((flow) => (
            <div key={flow.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{flow.title}</h2>
                  <div className="flex gap-2 items-center text-sm">
                    <span className={flow.published ? 'text-green-600' : 'text-yellow-600'}>
                      {flow.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(flow.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/flow/${flow.id}/edit`}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
