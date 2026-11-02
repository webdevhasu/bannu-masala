import { NextResponse } from 'next/server';
import sql, { pool } from '@/lib/db';
import { buildDealPayload } from '@/lib/dealPayload';

export async function GET(request, props) {
  try {
    const { id } = await props.params;

    const deals = await sql`SELECT * FROM hot_deals WHERE id = ${Number(id)} LIMIT 1`;

    if (deals.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    let items = [];
    try {
      items = await sql`
        SELECT di.*, p.name AS product_name, p.slug AS product_slug, p.image AS product_image
        FROM deal_items di
        JOIN products p ON p.id = di.product_id
        WHERE di.deal_id = ${Number(id)}
        ORDER BY di.id ASC
      `;
    } catch (error) {
      if (!/deal_items/i.test(error?.message || '')) throw error;
    }

    return NextResponse.json({ ...deals[0], items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PUT(request, props) {
  let client;
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { payload, items, error } = await buildDealPayload(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE hot_deals
       SET title = $1,
           description = $2,
           image = $3,
           price = $4,
           original_price = $5,
           link = $6,
           is_active = $7,
           product_id = $8,
           variant = $9,
           start_at = $10,
           end_at = $11,
           discount_percent = $12
       WHERE id = $13
       RETURNING id`,
      [
        payload.title,
        payload.description,
        payload.image,
        payload.price,
        payload.original_price,
        payload.link,
        payload.is_active,
        payload.product_id,
        payload.variant,
        payload.start_at,
        payload.end_at,
        payload.discount_percent,
        Number(id),
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    await client.query('DELETE FROM deal_items WHERE deal_id = $1', [Number(id)]);

    for (const item of items) {
      await client.query(
        `INSERT INTO deal_items (deal_id, product_id, variant, original_price, sale_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [Number(id), item.product_id, item.variant, item.original_price, item.sale_price]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request, props) {
  try {
    const { id } = await props.params;
    const result = await sql`DELETE FROM hot_deals WHERE id = ${Number(id)} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
