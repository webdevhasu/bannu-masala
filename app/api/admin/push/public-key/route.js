import { NextResponse } from 'next/server';
import { getVapidPublicKey, isPushConfigured } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: 'Push notifications are not configured on the server.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ publicKey: getVapidPublicKey() });
}
