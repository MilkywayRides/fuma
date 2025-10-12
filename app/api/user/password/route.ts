import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid current password' }, { status: 400 });
  }
}
