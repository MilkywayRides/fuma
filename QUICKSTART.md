# Quick Start Guide - Live Streaming Platform

Get your live streaming platform up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- OBS Studio (for streaming)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

## Step 3: Setup Database

```bash
npm run db:push
```

## Step 4: Create Admin Account

```bash
# Sign up at http://localhost:3000/sign-up
# Then run:
npm run set-admin your@email.com Admin
```

## Step 5: Start the Server

```bash
npm run dev:socket
```

This starts:
- Next.js app on http://localhost:3000
- Socket.IO server for real-time chat
- API routes for streaming

## Step 6: Create Your First Stream

1. Go to http://localhost:3000/streams/create
2. Fill in stream details:
   - Title: "My First Stream"
   - Description: "Testing live streaming"
   - Toggle "This is a live class" if needed
   - Toggle "Paid stream/class" and set price if needed
3. Click "Create Stream"
4. You'll be redirected to the dashboard with your stream key

## Step 7: Setup OBS Studio

1. Download OBS: https://obsproject.com/
2. Open OBS → Settings → Stream
3. Service: **Custom**
4. Server: `rtmp://localhost:1935/live` (or your server IP)
5. Stream Key: Copy from your dashboard
6. Click OK

## Step 8: Start Streaming!

1. In OBS, click "Start Streaming"
2. In your browser, go to `/stream/[your-stream-id]`
3. You should see your live stream!

## Testing Without OBS

You can test with a video file:

```bash
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/YOUR_STREAM_KEY
```

## Features to Try

### 1. Live Chat
- Open the stream page
- Type messages in the chat box
- Messages appear in real-time for all viewers

### 2. Paid Streams
- Create a stream with "Paid" enabled
- Set a price
- Users must enroll before watching

### 3. Live Classes
- Enable "This is a live class"
- Schedule a time
- Track attendance

### 4. VOD (Video on Demand)
- After stream ends, recording is available
- Viewers can watch anytime

## Production Deployment

### Option 1: Vercel + Railway

**Frontend (Vercel):**
```bash
vercel deploy
```

**RTMP Server (Railway):**
1. Create `Dockerfile` (see STREAMING_SETUP.md)
2. Deploy to Railway
3. Update RTMP URL in your app

### Option 2: All-in-One (VPS)

1. Get a VPS (DigitalOcean, Linode, etc.)
2. Install Nginx with RTMP module
3. Deploy Next.js app
4. Configure domain and SSL

See [STREAMING_SETUP.md](STREAMING_SETUP.md) for detailed instructions.

## Troubleshooting

### Stream not showing up?
- Check if Nginx RTMP is running
- Verify stream key is correct
- Check browser console for errors

### Chat not working?
- Make sure Socket.IO server is running
- Check if port 3000 is accessible
- Look for WebSocket connection errors

### Can't create stream?
- Make sure you're logged in
- Check database connection
- Verify API routes are working

## Next Steps

1. **Setup Nginx RTMP** - See [STREAMING_SETUP.md](STREAMING_SETUP.md)
2. **Configure VOD Storage** - Use Cloudflare R2 or AWS S3
3. **Add Payment Integration** - Connect Stripe for paid streams
4. **Customize UI** - Edit components in `/components`
5. **Add Analytics** - Track views, engagement, revenue

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Community: Discord (coming soon)

## Resources

- [STREAMING_SETUP.md](STREAMING_SETUP.md) - Complete streaming setup
- [OAUTH_SETUP.md](OAUTH_SETUP.md) - OAuth integration
- [PAYMENT_SETUP.md](PAYMENT_SETUP.md) - Payment system setup

Happy Streaming! 🎥✨
