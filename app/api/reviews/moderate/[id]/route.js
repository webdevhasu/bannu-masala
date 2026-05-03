import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);

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
