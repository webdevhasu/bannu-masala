import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const messages = await sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC
    `;
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, website } = body || {};

    // Honeypot: silently accept bot submissions without storing them.
    if (website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json({ error: 'Please provide an email or phone number' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    await sql`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (
        ${name.trim().slice(0, 120)},
        ${email?.trim().slice(0, 160) || null},
        ${phone?.trim().slice(0, 40) || null},
        ${subject?.trim().slice(0, 160) || null},
        ${message.trim().slice(0, 4000)}
      )
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
