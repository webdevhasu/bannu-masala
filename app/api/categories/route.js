import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await sql`
      SELECT c.*,
             COUNT(p.id)::int AS product_count,
             (
               SELECT p2.image
               FROM products p2
               WHERE p2.category_id = c.id
                 AND p2.is_active = true
                 AND p2.image IS NOT NULL
                 AND p2.image <> ''
               ORDER BY p2.is_featured DESC, p2.id ASC
               LIMIT 1
             ) AS first_product_image
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `;
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, sort_order, is_active } = body;
    const safeSlug = normalizeSlug(slug || name);

    if (!name?.trim() || !safeSlug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO categories (name, slug, description, image, sort_order, is_active)
      VALUES (${name.trim()}, ${safeSlug}, ${description || null}, ${image || null},
              ${Number(sort_order) || 0}, ${is_active !== false})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
