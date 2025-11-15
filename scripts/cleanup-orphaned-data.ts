import { db } from '../lib/db';
import { comments, blogPosts } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function cleanupOrphanedData() {
  try {
    console.log('Cleaning up orphaned comments...');
    
    // Delete comments that reference non-existent blog posts
    const result = await db.execute(sql`
      DELETE FROM comments 
      WHERE "postId" NOT IN (SELECT id FROM "blogPosts")
    `);
    
    console.log(`Deleted ${result.rowCount} orphaned comments`);
    
    // Check for any other orphaned data
    const orphanedComments = await db.execute(sql`
      SELECT c.id, c."postId" 
      FROM comments c 
      LEFT JOIN "blogPosts" bp ON c."postId" = bp.id 
      WHERE bp.id IS NULL
    `);
    
    console.log(`Remaining orphaned comments: ${orphanedComments.rowCount}`);
    
    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupOrphanedData();
