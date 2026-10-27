import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const isApproved = body.is_approved === true;

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
    }

    const result = await sql`
      UPDATE reviews SET is_approved = ${isApproved}
      WHERE id = ${id}
      RETURNING id, is_approved
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id, 10);

    const result = await sql`
      DELETE FROM reviews WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
