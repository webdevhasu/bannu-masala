import { NextResponse } from 'next/server';
import { getAllSettings, saveSetting } from '@/lib/settings';
import { SETTINGS_KEYS } from '@/lib/defaultSettings.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { key, value } = body || {};

    if (!key || !SETTINGS_KEYS.includes(key)) {
      return NextResponse.json({ error: 'Invalid settings key' }, { status: 400 });
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return NextResponse.json({ error: 'Settings value must be an object' }, { status: 400 });
    }

    await saveSetting(key, value);
    const settings = await getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
