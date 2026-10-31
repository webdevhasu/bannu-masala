import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function DELETE(request, props) {
  try {
    const { id } = await props.params;
    const reviewId = parseInt(id, 10);

    const result = await sql`
      DELETE FROM chat_reviews
      WHERE id = ${reviewId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Chat review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: reviewId });
  } catch (error) {
    console.error('Error deleting chat review:', error);
    return NextResponse.json({ error: 'Failed to delete chat review' }, { status: 500 });
  }
}

export async function PATCH(request, props) {
  try {
    const { id } = await props.params;
    const reviewId = parseInt(id, 10);
    const body = await request.json();

    const { is_active, sort_order, caption, product_id, customer_name } = body;

    const existing = await sql`SELECT * FROM chat_reviews WHERE id = ${reviewId} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Chat review not found' }, { status: 404 });
    }

    const current = existing[0];
    const newActive = typeof is_active === 'boolean' ? is_active : current.is_active;
    const newSort = typeof sort_order === 'number' ? sort_order : current.sort_order;
    const newCaption = caption !== undefined ? caption : current.caption;
    const newPid = product_id !== undefined ? (product_id ? parseInt(product_id, 10) : null) : current.product_id;
    const newCustomer = customer_name !== undefined ? customer_name : current.customer_name;

    const updated = await sql`
      UPDATE chat_reviews
      SET is_active = ${newActive},
          sort_order = ${newSort},
          caption = ${newCaption},
          product_id = ${newPid},
          customer_name = ${newCustomer}
      WHERE id = ${reviewId}
      RETURNING *
    `;

    return NextResponse.json({ success: true, review: updated[0] });
  } catch (error) {
    console.error('Error updating chat review:', error);
    return NextResponse.json({ error: 'Failed to update chat review' }, { status: 500 });
  }
}

