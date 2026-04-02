import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    
    const products = await sql`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(products[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, slug, description, image, price_250g, price_500g, price_1kg, gallery } = body;
    const galleryJson = JSON.stringify(gallery || []);

    const result = await sql`
      UPDATE products
      SET name = ${name}, slug = ${slug}, description = ${description}, image = ${image},
          gallery = ${galleryJson},
          price_250g = ${price_250g}, price_500g = ${price_500g}, price_1kg = ${price_1kg}
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    console.log(`[API DELETE] Received request to delete ID: ${id}`);

    const result = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      console.log(`[API DELETE] Product with ID ${id} NOT found.`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log(`[API DELETE] Successfully deleted ID ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API DELETE] Error for ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
