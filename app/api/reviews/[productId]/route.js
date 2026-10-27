import { NextResponse } from 'next/server';
import sql from '@/lib/db';

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

// GET approved reviews for a productId
export async function GET(request, props) {
  try {
    const params = await props.params;
    const productId = parseInt(params.productId, 10);

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    const reviews = await sql`
      SELECT id, rating, comment, created_at, reviewer_name, is_verified
      FROM reviews
      WHERE product_id = ${productId} AND is_approved = true
      ORDER BY created_at DESC
    `;

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

// POST a new review (guest-friendly, held for approval)
export async function POST(request, props) {
  try {
    const params = await props.params;
    const productId = parseInt(params.productId, 10);
    const body = await request.json();
    const { rating, comment, name, phone } = body;

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || !String(comment).trim()) {
      return NextResponse.json({ error: 'Please write a short review' }, { status: 400 });
    }

    let isVerified = false;
    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length === 10) {
      const purchase = await sql`
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.product_id = ${productId}
          AND RIGHT(REGEXP_REPLACE(o.phone, '[^0-9]', '', 'g'), 10) = ${normalizedPhone}
        LIMIT 1
      `;
      isVerified = purchase.length > 0;
    }

    await sql`
      INSERT INTO reviews (
        product_id, reviewer_name, rating, comment, is_approved, is_verified, reviewer_phone
      )
      VALUES (
        ${productId}, ${String(name).trim().slice(0, 80)}, ${numericRating},
        ${String(comment).trim().slice(0, 2000)}, false, ${isVerified},
        ${normalizedPhone || null}
      )
    `;

    return NextResponse.json({ success: true, pending: true, verified: isVerified }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
