import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Helper function to convert headers to a regular object
async function getHeadersObject() {
  const headersList = headers();
  const headerEntries: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headerEntries[key] = value;
  });
  return headerEntries;
}

// Helper function to get session from request headers
async function getAdminSession() {
  const headerEntries = await getHeadersObject();
  const session = await auth.api.getSession({ headers: headerEntries });
  if (session?.user?.role !== 'Admin') {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [setting] = await db
      .select({
        onboardingEnabled: settings.onboardingEnabled
      })
      .from(settings)
      .limit(1);

    return NextResponse.json({ enabled: setting?.onboardingEnabled ?? true });
  } catch (error) {
    console.error('Failed to get onboarding settings:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled must be a boolean' },
        { status: 400 }
      );
    }

    const [existingSetting] = await db
      .select()
      .from(settings)
      .limit(1);

    if (existingSetting) {
      await db
        .update(settings)
        .set({ onboardingEnabled: enabled })
        .where(eq(settings.id, existingSetting.id));
    } else {
      await db
        .insert(settings)
        .values({ onboardingEnabled: enabled });
    }

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Failed to update onboarding settings:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding settings' },
      { status: 500 }
    );
  }
}