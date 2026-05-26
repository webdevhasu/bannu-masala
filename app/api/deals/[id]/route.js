import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    
    const deals = await sql`
      SELECT * FROM hot_deals WHERE id = ${id} LIMIT 1
    `;

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
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, description, image, price, original_price, link, is_active } = body;

    const result = await sql`
      UPDATE hot_deals
      SET title = ${title}, description = ${description}, image = ${image},
          price = ${price || 0}, original_price = ${original_price || 0}, link = ${link}, is_active = ${is_active}
      WHERE id = ${id}
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
    const params = await props.params;
    const id = parseInt(params.id);

    const result = await sql`
      DELETE FROM hot_deals WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
