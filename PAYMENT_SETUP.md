# Payment System Setup Guide

A comprehensive payment system with subscription plans, admin management, and payment triggers.

## Features

- 💳 Multiple subscription plans (Free, Pro, Enterprise)
- 🎯 Payment triggers for automation
- 🔧 Admin interface for plan management
- 💰 Stripe integration
- 🎨 Beautiful pricing page
- 🔐 Permission-based access control
- 📊 Usage limits per plan

## Database Schema

The payment system includes:
- `plans` - Subscription plans with features and permissions
- `userSubscriptions` - User subscription records
- `payments` - Payment transactions
- `paymentTriggers` - Automated actions on payment events

## Setup Instructions

### 1. Push Database Schema

```bash
npm run db:push
```

### 2. Initialize Payment Tables

```bash
npm run db:init-payment
```

This creates default plans:
- **Free**: $0/month - 5 flows, 100 executions
- **Pro**: $29/month - Unlimited flows and executions
- **Enterprise**: $99/month - Everything + custom domain

### 3. Configure Stripe

Ensure these environment variables are set in `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Setup Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

## Admin Interface

Access at `/admin/plans` to:
- Create/edit/delete subscription plans
- Set pricing and intervals (monthly/yearly/lifetime)
- Define features and permissions
- Create payment triggers
- Configure automated actions

### Plan Configuration

**Features**: User-facing benefits displayed on pricing page

**Permissions**: System-level access controls
- `maxFlows`: Maximum flow scripts (-1 = unlimited)
- `maxExecutions`: Monthly execution limit
- `maxApiCalls`: API request limit
- `maxEmailAddresses`: Email addresses allowed
- `unlimitedBooks`: Access to all premium books
- `prioritySupport`: Priority support access
- `customDomain`: Custom domain support
- `apiAccess`: API access enabled

## Payment Triggers

Automate actions on payment events:

### Available Events
- `payment.success` - Payment completed
- `payment.failed` - Payment failed
- `subscription.created` - New subscription
- `subscription.canceled` - Subscription canceled
- `subscription.renewed` - Subscription renewed
- `subscription.expired` - Subscription expired

### Action Types

**1. Credits**
```json
{
  "type": "credits",
  "config": { "amount": 100 }
}
```

**2. Role Assignment**
```json
{
  "type": "role",
  "config": { "role": "Premium" }
}
```

**3. Webhook**
```json
{
  "type": "webhook",
  "config": { "url": "https://your-webhook.com/endpoint" }
}
```

**4. Email**
```json
{
  "type": "email",
  "config": {
    "template": "welcome",
    "subject": "Welcome!"
  }
}
```

**5. Flow Execution**
```json
{
  "type": "flow",
  "config": { "flowId": "abc123" }
}
```

## Usage in Code

### Check User Subscription

```typescript
import { PaymentManager } from '@/lib/payment/manager';

const subscription = await PaymentManager.getUserSubscription(userId);
if (subscription?.plan) {
  console.log('User plan:', subscription.plan.name);
}
```

### Check Permission

```typescript
const hasAccess = await PaymentManager.checkPermission(userId, 'apiAccess');
if (!hasAccess) {
  return { error: 'Upgrade to Pro for API access' };
}
```

### Get Usage Limit

```typescript
const maxFlows = await PaymentManager.getUsageLimit(userId, 'maxFlows');
if (maxFlows !== null && currentFlows >= maxFlows) {
  return { error: 'Flow limit reached' };
}
```

## Public Pages

- `/pricing` - Public pricing page with all active plans
- `/payment/success` - Payment success redirect
- `/payment/cancel` - Payment canceled redirect

## API Endpoints

### Public
- `GET /api/plans` - List active plans
- `POST /api/checkout` - Create checkout session

### Admin Only
- `GET /api/admin/plans` - List all plans
- `POST /api/admin/plans` - Create plan
- `PUT /api/admin/plans/[id]` - Update plan
- `DELETE /api/admin/plans/[id]` - Delete plan
- `GET /api/admin/triggers` - List triggers
- `POST /api/admin/triggers` - Create trigger
- `PUT /api/admin/triggers/[id]` - Update trigger
- `DELETE /api/admin/triggers/[id]` - Delete trigger

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Example: Creating a Custom Plan

```typescript
const plan = {
  name: "Startup",
  description: "Perfect for startups",
  price: 4900, // $49.00 in cents
  currency: "usd",
  interval: "monthly",
  features: [
    "50 Flow Scripts",
    "10,000 Executions/month",
    "Priority Support"
  ],
  permissions: {
    maxFlows: 50,
    maxExecutions: 10000,
    maxApiCalls: 50000,
    prioritySupport: true
  },
  active: true,
  popular: false
};
```

## Example: Creating a Trigger

```typescript
const trigger = {
  name: "Pro Plan Welcome",
  event: "subscription.created",
  planId: 2, // Pro plan ID
  actions: [
    {
      type: "credits",
      config: { amount: 500 }
    },
    {
      type: "role",
      config: { role: "Pro" }
    },
    {
      type: "webhook",
      config: { url: "https://slack.com/webhook" }
    }
  ],
  active: true
};
```

## Testing

1. Create test plans in admin interface
2. Visit `/pricing` to see plans
3. Click "Subscribe Now" to test checkout
4. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Production Checklist

- [ ] Replace Stripe test keys with live keys
- [ ] Configure production webhook endpoint
- [ ] Set up proper error monitoring
- [ ] Test all payment triggers
- [ ] Configure email templates
- [ ] Set up subscription renewal notifications
- [ ] Test cancellation flow
- [ ] Configure refund policy

## Support

For issues or questions, check:
- Stripe Dashboard for payment logs
- Database `payments` table for transaction records
- Webhook logs in Stripe Dashboard
