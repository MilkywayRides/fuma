-- Create payment tables with proper serial IDs
CREATE TABLE IF NOT EXISTS "paymentGateways" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "apiKey" TEXT NOT NULL,
  "webhookSecret" TEXT,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "config" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "paymentPlans" (
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
);

CREATE TABLE IF NOT EXISTS "paymentPages" (
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
);

CREATE TABLE IF NOT EXISTS "paymentButtons" (
  "id" SERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "planId" INTEGER REFERENCES "paymentPlans"("id"),
  "buttonText" TEXT DEFAULT 'Pay Now' NOT NULL,
  "buttonStyle" TEXT,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "paymentLinks" (
  "id" SERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "planId" INTEGER REFERENCES "paymentPlans"("id"),
  "expiresAt" TIMESTAMP,
  "maxUses" INTEGER,
  "usedCount" INTEGER DEFAULT 0 NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "coupons" (
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
);

CREATE TABLE IF NOT EXISTS "paymentTransactions" (
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
);

CREATE TABLE IF NOT EXISTS "webhookLogs" (
  "id" SERIAL PRIMARY KEY,
  "gatewayId" INTEGER REFERENCES "paymentGateways"("id"),
  "event" TEXT NOT NULL,
  "payload" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
