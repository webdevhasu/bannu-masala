import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY id ASC`;

    const formatted = products.map(p => ({
      ...p,
      variants: {
        "250g": p.price_250g,
        "500g": p.price_500g,
        "1kg": p.price_1kg,
      }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, price_250g, price_500g, price_1kg } = body;

    const result = await sql`
      INSERT INTO products (name, slug, description, image, price_250g, price_500g, price_1kg)
      VALUES (${name}, ${slug}, ${description}, ${image}, ${price_250g}, ${price_500g}, ${price_1kg})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
