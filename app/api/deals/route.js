import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { buildDealPayload } from '@/lib/dealPayload';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await sql`
      SELECT d.*, p.name AS product_name, p.slug AS product_slug, p.image AS product_image,
             p.price_250g, p.price_500g, p.price_1kg, p.custom_variants
      FROM hot_deals d
      LEFT JOIN products p ON p.id = d.product_id
      ORDER BY d.id DESC
    `;

    const formatted = deals.map((deal) => {
      const variants = buildVariantsMap(deal);
      return {
        ...deal,
        current_original_price: deal.variant ? Number(variants[deal.variant]) || 0 : deal.original_price,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { payload, error } = await buildDealPayload(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO hot_deals (
        title, description, image, price, original_price, link, is_active,
        product_id, variant, start_at, end_at
      )
      VALUES (
        ${payload.title}, ${payload.description}, ${payload.image}, ${payload.price},
        ${payload.original_price}, ${payload.link}, ${payload.is_active},
        ${payload.product_id}, ${payload.variant}, ${payload.start_at}, ${payload.end_at}
      )
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
