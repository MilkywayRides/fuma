# RTMP Server - Localhost Setup

## Quick Start

### 1. Start Both Servers
```bash
npm run dev:all
```

This starts:
- Next.js app on http://localhost:3000
- RTMP server on rtmp://localhost:1935/live
- HLS server on http://localhost:8000

### 2. Or Start Separately

**Terminal 1 - Next.js + Socket.IO:**
```bash
npm run dev:socket
```

**Terminal 2 - RTMP Server:**
```bash
npm run dev:rtmp
```

## OBS Studio Setup

1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. **Service**: Custom
4. **Server**: `rtmp://localhost:1935/live`
5. **Stream Key**: Get from your stream dashboard at `/admin/streams/dashboard/[id]`
6. Click **OK**
7. Click **Start Streaming**

## Testing

### Check if RTMP server is running:
```bash
# You should see this in terminal:
RTMP Server running on rtmp://localhost:1935/live
HLS available at http://localhost:8000/live/STREAM_KEY/index.m3u8
```

### Watch your stream:
1. Start streaming from OBS
2. Go to http://localhost:3000/stream/[your-stream-id]
3. Video should start playing automatically

## Troubleshooting

### OBS can't connect:
- Make sure RTMP server is running (`npm run dev:rtmp`)
- Check if port 1935 is available
- Verify stream key is correct

### Video not playing:
- Check browser console for errors
- Verify HLS server is running on port 8000
- Make sure stream status is "live" in database

### FFmpeg not found:
```bash
# Install FFmpeg
# Ubuntu/Debian:
sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Windows:
# Download from https://ffmpeg.org/download.html
```

## How It Works

```
OBS Studio
    ↓ RTMP (port 1935)
RTMP Server (node-media-server)
    ↓ Transcode with FFmpeg
HLS Files (.m3u8 + .ts segments)
    ↓ HTTP (port 8000)
Browser (HLS.js player)
```

## Production

For production, use:
- Nginx RTMP module (see STREAMING_SETUP.md)
- Cloudflare Stream
- AWS MediaLive

This localhost setup is for **development only**!

## Ports Used

- 3000 - Next.js app
- 1935 - RTMP ingest
- 8000 - HLS delivery

Make sure these ports are available!
