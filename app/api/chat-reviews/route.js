import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let reviews;
    if (productId) {
      const pid = parseInt(productId, 10);
      if (activeOnly) {
        reviews = await sql`
          SELECT cr.*, p.name AS product_name, p.slug AS product_slug
          FROM chat_reviews cr
          LEFT JOIN products p ON p.id = cr.product_id
          WHERE (cr.product_id = ${pid} OR cr.product_id IS NULL)
            AND cr.is_active = true
          ORDER BY (cr.product_id = ${pid}) DESC, cr.sort_order ASC, cr.id DESC
        `;
      } else {
        reviews = await sql`
          SELECT cr.*, p.name AS product_name, p.slug AS product_slug
          FROM chat_reviews cr
          LEFT JOIN products p ON p.id = cr.product_id
          WHERE cr.product_id = ${pid} OR cr.product_id IS NULL
          ORDER BY cr.sort_order ASC, cr.id DESC
        `;
      }
    } else {
      if (activeOnly) {
        reviews = await sql`
          SELECT cr.*, p.name AS product_name, p.slug AS product_slug
          FROM chat_reviews cr
          LEFT JOIN products p ON p.id = cr.product_id
          WHERE cr.is_active = true
          ORDER BY cr.sort_order ASC, cr.id DESC
        `;
      } else {
        reviews = await sql`
          SELECT cr.*, p.name AS product_name, p.slug AS product_slug
          FROM chat_reviews cr
          LEFT JOIN products p ON p.id = cr.product_id
          ORDER BY cr.sort_order ASC, cr.id DESC
        `;
      }
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching chat reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch chat reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { images, image_url, product_id, customer_name, caption } = body;

    const pid = product_id ? parseInt(product_id, 10) : null;
    const name = (customer_name || '').trim();
    const cap = (caption || '').trim();

    // Support single or multiple image upload
    const imageList = Array.isArray(images) && images.length > 0
      ? images
      : image_url ? [image_url] : [];

    if (imageList.length === 0) {
      return NextResponse.json({ error: 'At least one screenshot image is required.' }, { status: 400 });
    }

    const inserted = [];
    for (const url of imageList) {
      const res = await sql`
        INSERT INTO chat_reviews (image_url, product_id, customer_name, caption, is_active)
        VALUES (${url}, ${pid}, ${name || null}, ${cap || null}, true)
        RETURNING *
      `;
      inserted.push(res[0]);
    }

    return NextResponse.json({ success: true, inserted }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat review:', error);
    return NextResponse.json({ error: 'Failed to save chat review' }, { status: 500 });
  }
}
