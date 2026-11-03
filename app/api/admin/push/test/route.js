import { NextResponse } from 'next/server';
import { sendTestPush } from '@/lib/push';

export async function POST() {
  try {
    const result = await sendTestPush();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Test push failed:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
