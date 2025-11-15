import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import crypto from 'crypto';

config();

const sql = neon(process.env.DATABASE_URL!);

async function addMissingUUIDs() {
  try {
    console.log('Adding UUIDs to payment tables...');
    
    // Add UUIDs to paymentGateways
    const gateways = await sql`SELECT id FROM "paymentGateways" WHERE uuid IS NULL`;
    for (const gateway of gateways) {
      const uuid = crypto.randomUUID();
      await sql`UPDATE "paymentGateways" SET uuid = ${uuid} WHERE id = ${gateway.id}`;
    }
    console.log(`Updated ${gateways.length} payment gateways`);
    
    // Add UUIDs to paymentPlans
    const plans = await sql`SELECT id FROM "paymentPlans" WHERE uuid IS NULL`;
    for (const plan of plans) {
      const uuid = crypto.randomUUID();
      await sql`UPDATE "paymentPlans" SET uuid = ${uuid} WHERE id = ${plan.id}`;
    }
    console.log(`Updated ${plans.length} payment plans`);
    
    console.log('UUID addition completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

addMissingUUIDs();
