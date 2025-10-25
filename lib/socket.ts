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
    
    socket.on('join:dm', (userId: string) => {
      socket.join(userId);
    });
    
    io?.emit('users:count', io.engine.clientsCount);

    socket.on('chat:message', async (data: { content: string; userId: string; userName: string; userImage?: string }) => {
      try {
        const { db } = await import('./db');
        const { chatMessages } = await import('./db/schema');
        
        const generatedId = Math.floor(Math.random() * 1_000_000_000);
        const [message] = await db.insert(chatMessages).values({
          id: generatedId,
          content: data.content,
          role: 'user',
          userId: data.userId,
          metadata: JSON.stringify({ userName: data.userName, userImage: data.userImage }),
          createdAt: new Date(),
        }).returning();

        io?.emit('chat:message', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('dm:message', async (data: { content: string; senderId: string; receiverId: string; senderName: string; senderImage?: string }) => {
      try {
        const { db } = await import('./db');
        const { directMessages } = await import('./db/schema');
        
        const generatedDmId = Math.floor(Math.random() * 1_000_000_000);
        const [message] = await db.insert(directMessages).values({
          id: generatedDmId,
          content: data.content,
          fromId: data.senderId,
          toId: data.receiverId,
          createdAt: new Date(),
          read: false,
        }).returning();

        socket.emit('dm:message', message);
        socket.to(data.receiverId).emit('dm:message', message);
      } catch (error) {
        console.error('Error saving DM:', error);
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
