# Payment Management System

A comprehensive all-in-one payment solution for managing multiple payment gateways, plans, pages, buttons, links, and coupons.

## Features

### 1. Payment Gateways
- **Multi-Gateway Support**: Integrate Stripe, Polar, Razorpay, PayPal, and more
- **Centralized Management**: Configure all payment providers from one dashboard
- **Webhook Handling**: Automatic webhook processing for payment events
- **Secure Storage**: Encrypted API keys and webhook secrets

### 2. Payment Plans
- **Flexible Pricing**: One-time, monthly, or yearly billing
- **Feature Lists**: Define features included in each plan
- **Multi-Currency**: Support for USD, EUR, GBP, and more
- **Gateway Integration**: Link plans to specific payment gateways

### 3. Payment Pages
- **Hosted Checkout**: Beautiful payment pages hosted on your domain
- **Custom Amounts**: Allow customers to enter custom payment amounts
- **Min/Max Limits**: Set minimum and maximum payment amounts
- **Success/Cancel URLs**: Redirect customers after payment

### 4. Payment Buttons
- **Embeddable**: Generate buttons to embed on any website
- **Customizable**: Configure button text and styling
- **Quick Checkout**: Direct customers to payment flow

### 5. Payment Links
- **Shareable URLs**: Create links to share via email, social media, etc.
- **Usage Limits**: Set maximum number of uses per link
- **Expiration**: Configure link expiration dates
- **Tracking**: Monitor link usage and conversions

### 6. Coupons
- **Discount Types**: Percentage or fixed amount discounts
- **Usage Limits**: Control how many times a coupon can be used
- **Expiration**: Set coupon expiration dates
- **Plan Restrictions**: Apply coupons to specific plans

### 7. Transactions
- **Complete History**: View all payment transactions
- **Status Tracking**: Monitor pending, completed, failed, and refunded payments
- **Gateway Details**: See which gateway processed each transaction
- **Metadata**: Store custom data with each transaction

### 8. Webhooks
- **Automatic Processing**: Handle payment events from all gateways
- **Event Logging**: Track all webhook events and responses
- **Error Handling**: Log and debug webhook failures
- **Status Updates**: Automatically update transaction statuses

## Setup

### 1. Database Migration

Run the database migration to create payment tables:

```bash
npm run db:push
```

### 2. Add Payment Gateway

1. Go to `/admin/payments`
2. Click "Gateways" tab
3. Click "Add Gateway"
4. Enter gateway details:
   - Name: Your gateway name
   - Provider: stripe, polar, razorpay, etc.
   - API Key: Your gateway API key
   - Webhook Secret: Your webhook secret

### 3. Create Payment Plan

1. Go to `/admin/payments`
2. Click "Plans" tab
3. Click "Create Plan"
4. Configure plan:
   - Name and description
   - Amount and currency
   - Billing interval
   - Features list

### 4. Create Payment Page

1. Go to `/admin/payments`
2. Click "Payment Pages" tab
3. Click "Create Page"
4. Configure page:
   - Title and description
   - Select plan
   - Custom amount options
   - Success/cancel URLs

### 5. Configure Webhooks

Set up webhooks in your payment gateway dashboard:

**Webhook URL**: `https://yourdomain.com/api/webhooks/payments?gateway=GATEWAY_ID`

Replace `GATEWAY_ID` with your gateway's database ID.

## Usage

### Payment Pages

Access payment pages at:
```
https://yourdomain.com/pay/[PAGE_UUID]
```

### Payment Buttons

Embed buttons using:
```html
<a href="https://yourdomain.com/pay/[BUTTON_UUID]">
  <button>Pay Now</button>
</a>
```

### Payment Links

Share links directly:
```
https://yourdomain.com/pay/[LINK_UUID]
```

### Apply Coupons

Customers can apply coupon codes during checkout to receive discounts.

## API Endpoints

### Admin Endpoints (Require Admin Access)

- `POST /api/admin/payments/gateways` - Create gateway
- `GET /api/admin/payments/gateways` - List gateways
- `POST /api/admin/payments/plans` - Create plan
- `GET /api/admin/payments/plans` - List plans
- `POST /api/admin/payments/pages` - Create payment page
- `GET /api/admin/payments/pages` - List payment pages
- `POST /api/admin/payments/buttons` - Create button
- `GET /api/admin/payments/buttons` - List buttons
- `POST /api/admin/payments/links` - Create link
- `GET /api/admin/payments/links` - List links
- `POST /api/admin/payments/coupons` - Create coupon
- `GET /api/admin/payments/coupons` - List coupons

### Public Endpoints

- `POST /api/webhooks/payments?gateway=ID` - Webhook handler

## Database Schema

### Payment Tables

- `paymentGateways` - Payment provider configurations
- `paymentPlans` - Subscription and one-time plans
- `paymentPages` - Hosted payment pages
- `paymentButtons` - Embeddable payment buttons
- `paymentLinks` - Shareable payment links
- `coupons` - Discount codes
- `paymentTransactions` - Payment history
- `webhookLogs` - Webhook event logs

## Security

- API keys are stored securely in the database
- Admin-only access to payment management
- Webhook signature verification
- Transaction logging for audit trails
- Encrypted sensitive data

## Supported Payment Gateways

- **Stripe**: Full support for checkout sessions and webhooks
- **Polar**: Subscription and one-time payments
- **Razorpay**: Coming soon
- **PayPal**: Coming soon
- **Custom**: Extend with your own provider

## Extending

To add a new payment provider:

1. Create provider class in `/lib/payment/[provider].ts`
2. Implement `PaymentProvider` interface
3. Add provider to `UnifiedPaymentManager`
4. Update gateway creation form

## Troubleshooting

### Webhooks Not Working

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check webhook logs in database
4. Ensure gateway is active

### Transactions Not Updating

1. Check webhook is configured
2. Verify transaction UUID in metadata
3. Check webhook logs for errors

### Payment Page Not Found

1. Verify page UUID is correct
2. Check page is active
3. Ensure plan is configured

## Next Steps

1. Add transaction dashboard with charts
2. Implement refund functionality
3. Add email notifications for payments
4. Create customer portal
5. Add analytics and reporting
6. Implement subscription management
7. Add invoice generation
8. Create payment receipts
