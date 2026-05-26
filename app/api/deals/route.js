import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await sql`
      SELECT * FROM hot_deals
      ORDER BY id DESC
    `;
    return NextResponse.json(deals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, image, price, original_price, link, is_active } = body;

    const result = await sql`
      INSERT INTO hot_deals (title, description, image, price, original_price, link, is_active)
      VALUES (${title}, ${description}, ${image}, ${price || 0}, ${original_price || 0}, ${link}, ${is_active !== undefined ? is_active : true})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
