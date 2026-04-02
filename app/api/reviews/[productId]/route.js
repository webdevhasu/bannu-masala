import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET reviews for a productId
export async function GET(request, props) {
  try {
    const params = await props.params;
    const productId = parseInt(params.productId);
    
    const reviews = await sql`
      SELECT id, rating, comment, created_at, reviewer_name 
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY r.created_at DESC
    `;
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

// POST a new review (Guest-friendly)
export async function POST(request, props) {
  try {
    const params = await props.params;
    const productId = parseInt(params.productId);

    const { rating, comment, name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Insert Review
    await sql`
      INSERT INTO reviews (product_id, reviewer_name, rating, comment)
      VALUES (${productId}, ${name}, ${rating}, ${comment})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
