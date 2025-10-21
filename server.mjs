import 'dotenv/config';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql as sqlOperator } from 'drizzle-orm';
import { pgTable, serial, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userImage: text('user_image'),
  hypes: integer('hypes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: { chatMessages } });

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  console.log('Socket.IO server initialized at /api/socket');

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    io.emit('users:count', io.engine.clientsCount);

    socket.on('chat:message', async (data) => {
      try {
        console.log('Saving message:', data);
        const [message] = await db.insert(chatMessages).values({
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage || null,
        }).returning();

        console.log('Message saved:', message);
        io.emit('chat:message', message);
      } catch (error) {
        console.error('Error saving message:', error);
        // Still emit the message even if save fails
        io.emit('chat:message', {
          id: Date.now(),
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage,
          createdAt: new Date().toISOString(),
        });
      }
    });

    socket.on('message:hype', async (data) => {
      try {
        const [updated] = await db
          .update(chatMessages)
          .set({ hypes: sqlOperator`${chatMessages.hypes} + 250` })
          .where(sqlOperator`${chatMessages.id} = ${data.messageId}`)
          .returning();
        
        if (updated) {
          io.emit('message:hype', { messageId: updated.id, hypes: updated.hypes });
        }
      } catch (error) {
        console.error('Error updating hype:', error);
      }
    });

    socket.on('message:delete', async (data) => {
      try {
        await db
          .delete(chatMessages)
          .where(sqlOperator`${chatMessages.id} = ${data.messageId}`);
        
        io.emit('message:delete', { messageId: data.messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      io.emit('users:count', io.engine.clientsCount);
    });
  });

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.IO server initialized');
  });
});
