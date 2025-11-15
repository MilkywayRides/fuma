import { db } from '@/lib/db';
import { papers } from '@/lib/db/schema';

export default async function TestPapersPage() {
  let allPapers: any[] = [];
  let error = null;

  try {
    allPapers = await db.select().from(papers);
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Papers Database Test</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Database Error:</strong> {error}
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Database connection successful!
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Papers in Database: {allPapers.length}</h2>
      
      {allPapers.length === 0 ? (
        <p className="text-gray-600">No papers found in database.</p>
      ) : (
        <div className="space-y-2">
          {allPapers.map((paper) => (
            <div key={paper.id} className="border p-3 rounded">
              <strong>ID:</strong> {paper.id}<br />
              <strong>Title:</strong> {paper.title}<br />
              <strong>Created:</strong> {new Date(paper.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <a href="/admin/papers/new" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create New Paper
        </a>
      </div>
    </div>
  );
}
