import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { user, systemSettings } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from './lib/auth';

export const runtime = 'nodejs';

const publicPaths = ['/_next', '/api', '/favicon.ico', '/banned', '/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const token = request.cookies.get('better-auth.session_token')?.value;
    if (!token) return NextResponse.next();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Cache-Control', 'no-cache');

    const userSession = await auth.api.getSession({ headers: requestHeaders });
    if (!userSession) return NextResponse.next();

    const [userRecord] = await db.select().from(user).where(eq(user.id, userSession.user.id)).limit(1);
    if (!userRecord) return NextResponse.next();

    if (userRecord.banned) {
      return NextResponse.redirect(new URL('/banned', request.url));
    }

    if (!userRecord.onboardingCompleted) {
      const [setting] = await db.select().from(systemSettings).limit(1);
      if (setting?.onboardingEnabled && !request.nextUrl.searchParams.has('onboarding')) {
        return NextResponse.redirect(new URL('/?onboarding=true', request.url));
      }
    }

    return NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  } catch (error) {
    console.error('⚠️ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)',
    '/'
  ],
};
