const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media'
  },
  trans: {
    ffmpeg: '/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

nms.on('preConnect', (id, args) => {
  console.log('[preConnect]', `id=${id}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[postConnect]', `id=${id}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[prePublish]', `id=${id} StreamPath=${StreamPath}`);
  if (StreamPath) {
    const streamKey = StreamPath.split('/').pop();
    console.log('✅ Stream key:', streamKey);
  }
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[postPublish]', `id=${id} StreamPath=${StreamPath}`);
  console.log('✅ Stream is LIVE!');
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[donePublish]', `id=${id} StreamPath=${StreamPath}`);
  console.log('⏹️  Stream ended');
});

nms.run();

console.log('');
console.log('🎥 RTMP Server Started!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📡 RTMP URL: rtmp://localhost:1935/live');
console.log('🌐 HLS URL:  http://localhost:8000/live/STREAM_KEY/index.m3u8');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('OBS Setup:');
console.log('  Server: rtmp://localhost:1935/live');
console.log('  Stream Key: Get from dashboard');
console.log('');
