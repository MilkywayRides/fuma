# Testing Guide

Complete guide for testing your live streaming platform.

## Quick Test Checklist

### ✅ Basic Setup
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Environment variables loaded
- [ ] Pages load correctly

### ✅ Authentication
- [ ] Sign up works
- [ ] Email verification sent
- [ ] Sign in works
- [ ] Password reset works
- [ ] Session persists

### ✅ Streaming
- [ ] Create stream works
- [ ] Stream key generated
- [ ] RTMP connection accepted
- [ ] HLS playback works
- [ ] Chat messages send/receive

### ✅ Payments
- [ ] Payment page loads
- [ ] Stripe checkout works
- [ ] Enrollment recorded
- [ ] Access granted after payment

## Detailed Testing

## 1. Authentication Testing

### Sign Up Flow
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

**Expected**: 
- User created in database
- Verification email sent
- Session cookie set

### Sign In Flow
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Expected**:
- Session created
- User data returned
- Cookie set

## 2. Stream Creation Testing

### Create Stream
```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test Stream",
    "description": "Testing streaming",
    "isClass": false,
    "isPaid": false
  }'
```

**Expected**:
- Stream created in database
- Unique stream key generated
- UUID assigned
- Returns stream object

### Get Stream
```bash
curl http://localhost:3000/api/streams/STREAM_UUID
```

**Expected**:
- Stream data returned
- Status is 'idle'
- All fields present

## 3. RTMP Streaming Testing

### Test with FFmpeg
```bash
# Stream a test video
ffmpeg -re -i test.mp4 \
  -c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k \
  -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 \
  -f flv rtmp://localhost:1935/live/YOUR_STREAM_KEY
```

**Expected**:
- RTMP connection accepted
- HLS files created in `/tmp/hls/YOUR_STREAM_KEY/`
- Stream status updated to 'live'

### Test HLS Playback
```bash
# Check if HLS playlist exists
curl http://localhost:8080/hls/YOUR_STREAM_KEY/index.m3u8
```

**Expected**:
- M3U8 playlist returned
- Contains .ts segment files
- Updates every few seconds

### Test in Browser
1. Open `http://localhost:3000/stream/STREAM_UUID`
2. Video player should show live stream
3. Check browser console for errors

**Expected**:
- Video loads and plays
- No HLS.js errors
- Smooth playback

## 4. Chat Testing

### Send Message
```bash
curl -X POST http://localhost:3000/api/streams/STREAM_UUID/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"message":"Hello from API!"}'
```

**Expected**:
- Message saved to database
- Socket.IO broadcasts message
- Appears in chat UI

### Socket.IO Testing
```javascript
// In browser console
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected'));
socket.emit('join:stream', 'STREAM_UUID');
socket.on('stream:message', (msg) => console.log('Message:', msg));
```

**Expected**:
- Connection established
- Joined stream room
- Receives messages

## 5. Enrollment Testing

### Free Stream
```bash
curl -X POST http://localhost:3000/api/streams/STREAM_UUID/enroll \
  -H "Cookie: your-session-cookie"
```

**Expected**:
- Enrollment created
- User can access stream
- Returns enrollment object

### Paid Stream
1. Create paid stream ($10)
2. Try to access without payment
3. Should show payment page
4. Complete Stripe checkout
5. Should grant access

**Expected**:
- Payment page shows correct price
- Stripe checkout works
- Payment recorded
- Access granted

## 6. VOD Testing

### Upload VOD
```bash
curl -X POST http://localhost:3000/api/streams/STREAM_UUID/upload-vod \
  -H "Cookie: your-session-cookie" \
  -F "file=@recording.mp4"
```

**Expected**:
- File uploaded
- VOD URL saved
- Stream status updated to 'ended'

### Play VOD
1. Open stream page
2. Should show VOD player
3. Video should play

**Expected**:
- Video loads
- Playback controls work
- No buffering issues

## 7. Performance Testing

### Load Testing with Artillery
```bash
npm install -g artillery

# Create test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get:
        url: "/streams"
    - get:
        url: "/stream/STREAM_UUID"
EOF

# Run test
artillery run load-test.yml
```

**Expected**:
- Response time < 200ms
- No errors
- Server stable

### Concurrent Viewers Test
```bash
# Simulate 100 concurrent viewers
for i in {1..100}; do
  curl http://localhost:3000/stream/STREAM_UUID &
done
```

**Expected**:
- All requests succeed
- Server doesn't crash
- Memory usage acceptable

## 8. Database Testing

### Check Tables
```sql
-- Connect to database
psql $DATABASE_URL

-- Check streams table
SELECT * FROM streams;

-- Check enrollments
SELECT * FROM "streamEnrollments";

-- Check messages
SELECT * FROM "streamMessages";
```

**Expected**:
- All tables exist
- Data is correct
- Foreign keys work

### Test Migrations
```bash
# Reset database
npm run db:push

# Check if all tables created
npm run db:studio
```

**Expected**:
- All tables created
- Indexes present
- Constraints working

## 9. Security Testing

### Test Authentication
```bash
# Try accessing protected route without auth
curl http://localhost:3000/api/streams \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Hack"}'
```

**Expected**:
- Returns 401 Unauthorized
- No data created

### Test Stream Key Validation
```bash
# Try streaming with invalid key
ffmpeg -re -i test.mp4 -f flv rtmp://localhost:1935/live/invalid_key
```

**Expected**:
- Connection rejected
- No HLS files created
- Error logged

### Test SQL Injection
```bash
curl "http://localhost:3000/api/streams?id=1' OR '1'='1"
```

**Expected**:
- Query fails safely
- No data leaked
- Error handled

## 10. Integration Testing

### Full User Journey
1. Sign up
2. Verify email
3. Sign in
4. Create stream
5. Start streaming from OBS
6. Open stream page
7. Send chat message
8. End stream
9. Check VOD

**Expected**:
- All steps work
- No errors
- Data persists

## 11. Browser Testing

### Test Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Test Features
- [ ] Video playback
- [ ] Chat functionality
- [ ] Responsive design
- [ ] Dark/light mode
- [ ] Navigation

## 12. Mobile Testing

### iOS
- [ ] Safari video playback
- [ ] Chat works
- [ ] Touch interactions
- [ ] Orientation changes

### Android
- [ ] Chrome video playback
- [ ] Chat works
- [ ] Touch interactions
- [ ] Orientation changes

## Automated Testing (Coming Soon)

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

## Common Issues & Solutions

### Issue: Stream not appearing
**Solution**: 
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Verify stream key
- Check RTMP port 1935 is open

### Issue: Chat not working
**Solution**:
- Check Socket.IO connection
- Verify WebSocket not blocked
- Check browser console

### Issue: High latency
**Solution**:
- Reduce HLS fragment size
- Use CDN
- Optimize network

### Issue: Database connection fails
**Solution**:
- Check DATABASE_URL
- Verify Neon connection
- Check SSL settings

## Monitoring in Production

### Setup Monitoring
```bash
npm install @sentry/nextjs
```

### Track Metrics
- Response times
- Error rates
- Active streams
- Concurrent viewers
- Database queries

### Alerts
- Server down
- High error rate
- Database issues
- Storage full

## Testing Checklist Before Launch

- [ ] All features tested
- [ ] Security audit done
- [ ] Performance optimized
- [ ] Mobile tested
- [ ] Browser compatibility checked
- [ ] Database backed up
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] CDN setup
- [ ] Backups automated

## Resources

- [Artillery Load Testing](https://artillery.io/)
- [Postman API Testing](https://www.postman.com/)
- [Playwright E2E Testing](https://playwright.dev/)
- [Jest Unit Testing](https://jestjs.io/)

## Need Help?

- Check logs: `npm run logs`
- Database studio: `npm run db:studio`
- Discord community: [Coming soon]
- GitHub issues: [Your repo]

Happy Testing! 🧪✨
