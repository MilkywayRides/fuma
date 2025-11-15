# OBS Connection Troubleshooting

## Quick Fix Checklist

### 1. Start the RTMP Server
```bash
npm run dev:rtmp
```

You should see:
```
🎥 RTMP Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 RTMP URL: rtmp://localhost:1935/live
🌐 HLS URL:  http://localhost:8000/live/STREAM_KEY/index.m3u8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Verify Server is Running
```bash
./test-rtmp.sh
```

### 3. OBS Settings (EXACT)
1. Open OBS Studio
2. **Settings** → **Stream**
3. **Service**: Custom
4. **Server**: `rtmp://localhost:1935/live` (exactly this)
5. **Stream Key**: Copy from your dashboard (e.g., `jycl8dfbi29`)
6. Click **OK**
7. Click **Start Streaming**

## Common Issues

### Issue 1: "Failed to connect to server"

**Cause**: RTMP server not running

**Fix**:
```bash
# Terminal 1: Start RTMP server
npm run dev:rtmp

# Terminal 2: Start Next.js
npm run dev:socket

# Or start both:
npm run dev:all
```

### Issue 2: "Connection timed out"

**Cause**: Wrong RTMP URL

**Fix**: Make sure you're using:
- `rtmp://localhost:1935/live` (NOT `rtmp://your-server.com/live`)

### Issue 3: "Invalid stream key"

**Cause**: Wrong stream key or stream doesn't exist

**Fix**:
1. Go to `/admin/streams/dashboard/[your-stream-id]`
2. Copy the exact stream key shown
3. Paste in OBS (no extra spaces)

### Issue 4: Port already in use

**Error**: `EADDRINUSE: address already in use :::1935`

**Fix**:
```bash
# Find what's using port 1935
lsof -i :1935

# Kill the process
kill -9 [PID]

# Or use different port in rtmp-server.js
```

### Issue 5: FFmpeg not found

**Error**: `FFmpeg not found`

**Fix**:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

## Testing Without OBS

### Test with FFmpeg:
```bash
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000 \
  -c:v libx264 -preset veryfast -b:v 1000k \
  -c:a aac -b:a 128k \
  -f flv rtmp://localhost:1935/live/YOUR_STREAM_KEY
```

### Test with VLC:
1. Open VLC
2. Media → Open Network Stream
3. URL: `http://localhost:8000/live/YOUR_STREAM_KEY/index.m3u8`
4. Play

## Verify Everything is Working

### 1. Check RTMP Server Logs
You should see:
```
[NodeEvent on preConnect] id=xxx
[NodeEvent on postConnect] id=xxx
[NodeEvent on prePublish] StreamPath=/live/YOUR_KEY
✅ Stream started successfully!
```

### 2. Check HLS Files
```bash
ls -la media/live/YOUR_STREAM_KEY/
# Should show: index.m3u8 and .ts files
```

### 3. Check Browser
1. Go to `/stream/[your-stream-id]`
2. Open browser console (F12)
3. Should see video loading

## OBS Recommended Settings

### Output Settings:
- **Output Mode**: Simple
- **Video Bitrate**: 2500 Kbps
- **Encoder**: x264
- **Audio Bitrate**: 160

### Video Settings:
- **Base Resolution**: 1920x1080
- **Output Resolution**: 1280x720
- **FPS**: 30

### Advanced Settings:
- **Keyframe Interval**: 2 seconds

## Still Not Working?

### Check Firewall:
```bash
# Ubuntu/Debian
sudo ufw allow 1935
sudo ufw allow 8000

# macOS
# System Preferences → Security & Privacy → Firewall
```

### Check Logs:
```bash
# RTMP server logs (in terminal where you ran npm run dev:rtmp)
# Next.js logs (in terminal where you ran npm run dev:socket)
```

### Test Connection:
```bash
# Test if RTMP port is open
telnet localhost 1935

# Test if HLS port is open
curl http://localhost:8000
```

## Production Setup

For production, don't use this localhost setup. Use:
- **Nginx RTMP** (see STREAMING_SETUP.md)
- **Cloudflare Stream** (easiest)
- **AWS MediaLive** (enterprise)

## Need More Help?

1. Check server logs for errors
2. Verify all ports are available
3. Make sure FFmpeg is installed
4. Try restarting both servers
5. Check OBS logs: Help → Log Files

## Quick Commands

```bash
# Start everything
npm run dev:all

# Test RTMP server
./test-rtmp.sh

# Check ports
lsof -i :1935
lsof -i :8000

# View logs
tail -f media/live/*/index.m3u8
```
