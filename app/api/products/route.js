import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await sql`
      SELECT p.*, 
             COALESCE(AVG(r.rating), 0) AS average_rating, 
             COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `;

    const formatted = products.map(p => ({
      ...p,
      average_rating: parseFloat(p.average_rating).toFixed(1),
      review_count: parseInt(p.review_count),
      variants: buildVariantsMap(p),
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
    const { name, slug, description, image, price_250g, price_500g, price_1kg, gallery, custom_variants } = body;
    const galleryJson = JSON.stringify(gallery || []);
    const customVariantsJson = JSON.stringify(custom_variants || []);

    const result = await sql`
      INSERT INTO products (name, slug, description, image, price_250g, price_500g, price_1kg, gallery, custom_variants)
      VALUES (${name}, ${slug}, ${description}, ${image}, ${price_250g}, ${price_500g}, ${price_1kg}, ${galleryJson}, ${customVariantsJson})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
