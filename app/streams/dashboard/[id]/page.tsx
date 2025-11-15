import { db } from '@/lib/db';
import { streams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { StreamDashboard } from '@/components/stream-dashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StreamDashboardPage({ params }: PageProps) {
  const { id } = await params;
  
  const stream = await db.select()
    .from(streams)
    .where(eq(streams.uuid, id))
    .limit(1);

  if (!stream[0]) {
    notFound();
  }

  return <StreamDashboard stream={stream[0]} />;
}
