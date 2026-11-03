import { NextResponse } from 'next/server';
import { removePushSubscription } from '@/lib/push';

export async function POST(request) {
  try {
    const body = await request.json();
    const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await removePushSubscription(endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    return NextResponse.json(
      { error: 'Failed to remove push subscription' },
      { status: 500 }
    );
  }
}
