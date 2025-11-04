import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function checkTables() {
  try {
    const result = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'paymentPlans'
      ORDER BY ordinal_position
    `;
    
    console.log('paymentPlans table structure:');
    console.table(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
