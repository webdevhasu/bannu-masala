import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantsAll = searchParams.get('all') === '1';
    const isAdmin = wantsAll ? await isAdminRequest(request) : false;

    if (wantsAll && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = wantsAll
      ? await sql`
          SELECT r.*, p.name as product_name
          FROM reviews r
          LEFT JOIN products p ON r.product_id = p.id
          ORDER BY r.created_at DESC
        `
      : await sql`
          SELECT r.*, p.name as product_name
          FROM reviews r
          LEFT JOIN products p ON r.product_id = p.id
          WHERE r.is_approved = true
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
    const { product_id, reviewer_name, name, rating, comment, phone } = body;
    const normalizedName = String(reviewer_name || name || '').trim();

    if (!normalizedName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || !String(comment).trim()) {
      return NextResponse.json({ error: 'Please write a short review' }, { status: 400 });
    }

    // product_id is now optional (global reviews)
    const prodId = product_id ? parseInt(product_id, 10) : null;
    if (prodId !== null && !Number.isFinite(prodId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    // For global reviews, we can't verify purchase
    let isVerified = false;
    const normalizedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : null;

    if (normalizedPhone && normalizedPhone.length === 10 && prodId !== null) {
      const purchase = await sql`
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.product_id = ${prodId}
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
        ${prodId}, ${normalizedName.slice(0, 80)}, ${numericRating},
        ${String(comment).trim().slice(0, 2000)}, false, ${isVerified},
        ${normalizedPhone}
      )
    `;

    return NextResponse.json({ success: true, pending: true, verified: isVerified }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
