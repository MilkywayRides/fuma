import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function addGateways() {
  try {
    await sql`
      INSERT INTO "paymentGateways" (name, provider, "apiKey", "webhookSecret", active)
      VALUES 
        ('Stripe Payment', 'stripe', ${process.env.STRIPE_SECRET_KEY}, ${process.env.STRIPE_WEBHOOK_SECRET}, true),
        ('Polar Payment', 'polar', ${process.env.POLAR_API_KEY}, ${process.env.POLAR_WEBHOOK_SECRET}, true),
        ('Paytm Payment', 'paytm', 'paytm_test_key', 'paytm_webhook_secret', true)
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✅ Payment gateways added successfully!');
    
    const gateways = await sql`SELECT * FROM "paymentGateways"`;
    console.table(gateways);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addGateways();
