import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function createPaymentTables() {
  try {
    await sql`DROP TABLE IF EXISTS "webhookLogs" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentTransactions" CASCADE`;
    await sql`DROP TABLE IF EXISTS "coupons" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentLinks" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentButtons" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentPages" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentPlans" CASCADE`;
    await sql`DROP TABLE IF EXISTS "paymentGateways" CASCADE`;

    await sql`
      CREATE TABLE "paymentGateways" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "apiKey" TEXT NOT NULL,
        "webhookSecret" TEXT,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "config" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "paymentPlans" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "amount" INTEGER NOT NULL,
        "currency" TEXT DEFAULT 'usd' NOT NULL,
        "interval" TEXT NOT NULL,
        "features" TEXT,
        "gatewayId" INTEGER REFERENCES "paymentGateways"("id"),
        "externalId" TEXT,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "paymentPages" (
        "id" SERIAL PRIMARY KEY,
        "uuid" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "planId" INTEGER REFERENCES "paymentPlans"("id"),
        "customAmount" BOOLEAN DEFAULT false NOT NULL,
        "minAmount" INTEGER,
        "maxAmount" INTEGER,
        "successUrl" TEXT,
        "cancelUrl" TEXT,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "paymentButtons" (
        "id" SERIAL PRIMARY KEY,
        "uuid" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "planId" INTEGER REFERENCES "paymentPlans"("id"),
        "buttonText" TEXT DEFAULT 'Pay Now' NOT NULL,
        "buttonStyle" TEXT,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "paymentLinks" (
        "id" SERIAL PRIMARY KEY,
        "uuid" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "planId" INTEGER REFERENCES "paymentPlans"("id"),
        "expiresAt" TIMESTAMP,
        "maxUses" INTEGER,
        "usedCount" INTEGER DEFAULT 0 NOT NULL,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "coupons" (
        "id" SERIAL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "type" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "maxUses" INTEGER,
        "usedCount" INTEGER DEFAULT 0 NOT NULL,
        "expiresAt" TIMESTAMP,
        "planIds" TEXT,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "paymentTransactions" (
        "id" SERIAL PRIMARY KEY,
        "uuid" TEXT NOT NULL UNIQUE,
        "userId" TEXT REFERENCES "user"("id"),
        "planId" INTEGER REFERENCES "paymentPlans"("id"),
        "gatewayId" INTEGER REFERENCES "paymentGateways"("id"),
        "amount" INTEGER NOT NULL,
        "currency" TEXT DEFAULT 'usd' NOT NULL,
        "status" TEXT NOT NULL,
        "gatewayTransactionId" TEXT,
        "couponId" INTEGER REFERENCES "coupons"("id"),
        "metadata" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE "webhookLogs" (
        "id" SERIAL PRIMARY KEY,
        "gatewayId" INTEGER REFERENCES "paymentGateways"("id"),
        "event" TEXT NOT NULL,
        "payload" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "error" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    console.log('✅ Payment tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating payment tables:', error);
    process.exit(1);
  }
}

createPaymentTables();
