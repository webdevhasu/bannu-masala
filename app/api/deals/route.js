import { NextResponse } from 'next/server';
import sql, { pool } from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { buildDealPayload } from '@/lib/dealPayload';

export const dynamic = 'force-dynamic';

async function getDeals() {
  const deals = await sql`
    SELECT d.*, p.name AS product_name, p.slug AS product_slug, p.image AS product_image,
           p.price_250g, p.price_500g, p.price_1kg, p.custom_variants
    FROM hot_deals d
    LEFT JOIN products p ON p.id = d.product_id
    ORDER BY d.id DESC
  `;

  let itemRows = [];
  try {
    itemRows = await sql`
      SELECT di.*, p.name AS product_name, p.slug AS product_slug, p.image AS product_image,
             p.price_250g, p.price_500g, p.price_1kg, p.custom_variants
      FROM deal_items di
      JOIN products p ON p.id = di.product_id
      ORDER BY di.deal_id ASC, di.id ASC
    `;
  } catch (error) {
    if (!/deal_items/i.test(error?.message || '')) throw error;
  }

  const itemsByDeal = new Map();
  for (const item of itemRows) {
    if (!itemsByDeal.has(item.deal_id)) itemsByDeal.set(item.deal_id, []);
    itemsByDeal.get(item.deal_id).push(item);
  }

  return deals.map((deal) => {
    const items = itemsByDeal.get(deal.id) || [];

    if (items.length === 0 && deal.product_id && deal.variant) {
      const variants = buildVariantsMap(deal);
      const originalPrice =
        Number(deal.original_price) || Number(variants[deal.variant]) || 0;
      items.push({
        id: `legacy-${deal.id}`,
        deal_id: deal.id,
        product_id: deal.product_id,
        product_name: deal.product_name,
        product_slug: deal.product_slug,
        product_image: deal.product_image,
        variant: deal.variant,
        original_price: originalPrice,
        sale_price: Number(deal.price) || 0,
      });
    }

    const formattedItems = items.map((item) => ({
      ...item,
      original_price: Number(item.original_price) || 0,
      sale_price: Number(item.sale_price) || 0,
    }));

    const first = formattedItems[0];

    return {
      ...deal,
      items: formattedItems,
      product_name: first?.product_name || deal.product_name || null,
      product_slug: first?.product_slug || deal.product_slug || null,
      product_image: first?.product_image || deal.product_image || null,
      current_original_price: first?.original_price || 0,
      price: first?.sale_price ?? deal.price,
    };
  });
}

export async function GET() {
  try {
    const formatted = await getDeals();
    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const { payload, items, error } = await buildDealPayload(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const dealRes = await client.query(
       `INSERT INTO hot_deals (
         title, description, image, price, original_price, link, is_active,
         product_id, variant, start_at, end_at, discount_percent, free_delivery
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        payload.free_delivery,
      ]
    );

    const dealId = dealRes.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO deal_items (deal_id, product_id, variant, original_price, sale_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [dealId, item.product_id, item.variant, item.original_price, item.sale_price]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ id: dealId, success: true }, { status: 201 });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
