import { NextResponse } from 'next/server';
import sql from '@/lib/db';

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
    const { name, phone, city, address, subtotal, shipping, total, items } = body;

    // Insert the order first
    const orderResult = await sql`
      INSERT INTO orders (customer_name, phone, city, address, subtotal, shipping, total)
      VALUES (${name}, ${phone}, ${city}, ${address}, ${subtotal}, ${shipping}, ${total})
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Insert all order items
    for (const item of items) {
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
