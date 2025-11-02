import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function updateTokenScopes() {
  console.log('Updating token scopes to match app allowed scopes...');
  
  await sql`
    UPDATE "oauthTokens" 
    SET scope = (
      SELECT "allowedScopes" 
      FROM "oauthApplications" 
      WHERE "oauthApplications".id = "oauthTokens"."applicationId"
    )
  `;
  
  console.log('✅ Token scopes updated!');
}

updateTokenScopes().catch(console.error);
