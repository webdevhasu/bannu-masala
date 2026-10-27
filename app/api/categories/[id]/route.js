import { NextResponse } from 'next/server';
import sql from '@/lib/db';

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function PUT(request, props) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { name, slug, description, image, sort_order, is_active } = body;
    const safeSlug = normalizeSlug(slug || name);

    if (!name?.trim() || !safeSlug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE categories
      SET name = ${name.trim()},
          slug = ${safeSlug},
          description = ${description || null},
          image = ${image || null},
          sort_order = ${Number(sort_order) || 0},
          is_active = ${is_active !== false}
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update category:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const { id } = await props.params;
    const result = await sql`DELETE FROM categories WHERE id = ${Number(id)} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
