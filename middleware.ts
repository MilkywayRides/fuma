import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { user, session } from './lib/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('better-auth.session_token')?.value;
  
  if (token) {
    const [userSession] = await db.select().from(session).where(eq(session.token, token)).limit(1);
    if (userSession) {
      const [userRecord] = await db.select().from(user).where(eq(user.id, userSession.userId)).limit(1);
      if (userRecord?.banned && request.nextUrl.pathname !== '/banned') {
        return NextResponse.redirect(new URL('/banned', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|banned).*)'],
};
