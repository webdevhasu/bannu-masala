import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE orders SET status = ${body.status} WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
