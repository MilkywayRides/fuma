#!/bin/bash

echo "Testing RTMP Server Connection..."
echo ""

# Check if port 1935 is listening
if lsof -Pi :1935 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ RTMP server is running on port 1935"
else
    echo "❌ RTMP server is NOT running on port 1935"
    echo "   Run: npm run dev:rtmp"
    exit 1
fi

# Check if port 8000 is listening
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ HLS server is running on port 8000"
else
    echo "❌ HLS server is NOT running on port 8000"
fi

echo ""
echo "RTMP Server Status: READY"
echo ""
echo "OBS Settings:"
echo "  Server: rtmp://localhost:1935/live"
echo "  Stream Key: [Get from your dashboard]"
echo ""
