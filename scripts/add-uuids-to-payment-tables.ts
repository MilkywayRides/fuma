import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';

config();

const sql = neon(process.env.DATABASE_URL!);

async function addUUIDs() {
  try {
    // Add uuid columns
    await sql`ALTER TABLE "paymentGateways" ADD COLUMN IF NOT EXISTS uuid TEXT UNIQUE`;
    await sql`ALTER TABLE "paymentPlans" ADD COLUMN IF NOT EXISTS uuid TEXT UNIQUE`;
    await sql`ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS uuid TEXT UNIQUE`;
    
    // Update existing rows with UUIDs
    const gateways = await sql`SELECT id FROM "paymentGateways" WHERE uuid IS NULL`;
    for (const gateway of gateways) {
      const uuid = randomBytes(5).toString('hex');
      await sql`UPDATE "paymentGateways" SET uuid = ${uuid} WHERE id = ${gateway.id}`;
    }
    
    const plans = await sql`SELECT id FROM "paymentPlans" WHERE uuid IS NULL`;
    for (const plan of plans) {
      const uuid = randomBytes(5).toString('hex');
      await sql`UPDATE "paymentPlans" SET uuid = ${uuid} WHERE id = ${plan.id}`;
    }
    
    const coupons = await sql`SELECT id FROM "coupons" WHERE uuid IS NULL`;
    for (const coupon of coupons) {
      const uuid = randomBytes(5).toString('hex');
      await sql`UPDATE "coupons" SET uuid = ${uuid} WHERE id = ${coupon.id}`;
    }
    
    console.log('✅ UUIDs added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addUUIDs();
