import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await sql`
      SELECT r.*, p.name as product_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `;
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Fetch all reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, reviewer_name, rating, comment } = body;

    const result = await sql`
      INSERT INTO reviews (product_id, reviewer_name, rating, comment)
      VALUES (${product_id}, ${reviewer_name}, ${rating}, ${comment})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
