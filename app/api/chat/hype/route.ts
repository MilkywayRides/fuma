export async function POST(request: Request) {
  try {
    const { messageId } = await request.json();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to hype message' }, { status: 500 });
  }
}
