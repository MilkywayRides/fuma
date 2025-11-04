import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentPages, paymentLinks, paymentButtons, paymentPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  
  let page = await db.select().from(paymentPages).where(eq(paymentPages.uuid, uuid)).limit(1);
  let title = '';
  let description = '';
  let planId = null;
  
  if (page[0] && page[0].active) {
    title = page[0].title;
    description = page[0].description || '';
    planId = page[0].planId;
  } else {
    const link = await db.select().from(paymentLinks).where(eq(paymentLinks.uuid, uuid)).limit(1);
    if (link[0] && link[0].active) {
      title = link[0].name;
      planId = link[0].planId;
    } else {
      const button = await db.select().from(paymentButtons).where(eq(paymentButtons.uuid, uuid)).limit(1);
      if (button[0] && button[0].active) {
        title = button[0].name;
        planId = button[0].planId;
      } else {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
  }

  let plan = null;
  let features = [];
  if (planId) {
    const planResult = await db.select().from(paymentPlans).where(eq(paymentPlans.id, planId)).limit(1);
    plan = planResult[0];
    features = plan?.features ? JSON.parse(plan.features) : [];
  }

  return NextResponse.json({ title, description, plan, features });
}
