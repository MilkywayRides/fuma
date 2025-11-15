# Live Streaming Setup Guide

This guide will help you set up the complete live streaming infrastructure for your platform.

## Architecture Overview

```
OBS/Camera → RTMP Server (Nginx) → HLS Transcoding (FFmpeg) → HLS Delivery → Browser (HLS.js)
```

## 1. Install Nginx with RTMP Module

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx libnginx-mod-rtmp ffmpeg
```

### macOS (Homebrew):
```bash
brew tap denji/nginx
brew install nginx-full --with-rtmp-module
brew install ffmpeg
```

## 2. Configure Nginx RTMP

Create/edit `/etc/nginx/nginx.conf` or `/usr/local/etc/nginx/nginx.conf`:

```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        
        application live {
            live on;
            record off;
            
            # HLS settings
            hls on;
            hls_path /tmp/hls;
            hls_fragment 3;
            hls_playlist_length 60;
            
            # Authentication (optional)
            on_publish http://localhost:3000/api/streams/auth;
        }
    }
}

http {
    server {
        listen 8080;
        
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /tmp;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
        }
    }
}
```

## 3. Create HLS Directory

```bash
sudo mkdir -p /tmp/hls
sudo chmod 777 /tmp/hls
```

## 4. Start Nginx

```bash
# Ubuntu/Debian
sudo systemctl start nginx
sudo systemctl enable nginx

# macOS
brew services start nginx
```

## 5. OBS Studio Setup

1. Download OBS Studio: https://obsproject.com/
2. Open OBS → Settings → Stream
3. Service: Custom
4. Server: `rtmp://your-server-ip:1935/live`
5. Stream Key: Get from your stream dashboard
6. Click "Start Streaming"

## 6. Alternative: Use Cloud Services (Production)

For production, consider these services instead of self-hosting:

### Option A: Cloudflare Stream
- Easy setup, global CDN
- $1/1000 minutes delivered
- https://www.cloudflare.com/products/cloudflare-stream/

### Option B: AWS MediaLive + MediaPackage
- Enterprise-grade streaming
- Pay-as-you-go pricing
- Full control over infrastructure

### Option C: Mux
- Developer-friendly API
- $0.005/minute streamed
- https://mux.com/

## 7. VOD Storage Setup

### Using Cloudflare R2 (Free 10GB):

```bash
npm install @aws-sdk/client-s3
```

Add to `.env`:
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

## 8. FFmpeg Recording for VOD

Add to nginx.conf:
```nginx
application live {
    live on;
    record all;
    record_path /tmp/recordings;
    record_suffix -%Y-%m-%d-%H-%M-%S.flv;
    
    # Convert to MP4 after stream ends
    exec_record_done ffmpeg -i $path -c copy /tmp/vod/$basename.mp4;
}
```

## 9. Testing Your Setup

### Test RTMP Stream:
```bash
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/test_stream_key
```

### Test HLS Playback:
Open browser: `http://localhost:8080/hls/test_stream_key/index.m3u8`

## 10. Production Deployment

### Using Railway (Free tier available):

1. Create `Dockerfile`:
```dockerfile
FROM nginx:alpine
RUN apk add --no-cache nginx-mod-rtmp ffmpeg
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 1935 8080
CMD ["nginx", "-g", "daemon off;"]
```

2. Deploy to Railway:
```bash
railway login
railway init
railway up
```

### Using Render (Free tier):

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: rtmp-server
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: PORT
        value: 8080
```

## 11. Security Considerations

1. **Stream Key Validation**: Implement `/api/streams/auth` endpoint
2. **Rate Limiting**: Limit concurrent streams per user
3. **HTTPS**: Use SSL for HLS delivery
4. **Token Authentication**: Add JWT tokens to HLS URLs

## 12. Monitoring

Add to your dashboard:
- Active streams count
- Viewer count per stream
- Bandwidth usage
- Stream health (bitrate, fps, dropped frames)

## Next Steps

1. Set up Nginx RTMP server
2. Test with OBS Studio
3. Configure VOD storage (R2/S3)
4. Add payment integration for paid streams
5. Implement analytics and monitoring

## Troubleshooting

### Stream not appearing:
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify RTMP port 1935 is open
- Check stream key is correct

### HLS playback issues:
- Verify HLS files are being created in `/tmp/hls`
- Check browser console for errors
- Test with VLC player first

### High latency:
- Reduce `hls_fragment` to 1-2 seconds
- Use Low Latency HLS (LL-HLS)
- Consider WebRTC for sub-second latency

## Resources

- Nginx RTMP Module: https://github.com/arut/nginx-rtmp-module
- HLS.js Documentation: https://github.com/video-dev/hls.js
- FFmpeg Documentation: https://ffmpeg.org/documentation.html
- OBS Studio: https://obsproject.com/
