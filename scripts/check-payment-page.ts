import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function checkPage() {
  try {
    const pages = await sql`SELECT * FROM "paymentPages"`;
    const links = await sql`SELECT * FROM "paymentLinks"`;
    const buttons = await sql`SELECT * FROM "paymentButtons"`;
    
    console.log('Payment Pages:');
    console.table(pages);
    console.log('\nPayment Links:');
    console.table(links);
    console.log('\nPayment Buttons:');
    console.table(buttons);
    
    const result = await sql`
      SELECT * FROM "paymentPages" WHERE uuid = 'fc8d1f7b62c1ecce'
    `;
    
    console.log('Payment page:');
    console.table(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPage();
