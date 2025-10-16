import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { user, session, systemSettings } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  try {
    console.log('🔍 Middleware triggered for path:', request.nextUrl.pathname);

    // Skip middleware for certain paths
    if (request.nextUrl.pathname.startsWith('/_next') || 
        request.nextUrl.pathname.startsWith('/api') || 
        request.nextUrl.pathname === '/favicon.ico' ||
        request.nextUrl.pathname === '/banned') {
      return NextResponse.next();
    }

    const token = request.cookies.get('better-auth.session_token')?.value;
    console.log('🔑 Session token:', token ? 'Found' : 'Not found');

    if (!token) {
      return NextResponse.next();
    }

    // Add no-cache headers to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Cache-Control', 'no-cache');

    const userSession = await auth.api.getSession({ headers: requestHeaders });
    console.log('👤 Session:', userSession ? 'Found' : 'Not found');

    if (!userSession) {
      return NextResponse.next();
    }

    const [userRecord] = await db.select().from(user).where(eq(user.id, userSession.user.id)).limit(1);
    console.log('👤 User:', userRecord ? 'Found' : 'Not found', 'Onboarding:', userRecord?.onboardingCompleted);

    if (!userRecord) {
      return NextResponse.next();
    }

    // Handle banned users first
    if (userRecord.banned) {
      console.log('🚫 Redirecting banned user');
      return NextResponse.redirect(new URL('/banned', request.url));
    }

    // Check onboarding status if user hasn't completed it
    if (!userRecord.onboardingCompleted) {
      const [setting] = await db.select().from(systemSettings).limit(1);
      console.log('⚙️ System settings:', setting);

      if (setting?.onboardingEnabled && !request.nextUrl.searchParams.has('onboarding')) {
        console.log('🔄 Redirecting to onboarding');
        const redirectUrl = new URL('/?onboarding=true', request.url);
        return NextResponse.redirect(redirectUrl);
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
    /*
     * Match all request paths except:
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)',
    '/'
  ],
};
