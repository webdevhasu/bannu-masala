import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request, props) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const isRead = body.is_read === true;

    const result = await sql`
      UPDATE contact_messages SET is_read = ${isRead}
      WHERE id = ${Number(id)}
      RETURNING id, is_read
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const { id } = await props.params;
    const result = await sql`DELETE FROM contact_messages WHERE id = ${Number(id)} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
