const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function startStream(streamKey) {
  try {
    const result = await sql`
      UPDATE streams 
      SET status = 'live', "startedAt" = NOW() 
      WHERE "streamKey" = ${streamKey}
      RETURNING uuid, title, status
    `;
    
    if (result.length > 0) {
      console.log('✅ Stream started:', result[0]);
    } else {
      console.log('❌ Stream not found with key:', streamKey);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

const streamKey = process.argv[2];
if (!streamKey) {
  console.log('Usage: node start-stream.js <stream-key>');
  process.exit(1);
}

startStream(streamKey);
