# Deployment Guide

## Prerequisites

1. Node.js >= 20.9.0
2. Neon PostgreSQL database
3. Environment variables configured

## Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

### Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `BETTER_AUTH_URL` - Your production URL (e.g., https://yourdomain.com)
- `NEXT_PUBLIC_SITE_URL` - Same as BETTER_AUTH_URL

### Optional (OAuth)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`

### Optional (Email)
- `RESEND_API_KEY` - For email verification
- `DOMAIN` - Your domain for emails

### Optional (AI Features)
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `XAI_API_KEY`

### Optional (Payments)
- Polar: `POLAR_API_KEY`, `POLAR_PRODUCT_ID`, `POLAR_WEBHOOK_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Optional (Flow Execution)
- `MODAL_ENDPOINT_URL` - Deploy backend first

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add all other env vars
```

5. Push database schema:
```bash
npm run db:push
```

6. Initialize settings (optional):
```bash
npm run db:init-settings
```

7. Set admin user:
```bash
npm run set-admin your@email.com Admin
```

## Deploy to Other Platforms

### Railway
1. Connect your GitHub repo
2. Add environment variables
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repo
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### Self-Hosted
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Post-Deployment

1. Test authentication flow
2. Create first admin user
3. Test book creation and purchases
4. Verify payment webhooks (if using Stripe/Polar)
5. Test community chat features

## Troubleshooting

- **Build fails**: Ensure Node.js >= 20.9.0
- **Database errors**: Check DATABASE_URL and run `npm run db:push`
- **Auth issues**: Verify BETTER_AUTH_SECRET and BETTER_AUTH_URL match production
- **Payment webhooks**: Configure webhook URLs in Stripe/Polar dashboard
