# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Live Streaming Platform                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Teacher    │         │   Student    │         │   Viewer     │
│  (Streamer)  │         │  (Enrolled)  │         │   (Guest)    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ OBS Studio             │ Browser                │ Browser
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                      │  │
│  │  - Server Components  - Client Components  - API Routes  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │ RTMP                   │ HTTP/WS                │ HTTP
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ RTMP Server  │  │  Socket.IO   │  │  REST API    │         │
│  │   (Nginx)    │  │   (Chat)     │  │  (Next.js)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ HLS              │ WebSocket        │ PostgreSQL
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Storage & Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  HLS Files   │  │   Messages   │  │  PostgreSQL  │         │
│  │  (/tmp/hls)  │  │  (In-Memory) │  │    (Neon)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                               │
│  │  VOD Files   │                                               │
│  │  (R2/S3)     │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

### 1. Frontend Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pages:                                                      │
│  ├── /streams              → Browse streams                 │
│  ├── /streams/create       → Create new stream              │
│  ├── /stream/[id]          → Watch stream/VOD               │
│  └── /streams/dashboard/[id] → Teacher dashboard            │
│                                                              │
│  Components:                                                 │
│  ├── VideoPlayer           → HLS.js player                  │
│  ├── ChatBox               → Real-time chat UI              │
│  ├── StreamCard            → Stream preview card            │
│  └── EnrollButton          → Enrollment/payment             │
│                                                              │
│  State Management:                                           │
│  ├── React Hooks           → Local state                    │
│  ├── Socket.IO Client      → Real-time updates             │
│  └── Fetch API             → Server data                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. API Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/streams                                                │
│  ├── GET     → List all streams                             │
│  ├── POST    → Create new stream                            │
│  └── [id]                                                    │
│      ├── GET     → Get stream details                       │
│      ├── PATCH   → Update stream                            │
│      ├── DELETE  → Delete stream                            │
│      ├── /enroll                                             │
│      │   ├── GET  → Check enrollment                        │
│      │   └── POST → Enroll in stream                        │
│      ├── /chat                                               │
│      │   ├── GET  → Get messages                            │
│      │   └── POST → Send message                            │
│      └── /upload-vod                                         │
│          └── POST → Upload VOD                              │
│                                                              │
│  /api/streams/auth                                           │
│  └── POST    → RTMP authentication                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Streaming Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   Streaming Pipeline                         │
└─────────────────────────────────────────────────────────────┘

Step 1: RTMP Ingest
┌──────────────┐
│  OBS Studio  │
│              │
│  Video/Audio │
└──────┬───────┘
       │ RTMP Stream
       │ rtmp://server:1935/live/STREAM_KEY
       ▼
┌──────────────────┐
│  Nginx RTMP      │
│  - Receives RTMP │
│  - Validates key │
│  - Buffers data  │
└──────┬───────────┘

Step 2: Transcoding
       │
       │ Raw video
       ▼
┌──────────────────┐
│     FFmpeg       │
│  - Transcode     │
│  - Create HLS    │
│  - Generate .ts  │
└──────┬───────────┘

Step 3: HLS Packaging
       │
       │ HLS segments
       ▼
┌──────────────────┐
│  HLS Directory   │
│  /tmp/hls/       │
│  ├── index.m3u8  │
│  ├── segment0.ts │
│  ├── segment1.ts │
│  └── ...         │
└──────┬───────────┘

Step 4: Delivery
       │
       │ HTTP
       ▼
┌──────────────────┐
│  HLS.js Player   │
│  (Browser)       │
│  - Fetch m3u8    │
│  - Download .ts  │
│  - Decode/play   │
└──────────────────┘
```

### 4. Real-time Chat Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat System                               │
└─────────────────────────────────────────────────────────────┘

Client Side:
┌──────────────┐
│   Browser    │
│              │
│  Socket.IO   │
│  Client      │
└──────┬───────┘
       │ WebSocket
       │ emit('stream:message', data)
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Socket.IO Server                          │
│  (server.mjs)                                                │
│                                                              │
│  Events:                                                     │
│  ├── connection        → Client connects                    │
│  ├── join:stream       → Join stream room                   │
│  ├── stream:message    → Broadcast to room                  │
│  └── disconnect        → Client leaves                      │
│                                                              │
└──────┬───────────────────────────────────────────────────────┘
       │
       │ Broadcast to room
       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Viewer 1    │  │  Viewer 2    │  │  Viewer N    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 5. Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Tables                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │
│ email        │
│ name         │
│ role         │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   streams    │
│──────────────│
│ id (PK)      │
│ uuid         │
│ title        │
│ streamKey    │
│ status       │
│ teacherId(FK)│
└──────┬───────┘
       │
       │ 1:N
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ enrollments  │  │   messages   │  │  analytics   │
│──────────────│  │──────────────│  │──────────────│
│ id (PK)      │  │ id (PK)      │  │ viewCount    │
│ streamId(FK) │  │ streamId(FK) │  │ attendance   │
│ userId (FK)  │  │ userId (FK)  │  │ revenue      │
│ attended     │  │ message      │  │ ...          │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 6. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Flow                         │
└─────────────────────────────────────────────────────────────┘

1. Sign Up
   User → /sign-up → Better Auth → Database → Email Verification

2. Sign In
   User → /sign-in → Better Auth → Session Cookie → Redirect

3. Protected Route
   Request → Middleware → Check Session → Allow/Deny

4. API Authentication
   Request → Headers → Session Cookie → Validate → Process
```

### 7. Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Flow                              │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Enroll"
   ↓
2. Check if paid stream
   ↓
3. Redirect to Stripe Checkout
   ↓
4. User completes payment
   ↓
5. Stripe webhook → /api/webhooks/stripe
   ↓
6. Create enrollment record
   ↓
7. Grant access to stream
   ↓
8. Send confirmation email
```

### 8. VOD Processing

```
┌─────────────────────────────────────────────────────────────┐
│                   VOD Processing                             │
└─────────────────────────────────────────────────────────────┘

1. Stream ends
   ↓
2. Nginx saves recording
   ↓
3. FFmpeg converts to MP4
   ↓
4. Upload to R2/S3
   ↓
5. Update stream.vodUrl
   ↓
6. Notify enrolled users
   ↓
7. VOD available for playback
```

## Technology Stack Details

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Video Player**: HLS.js
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Auth**: Better Auth
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Real-time**: Socket.IO Server

### Streaming
- **Ingest**: Nginx RTMP Module
- **Transcoding**: FFmpeg
- **Protocol**: HLS (HTTP Live Streaming)
- **Storage**: Filesystem → R2/S3

### Infrastructure
- **Hosting**: Vercel (Frontend)
- **RTMP Server**: Railway/DigitalOcean
- **Database**: Neon PostgreSQL
- **Storage**: Cloudflare R2 / AWS S3
- **CDN**: Cloudflare / CloudFront

## Deployment Architecture

### Development
```
┌──────────────────────────────────────────────────────────┐
│                    localhost:3000                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Next.js Dev Server + Socket.IO                    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Cloud)                      │
└──────────────────────────────────────────────────────────┘
```

### Production
```
┌──────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Next.js App (Serverless Functions)               │  │
│  │  + Socket.IO Server                                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Railway/DO     │         │  Neon Database  │
│  RTMP Server    │         │  (PostgreSQL)   │
└─────────────────┘         └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Cloudflare R2  │
│  VOD Storage    │
└─────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Network Layer                                            │
│     ├── Firewall rules                                       │
│     ├── DDoS protection                                      │
│     └── Rate limiting                                        │
│                                                              │
│  2. Application Layer                                        │
│     ├── HTTPS/TLS                                            │
│     ├── CSRF protection                                      │
│     ├── XSS prevention                                       │
│     └── SQL injection prevention                             │
│                                                              │
│  3. Authentication Layer                                     │
│     ├── Password hashing (bcrypt)                            │
│     ├── Session management                                   │
│     ├── JWT tokens                                           │
│     └── OAuth 2.0                                            │
│                                                              │
│  4. Authorization Layer                                      │
│     ├── Role-based access control                            │
│     ├── Resource ownership checks                            │
│     └── API key validation                                   │
│                                                              │
│  5. Data Layer                                               │
│     ├── Encrypted connections                                │
│     ├── Parameterized queries                                │
│     └── Data encryption at rest                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple Next.js instances behind load balancer
- Multiple RTMP servers with DNS round-robin
- Database read replicas
- CDN for static assets and HLS

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Cache frequently accessed data
- Use Redis for sessions

### Performance Optimization
- Server-side rendering for SEO
- Static generation for public pages
- Image optimization
- Code splitting
- Lazy loading

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application Monitoring                                      │
│  ├── Vercel Analytics                                        │
│  ├── Sentry (Error tracking)                                 │
│  └── Custom metrics                                          │
│                                                              │
│  Infrastructure Monitoring                                   │
│  ├── Server metrics (CPU, RAM, Disk)                         │
│  ├── Network metrics (Bandwidth, Latency)                    │
│  └── Database metrics (Queries, Connections)                 │
│                                                              │
│  Business Metrics                                            │
│  ├── Active streams                                          │
│  ├── Concurrent viewers                                      │
│  ├── Revenue                                                 │
│  └── User engagement                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a solid foundation for a scalable, secure, and performant live streaming platform!
