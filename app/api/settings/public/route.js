import { NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllSettings();

    return NextResponse.json({
      shipping: settings.shipping,
      payment: settings.payment,
      store: {
        whatsapp: settings.store.whatsapp,
        phone: settings.store.phone,
        email: settings.store.email,
        address: settings.store.address,
        hours: settings.store.hours,
      },
    });
  } catch (error) {
    console.error('Failed to load public settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}
