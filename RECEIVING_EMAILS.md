# How to Receive Emails

## Problem
Webhooks can't reach `localhost:3000` - you need a public URL.

## Solution 1: Use ngrok (for testing)

1. Install ngrok:
```bash
npm install -g ngrok
```

2. In a new terminal, run:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Resend dashboard:
   - Go to Webhooks
   - Add webhook: `https://abc123.ngrok.io/api/admin/emails/webhook`
   - Select event: `email.received`

5. Send test email to `ankit@blazeneuro.com`

6. Check your app inbox - email should appear!

## Solution 2: Deploy to production

Deploy to Vercel/Netlify and use:
- Webhook URL: `https://blazeneuro.com/api/admin/emails/webhook`

## Verify webhook is working

Check Resend webhook logs to see if requests are successful (200 status).

## Current webhook endpoint

Your webhook is ready at: `/api/admin/emails/webhook`

It handles:
- `email.received` - Stores incoming emails in inbox
- `email.delivered` - Logs delivery confirmation
