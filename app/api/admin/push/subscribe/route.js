import { NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/push';

export async function POST(request) {
  try {
    const body = await request.json();
    const subscription = body?.subscription || body;

    const result = await savePushSubscription(
      subscription,
      request.headers.get('user-agent') || null
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe failed:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
