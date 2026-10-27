import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { buildDealPayload } from '@/lib/dealPayload';

export async function GET(request, props) {
  try {
    const { id } = await props.params;

    const deals = await sql`SELECT * FROM hot_deals WHERE id = ${Number(id)} LIMIT 1`;

    if (deals.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deals[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PUT(request, props) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { payload, error } = await buildDealPayload(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const result = await sql`
      UPDATE hot_deals
      SET title = ${payload.title},
          description = ${payload.description},
          image = ${payload.image},
          price = ${payload.price},
          original_price = ${payload.original_price},
          link = ${payload.link},
          is_active = ${payload.is_active},
          product_id = ${payload.product_id},
          variant = ${payload.variant},
          start_at = ${payload.start_at},
          end_at = ${payload.end_at}
      WHERE id = ${Number(id)}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
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
