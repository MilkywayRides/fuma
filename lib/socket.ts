import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { desc } from 'drizzle-orm';

export type SocketServer = SocketIOServer;

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    io?.emit('users:count', io.engine.clientsCount);

    socket.on('chat:message', async (data: { content: string; userId: string; userName: string; userImage?: string }) => {
      try {
        const { db } = await import('./db');
        const { chatMessages } = await import('./db/schema');
        
        const [message] = await db.insert(chatMessages).values({
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage,
        }).returning();

        io?.emit('chat:message', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      io?.emit('users:count', io.engine.clientsCount);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
