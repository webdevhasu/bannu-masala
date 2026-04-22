import { NextResponse } from 'next/server';
import sql from '@/lib/db';
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
  try {
    const body = await request.json();
    const { name, phone, city, address, items } = body;

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

      if (!Number.isFinite(productId) || productId <= 0) {
        return NextResponse.json({ error: 'Invalid product id in items' }, { status: 400 });
      }
      if (!variant) {
        return NextResponse.json({ error: 'Invalid variant in items' }, { status: 400 });
      }
      if (!Number.isFinite(qty) || qty < 1) {
        return NextResponse.json({ error: 'Invalid quantity in items' }, { status: 400 });
      }

      const products = await sql`SELECT * FROM products WHERE id = ${productId} LIMIT 1`;
      if (!products.length) {
        return NextResponse.json({ error: `Product not found (id: ${productId})` }, { status: 400 });
      }

      const product = products[0];
      const variants = buildVariantsMap(product);
      const price = parseInt(variants[variant], 10) || 0;

      if (!price) {
        return NextResponse.json(
          { error: `Invalid variant '${variant}' for product '${product.name}'` },
          { status: 400 }
        );
      }

      normalizedItems.push({
        id: productId,
        name: product.name,
        variant,
        qty,
        price,
      });
    }

    const subtotal = normalizedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 250 : 0);
    const total = subtotal + shipping;

    // Insert the order first
    const orderResult = await sql`
      INSERT INTO orders (customer_name, phone, city, address, subtotal, shipping, total)
      VALUES (${name}, ${phone}, ${city}, ${address}, ${subtotal}, ${shipping}, ${total})
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Insert all order items
    for (const item of normalizedItems) {
      await sql`
        INSERT INTO order_items (order_id, product_name, variant, quantity, price)
        VALUES (${orderId}, ${item.name}, ${item.variant}, ${item.qty}, ${item.price})
      `;
    }

    return NextResponse.json({ id: orderId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
