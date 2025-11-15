# Deployment Guide - Live Streaming Platform

Complete guide for deploying your live streaming platform to production.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  OBS Studio │────▶│ RTMP Server  │────▶│ HLS Storage │
└─────────────┘     │  (Nginx)     │     │  (CDN/R2)   │
                    └──────────────┘     └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Next.js App │────▶│  Database   │
                    │  (Vercel)    │     │   (Neon)    │
                    └──────────────┘     └─────────────┘
```

## Option 1: Vercel + Railway (Recommended for Beginners)

### Step 1: Deploy Next.js to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `STRIPE_SECRET_KEY` (if using payments)

### Step 2: Deploy RTMP Server to Railway

1. Create account at https://railway.app
2. Create new project
3. Add Dockerfile deployment:

```bash
railway login
railway init
railway up
```

4. Get your Railway URL (e.g., `rtmp-server.railway.app`)
5. Update RTMP URL in your app

### Step 3: Configure Domain

1. Add custom domain in Vercel
2. Add custom domain in Railway for RTMP
3. Update DNS records

## Option 2: DigitalOcean Droplet (Full Control)

### Step 1: Create Droplet

1. Create Ubuntu 22.04 droplet ($6/month minimum)
2. SSH into server:
```bash
ssh root@your-server-ip
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx with RTMP
apt install -y nginx libnginx-mod-rtmp ffmpeg

# Install PM2
npm install -g pm2
```

### Step 3: Setup Nginx RTMP

```bash
# Copy nginx config
cp nginx.conf.example /etc/nginx/nginx.conf

# Create HLS directory
mkdir -p /tmp/hls
chmod 777 /tmp/hls

# Test config
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx
```

### Step 4: Deploy Next.js App

```bash
# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start server.mjs --name streaming-app
pm2 save
pm2 startup
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### Step 6: Configure Firewall

```bash
# Allow necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 1935  # RTMP
ufw allow 8080  # HLS
ufw enable
```

## Option 3: AWS (Enterprise Scale)

### Services Needed:
- **EC2**: Next.js app
- **MediaLive**: RTMP ingest
- **MediaPackage**: HLS packaging
- **CloudFront**: CDN delivery
- **RDS**: PostgreSQL database
- **S3**: VOD storage

### Estimated Cost:
- Small: $50-100/month
- Medium: $200-500/month
- Large: $1000+/month

See AWS documentation for detailed setup.

## Option 4: Cloudflare Stream (Easiest)

Skip self-hosting RTMP entirely:

```bash
npm install @cloudflare/stream
```

```typescript
// lib/cloudflare-stream.ts
import Stream from '@cloudflare/stream';

const stream = new Stream({
  accountId: process.env.CF_ACCOUNT_ID,
  apiToken: process.env.CF_API_TOKEN,
});

export async function createLiveStream(title: string) {
  const liveInput = await stream.liveInputs.create({
    meta: { name: title },
    recording: { mode: 'automatic' },
  });
  
  return {
    rtmpUrl: liveInput.rtmps.url,
    streamKey: liveInput.rtmps.streamKey,
    playbackUrl: liveInput.playback.hls,
  };
}
```

Cost: $1 per 1000 minutes delivered

## Database Setup (Neon)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to environment variables
5. Run migrations:
```bash
npm run db:push
```

## CDN Setup for VOD

### Using Cloudflare R2:

```bash
npm install @aws-sdk/client-s3
```

```typescript
// lib/r2-storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadVOD(file: Buffer, key: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'video/mp4',
  }));
  
  return `https://your-r2-domain.com/${key}`;
}
```

## Monitoring & Analytics

### Setup Monitoring:

```bash
# Install monitoring tools
npm install @vercel/analytics @sentry/nextjs
```

### Track Metrics:
- Active streams
- Concurrent viewers
- Bandwidth usage
- Error rates
- Revenue (if paid)

## Scaling Considerations

### Small Scale (< 100 concurrent viewers):
- Single server
- Basic Nginx RTMP
- Neon free tier

### Medium Scale (100-1000 viewers):
- Load balancer
- Multiple RTMP servers
- CDN for HLS delivery
- Neon paid tier

### Large Scale (1000+ viewers):
- AWS MediaLive/MediaPackage
- CloudFront CDN
- Auto-scaling
- Database read replicas

## Backup Strategy

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Backup VOD files
aws s3 sync s3://your-bucket ./backups

# Automate with cron
0 2 * * * /path/to/backup-script.sh
```

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Stream keys validated
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Firewall rules set
- [ ] Regular security updates

## Performance Optimization

1. **Enable CDN**: Use CloudFront or Cloudflare
2. **Optimize HLS**: Reduce fragment size for lower latency
3. **Database Indexing**: Add indexes on frequently queried fields
4. **Caching**: Use Redis for session/chat data
5. **Image Optimization**: Use Next.js Image component

## Cost Estimation

### Minimal Setup (Hobby):
- Vercel: Free
- Railway: $5/month
- Neon: Free
- **Total: $5/month**

### Small Business:
- Vercel Pro: $20/month
- DigitalOcean: $12/month
- Neon: $19/month
- Cloudflare R2: $5/month
- **Total: $56/month**

### Growing Business:
- Vercel Pro: $20/month
- AWS EC2: $50/month
- RDS: $30/month
- CloudFront: $50/month
- S3: $20/month
- **Total: $170/month**

## Troubleshooting

### High Latency:
- Reduce HLS fragment size
- Use edge servers closer to viewers
- Consider WebRTC for sub-second latency

### Stream Buffering:
- Check server bandwidth
- Optimize video bitrate
- Use adaptive bitrate streaming

### Database Slow:
- Add indexes
- Use connection pooling
- Consider read replicas

## Support & Resources

- [Nginx RTMP Documentation](https://github.com/arut/nginx-rtmp-module)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Cloudflare Stream](https://developers.cloudflare.com/stream)

## Next Steps

1. Choose deployment option
2. Setup monitoring
3. Configure CDN
4. Test with real streams
5. Launch! 🚀
