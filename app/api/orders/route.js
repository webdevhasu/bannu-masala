import { NextResponse } from 'next/server';
import sql, { pool } from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { getActiveDeals, findDealForVariant } from '@/lib/deals';
import { getSetting } from '@/lib/settings';

export async function GET() {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT oi.*, p.slug, p.image
          FROM order_items oi
          LEFT JOIN products p ON p.id = oi.product_id OR p.name = oi.product_name
          WHERE oi.order_id = ${order.id}
        `;
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
    const { name, phone, city, address, landmark, items, payment_method } = body;

    if (!name?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
      return NextResponse.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    const [deals, shippingConfig, paymentConfig] = await Promise.all([
      getActiveDeals(),
      getSetting('shipping'),
      getSetting('payment'),
    ]);

    const allowedPayments = [...(paymentConfig?.methods || [])].filter(Boolean);
    if (
      paymentConfig?.cod_enabled &&
      !allowedPayments.some((method) => /cash/i.test(method))
    ) {
      allowedPayments.unshift('Cash on Delivery');
    }
    const selectedPayment = allowedPayments.includes(payment_method)
      ? payment_method
      : allowedPayments[0] || null;

    const productCache = new Map();
    const normalizedItems = [];

    for (const item of items) {
      const productId = parseInt(item?.id, 10);
      const variant = typeof item?.variant === 'string' ? item.variant.trim() : '';
      const qty = parseInt(item?.qty, 10);

      if (!Number.isFinite(productId) || productId <= 0 || !variant || !Number.isFinite(qty) || qty < 1) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      let product = productCache.get(productId);
      if (!product) {
        const products = await sql`
          SELECT * FROM products WHERE id = ${productId} AND is_active = true LIMIT 1
        `;
        if (!products.length) {
          return NextResponse.json({ error: `Product not found (id: ${productId})` }, { status: 400 });
        }
        product = products[0];
        productCache.set(productId, product);
      }

      const variants = buildVariantsMap(product);
      const basePrice = parseInt(variants[variant], 10) || 0;
      const deal = findDealForVariant(deals, productId, variant);
      const price = deal?.sale_price || basePrice;

      if (!basePrice || !price) {
        return NextResponse.json({ error: `Invalid variant '${variant}'` }, { status: 400 });
      }

      normalizedItems.push({
        product_id: productId,
        name: product.name,
        variant,
        qty,
        price,
        base_price: basePrice,
      });
    }

    const quantityByProduct = new Map();
    for (const item of normalizedItems) {
      quantityByProduct.set(
        item.product_id,
        (quantityByProduct.get(item.product_id) || 0) + item.qty
      );
    }

    for (const [productId, totalQty] of quantityByProduct.entries()) {
      const product = productCache.get(productId);
      const stock = product.stock === null ? null : Number(product.stock);
      if (stock !== null && totalQty > stock) {
        return NextResponse.json(
          { error: `${product.name} has only ${Math.max(0, stock)} unit(s) available` },
          { status: 400 }
        );
      }
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const flatRate = Number(shippingConfig?.flat_rate) || 0;
    const freeThreshold = Number(shippingConfig?.free_threshold) || 0;
    const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : flatRate;
    const total = subtotal + shipping;

    client = await pool.connect();
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders (
         customer_name, phone, city, address, landmark, subtotal, shipping, total, payment_method
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [name, phone, city, address, landmark || null, subtotal, shipping, total, selectedPayment]
    );

    const orderId = orderRes.rows[0].id;

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, variant, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product_id, item.name, item.variant, item.qty, item.price]
      );

      await client.query(
        `UPDATE products SET stock = GREATEST(COALESCE(stock, 0) - $1, 0) WHERE id = $2`,
        [item.qty, item.product_id]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json(
      {
        id: orderId,
        success: true,
        subtotal,
        shipping,
        total,
        payment_method: selectedPayment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
