import { db } from '@/lib/db';
import { plans, userSubscriptions, payments, paymentTriggers } from '@/lib/db/payment-schema';
import { user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export class PaymentManager {
  static async createPayment(data: {
    userId: string;
    planId: number;
    amount: number;
    gateway: string;
    gatewayPaymentId?: string;
  }) {
    const [payment] = await db.insert(payments).values({
      ...data,
      status: 'pending',
    }).returning();

    return payment;
  }

  static async completePayment(paymentId: number, gatewayPaymentId: string) {
    const [payment] = await db.update(payments)
      .set({ status: 'completed', gatewayPaymentId, updatedAt: new Date() })
      .where(eq(payments.id, paymentId))
      .returning();

    if (payment) {
      await this.executeTriggers('payment.success', payment.planId, payment.userId, payment);
    }

    return payment;
  }

  static async createSubscription(data: {
    userId: string;
    planId: number;
    gatewaySubscriptionId?: string;
    gatewayCustomerId?: string;
  }) {
    const plan = await db.select().from(plans).where(eq(plans.id, data.planId)).limit(1);
    if (!plan[0]) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now);
    
    if (plan[0].interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan[0].interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (plan[0].interval === 'lifetime') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 100);
    }

    const [subscription] = await db.insert(userSubscriptions).values({
      userId: data.userId,
      planId: data.planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      gatewaySubscriptionId: data.gatewaySubscriptionId,
      gatewayCustomerId: data.gatewayCustomerId,
    }).returning();

    await this.executeTriggers('subscription.created', data.planId, data.userId, subscription);

    return subscription;
  }

  static async cancelSubscription(subscriptionId: number) {
    const [subscription] = await db.update(userSubscriptions)
      .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, subscriptionId))
      .returning();

    if (subscription) {
      await this.executeTriggers('subscription.canceled', subscription.planId, subscription.userId, subscription);
    }

    return subscription;
  }

  static async getUserSubscription(userId: string) {
    const subscription = await db.select({
      subscription: userSubscriptions,
      plan: plans,
    })
      .from(userSubscriptions)
      .leftJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      ))
      .limit(1);

    return subscription[0] || null;
  }

  static async checkPermission(userId: string, permission: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription?.plan) return false;

    const permissions = subscription.plan.permissions as any;
    return permissions[permission] === true;
  }

  static async getUsageLimit(userId: string, limitKey: string): Promise<number | null> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription?.plan) return null;

    const permissions = subscription.plan.permissions as any;
    return permissions[limitKey] || null;
  }

  private static async executeTriggers(event: string, planId: number | null, userId: string, data: any) {
    const triggers = await db.select()
      .from(paymentTriggers)
      .where(and(
        eq(paymentTriggers.event, event),
        eq(paymentTriggers.active, true),
        planId ? eq(paymentTriggers.planId, planId) : undefined
      ) as any);

    for (const trigger of triggers) {
      for (const action of trigger.actions as any[]) {
        await this.executeAction(action, userId, data);
      }
    }
  }

  private static async executeAction(action: any, userId: string, data: any) {
    switch (action.type) {
      case 'credits':
        await db.update(user)
          .set({ credits: action.config.amount })
          .where(eq(user.id, userId));
        break;
      
      case 'role':
        await db.update(user)
          .set({ role: action.config.role })
          .where(eq(user.id, userId));
        break;

      case 'webhook':
        fetch(action.config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, data, action }),
        }).catch(console.error);
        break;

      case 'email':
        // Implement email sending
        break;
    }
  }
}
