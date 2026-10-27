import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { getActiveDeals } from '@/lib/deals';

function parseNullableInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request, props) {
  try {
    const { id } = await props.params;
    const productId = Number(id);

    const products = await sql`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ${productId}
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];
    const deals = await getActiveDeals();

    return NextResponse.json({
      ...product,
      variants: buildVariantsMap(product),
      deals: deals.filter((deal) => String(deal.product_id) === String(productId)),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, props) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      image,
      price_250g,
      price_500g,
      price_1kg,
      gallery,
      custom_variants,
      category_id,
      ingredients,
      how_to_use,
      storage,
      stock,
      is_active,
      is_featured,
      badge,
    } = body;
    const galleryJson = JSON.stringify(gallery || []);
    const customVariantsJson = JSON.stringify(custom_variants || []);

    const result = await sql`
      UPDATE products
      SET name = ${name},
          slug = ${slug},
          description = ${description},
          image = ${image},
          gallery = ${galleryJson},
          custom_variants = ${customVariantsJson},
          price_250g = ${parseNullableInt(price_250g) || 0},
          price_500g = ${parseNullableInt(price_500g) || 0},
          price_1kg = ${parseNullableInt(price_1kg) || 0},
          category_id = ${parseNullableInt(category_id)},
          ingredients = ${ingredients || null},
          how_to_use = ${how_to_use || null},
          storage = ${storage || null},
          stock = ${parseNullableInt(stock) ?? 0},
          is_active = ${is_active !== false},
          is_featured = ${is_featured === true},
          badge = ${badge || null}
      WHERE id = ${Number(id)}
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
    const { id } = await props.params;
    const productId = Number(id);
    console.log(`[API DELETE] Received request to delete ID: ${productId}`);

    const result = await sql`DELETE FROM products WHERE id = ${productId} RETURNING id`;

    if (result.length === 0) {
      console.log(`[API DELETE] Product with ID ${productId} NOT found.`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log(`[API DELETE] Successfully deleted ID ${productId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
