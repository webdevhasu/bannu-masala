import { NextResponse } from 'next/server';
import sql, { pool } from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

export async function GET() {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
        return { ...order, items };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const { name, phone, city, address, items } = body;

    // 1. Validation
    if (!name?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
      return NextResponse.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    const normalizedItems = [];
    for (const item of items) {
      const productId = parseInt(item?.id, 10);
      const variant = typeof item?.variant === 'string' ? item.variant.trim() : '';
      const qty = parseInt(item?.qty, 10);

      if (!Number.isFinite(productId) || productId <= 0 || !variant || !Number.isFinite(qty) || qty < 1) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      const products = await sql`SELECT * FROM products WHERE id = ${productId} LIMIT 1`;
      if (!products.length) {
        return NextResponse.json({ error: `Product not found (id: ${productId})` }, { status: 400 });
      }

      const product = products[0];
      const variants = buildVariantsMap(product);
      const price = parseInt(variants[variant], 10) || 0;

      if (!price) {
        return NextResponse.json({ error: `Invalid variant '${variant}'` }, { status: 400 });
      }

      normalizedItems.push({ name: product.name, variant, qty, price });
    }

    const subtotal = normalizedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 250 : 0);
    const total = subtotal + shipping;

    // 2. Transaction start
    client = await pool.connect();
    await client.query('BEGIN');

    // Insert Order
    const orderRes = await client.query(
      `INSERT INTO orders (customer_name, phone, city, address, subtotal, shipping, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, phone, city, address, subtotal, shipping, total]
    );

    const orderId = orderRes.rows[0].id;

    // Insert Items
    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_name, variant, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.name, item.variant, item.qty, item.price]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ id: orderId, success: true }, { status: 201 });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
