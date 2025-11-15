import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function cleanup() {
  try {
    console.log('Cleaning up orphaned comments...');
    
    // Delete comments that reference non-existent blog posts
    const result = await sql`
      DELETE FROM comments 
      WHERE "postId" NOT IN (SELECT id FROM "blogPosts")
    `;
    
    console.log(`Deleted orphaned comments`);
    
    // Check remaining orphaned data
    const check = await sql`
      SELECT COUNT(*) as count
      FROM comments c 
      LEFT JOIN "blogPosts" bp ON c."postId" = bp.id 
      WHERE bp.id IS NULL
    `;
    
    console.log(`Remaining orphaned comments: ${check[0].count}`);
    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanup();
