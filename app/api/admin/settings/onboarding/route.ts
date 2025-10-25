import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieList = await cookies();
    const cookieHeader = cookieList.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join("; ");

    const session = await auth.api.getSession({
      headers: { cookie: cookieHeader }
    });

    if (!session?.user?.role || !["Admin", "SuperAdmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [setting] = await db
      .select({ onboardingEnabled: systemSettings.onboardingEnabled })
      .from(systemSettings);

    return NextResponse.json({
      enabled: setting?.onboardingEnabled ?? false
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieList = await cookies();
    const cookieHeader = cookieList.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join("; ");

    const session = await auth.api.getSession({
      headers: { cookie: cookieHeader }
    });

    if (!session?.user?.role || !["Admin", "SuperAdmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enabled } = await request.json();
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(systemSettings)
      .limit(1);
    
    if (existing) {
      await db
        .update(systemSettings)
        .set({
          onboardingEnabled: enabled,
          updatedAt: new Date()
        })
        .where(eq(systemSettings.id, existing.id));
    } else {
      await db
        .insert(systemSettings)
        .values({
          id: 1,
          onboardingEnabled: enabled,
          updatedAt: new Date()
        });
    }

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
