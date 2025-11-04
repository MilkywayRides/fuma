import { db } from '@/lib/db';
import { paymentGateways, paymentTransactions, paymentPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { StripeProvider } from './stripe';
import { PolarProvider } from './polar';

export interface PaymentProvider {
  createCheckoutSession(userId: string, productId: string, email?: string): Promise<string>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<any>;
}

export class UnifiedPaymentManager {
  static async getProvider(gatewayId: number): Promise<PaymentProvider> {
    const gateway = await db.select().from(paymentGateways).where(eq(paymentGateways.id, gatewayId)).limit(1);
    
    if (!gateway[0]) {
      throw new Error('Gateway not found');
    }

    switch (gateway[0].provider) {
      case 'stripe':
        return new StripeProvider(gateway[0].apiKey);
      case 'polar':
        return new PolarProvider(gateway[0].apiKey);
      default:
        throw new Error(`Unsupported provider: ${gateway[0].provider}`);
    }
  }

  static async createTransaction(data: {
    userId: string;
    planId: number;
    gatewayId: number;
    amount: number;
    currency: string;
    couponId?: number;
  }) {
    const uuid = Math.random().toString(36).substring(2, 15);
    
    await db.insert(paymentTransactions).values({
      uuid,
      userId: data.userId,
      planId: data.planId,
      gatewayId: data.gatewayId,
      amount: data.amount,
      currency: data.currency,
      status: 'pending',
      couponId: data.couponId,
    });

    return uuid;
  }

  static async applyCoupon(couponCode: string, amount: number): Promise<number> {
    // Implement coupon logic
    return amount;
  }
}
