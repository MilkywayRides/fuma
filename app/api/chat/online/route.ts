import { NextResponse } from 'next/server';

const onlineUsers = new Map<string, number>();
const TIMEOUT = 10000;

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (userId) {
      onlineUsers.set(userId, Date.now());
    }
    
    const now = Date.now();
    for (const [id, timestamp] of onlineUsers.entries()) {
      if (now - timestamp > TIMEOUT) {
        onlineUsers.delete(id);
      }
    }
    
    return NextResponse.json({ count: onlineUsers.size });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
