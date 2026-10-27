import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCourierTrackingUrl, normalizeStatus } from '@/lib/orders';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderQuery = searchParams.get('order')?.trim() || '';
    const phoneQuery = searchParams.get('phone')?.trim() || '';

    if (!orderQuery || !phoneQuery) {
      return NextResponse.json(
        { ok: false, error: 'Order reference aur phone number dono required hain.' },
        { status: 400 }
      );
    }

    // Extract ID (e.g. "BM-1024" -> "1024", "1024" -> "1024")
    const match = orderQuery.match(/\d+/);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: 'Valid order number likhein (misal: BM-102 ya 102).' },
        { status: 400 }
      );
    }
    const orderId = parseInt(match[0], 10);

    // Normalize phone digits
    const inputDigits = phoneQuery.replace(/\D/g, '');
    if (inputDigits.length < 7) {
      return NextResponse.json(
        { ok: false, error: 'Valid mobile number likhein (misal: 03XXXXXXXXX).' },
        { status: 400 }
      );
    }

    const orderRes = await sql`
      SELECT id, customer_name, phone, city, address, landmark, subtotal, shipping, total,
             payment_method, status, tracking_number, courier_name, created_at
      FROM orders
      WHERE id = ${orderId}
      LIMIT 1
    `;

    if (orderRes.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Order nahi mila. Order number dobara check karein.' },
        { status: 404 }
      );
    }

    const order = orderRes[0];
    const orderPhoneDigits = String(order.phone || '').replace(/\D/g, '');

    // Check if phone matches (either ends with same 7 digits or exact match)
    const matchesPhone =
      orderPhoneDigits.endsWith(inputDigits.slice(-7)) ||
      inputDigits.endsWith(orderPhoneDigits.slice(-7));

    if (!matchesPhone) {
      return NextResponse.json(
        { ok: false, error: 'Yeh mobile number is order se match nahi kar raha.' },
        { status: 403 }
      );
    }

    // Fetch order items with product images if available
    const itemsRes = await sql`
      SELECT oi.*, p.image, p.slug
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id OR p.name = oi.product_name
      WHERE oi.order_id = ${order.id}
    `;

    const liveTrackingUrl = getCourierTrackingUrl(order.courier_name, order.tracking_number);

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: `BM-${order.id}`,
        customerName: order.customer_name,
        city: order.city,
        address: order.address,
        landmark: order.landmark,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.payment_method || 'Cash on Delivery',
        status: normalizeStatus(order.status),
        rawStatus: order.status,
        courierName: order.courier_name || null,
        trackingNumber: order.tracking_number || null,
        liveTrackingUrl,
        createdAt: order.created_at,
        items: itemsRes.map((i) => ({
          id: i.id,
          name: i.product_name,
          variant: i.variant,
          quantity: i.quantity,
          price: i.price,
          image: i.image || null,
          slug: i.slug || null,
        })),
      },
    });
  } catch (error) {
    console.error('Error in track order API:', error);
    return NextResponse.json(
      { ok: false, error: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
