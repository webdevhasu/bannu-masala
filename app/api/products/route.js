import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { getGlobalReviewStats } from '@/lib/reviewStats';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products, globalReviews] = await Promise.all([
      sql`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = true
        ORDER BY p.is_featured DESC, p.id ASC
      `,
      getGlobalReviewStats(),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      average_rating: globalReviews.average_rating,
      review_count: globalReviews.total_reviews,
      variants: buildVariantsMap(p),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

function parseNullableInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request) {
  try {
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
      INSERT INTO products (
        name, slug, description, image, price_250g, price_500g, price_1kg,
        gallery, custom_variants, category_id, ingredients, how_to_use, storage,
        stock, is_active, is_featured, badge
      )
      VALUES (
        ${name}, ${slug}, ${description}, ${image}, ${parseNullableInt(price_250g) || 0},
        ${parseNullableInt(price_500g) || 0}, ${parseNullableInt(price_1kg) || 0},
        ${galleryJson}, ${customVariantsJson}, ${parseNullableInt(category_id)},
        ${ingredients || null}, ${how_to_use || null}, ${storage || null},
        ${parseNullableInt(stock) ?? 100}, ${is_active !== false}, ${is_featured === true},
        ${badge || null}
      )
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
