import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function buildDealPayload(body) {
  const {
    product_id,
    variant,
    price,
    start_at,
    end_at,
    is_active,
    title,
    description,
    image,
    original_price,
    link,
  } = body || {};

  const startAt = parseDate(start_at);
  const endAt = parseDate(end_at);

  if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
    return { error: 'End date must be after the start date' };
  }

  const productId = Number.parseInt(product_id, 10);

  if (Number.isFinite(productId) && productId > 0) {
    const products = await sql`SELECT * FROM products WHERE id = ${productId} LIMIT 1`;
    if (!products.length) {
      return { error: 'Selected product was not found' };
    }

    const product = products[0];
    const variants = buildVariantsMap(product);
    const originalPrice = Number(variants[variant]) || 0;
    const salePrice = Number.parseInt(price, 10) || 0;

    if (!originalPrice) {
      return { error: 'Selected variant is not valid for this product' };
    }

    if (salePrice <= 0 || salePrice >= originalPrice) {
      return { error: `Sale price must be greater than 0 and less than Rs ${originalPrice}` };
    }

    return {
      payload: {
        title: product.name,
        description: `Special deal on ${variant}`,
        image: product.image,
        price: salePrice,
        original_price: originalPrice,
        link: `/products/${product.slug}`,
        product_id: productId,
        variant,
        start_at: startAt,
        end_at: endAt,
        is_active: is_active !== false,
      },
    };
  }

  if (!title?.trim()) {
    return { error: 'Select a product or provide a deal title' };
  }

  return {
    payload: {
      title: title.trim(),
      description: description || null,
      image: image || null,
      price: Number.parseInt(price, 10) || 0,
      original_price: Number.parseInt(original_price, 10) || 0,
      link: link || null,
      product_id: null,
      variant: null,
      start_at: startAt,
      end_at: endAt,
      is_active: is_active !== false,
    },
  };
}
