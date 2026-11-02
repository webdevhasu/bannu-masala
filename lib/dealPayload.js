import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function computeSalePrice(originalPrice, percent) {
  const value = Math.round((originalPrice * (100 - percent)) / 100);
  return Math.max(1, Math.min(originalPrice - 1, value));
}

function normalizeItems(body) {
  if (Array.isArray(body?.items) && body.items.length > 0) {
    return body.items;
  }
  if (body?.product_id) {
    return [{ product_id: body.product_id, variant: body.variant }];
  }
  return [];
}

export async function buildDealPayload(body) {
  const {
    title,
    description,
    image,
    link,
    start_at,
    end_at,
    is_active,
    discount_percent,
    free_delivery,
  } = body || {};

  const startAt = parseDate(start_at);
  const endAt = parseDate(end_at);

  if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
    return { error: 'End date must be after the start date' };
  }

  const rawItems = normalizeItems(body);
  if (rawItems.length === 0) {
    return { error: 'Select at least one product for this deal' };
  }

  const seen = new Set();
  const items = [];

  for (const raw of rawItems) {
    const productId = Number.parseInt(raw?.product_id, 10);
    const variant = typeof raw?.variant === 'string' ? raw.variant.trim() : '';

    if (!Number.isFinite(productId) || productId <= 0) {
      return { error: 'Please select a valid product for every deal item' };
    }
    if (!variant) {
      return { error: 'Please select a variant for every deal item' };
    }

    const key = `${productId}::${variant}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const products = await sql`SELECT * FROM products WHERE id = ${productId} LIMIT 1`;
    if (!products.length) {
      return { error: `Product not found (id: ${productId})` };
    }

    const product = products[0];
    const variants = buildVariantsMap(product);
    const originalPrice = Number(variants[variant]) || 0;

    if (!originalPrice) {
      return { error: `Variant '${variant}' is not valid for ${product.name}` };
    }

    items.push({
      product_id: productId,
      variant,
      original_price: originalPrice,
      product_name: product.name,
      product_slug: product.slug,
      product_image: product.image,
    });
  }

  if (items.length === 0) {
    return { error: 'Select at least one product for this deal' };
  }

  let percent = toInt(discount_percent);

  if (percent <= 0 || percent >= 100) {
    const legacyPrice = toInt(body?.price);
    if (items.length === 1 && legacyPrice > 0 && legacyPrice < items[0].original_price) {
      percent = Math.round(
        ((items[0].original_price - legacyPrice) / items[0].original_price) * 100
      );
    }
  }

  if (percent <= 0 || percent >= 100) {
    return { error: 'Discount must be between 1% and 99%' };
  }

  const computedItems = items.map((item) => ({
    ...item,
    sale_price: computeSalePrice(item.original_price, percent),
  }));

  const first = computedItems[0];
  const dealTitle =
    typeof title === 'string' && title.trim()
      ? title.trim()
      : computedItems.map((item) => item.product_name).join(' + ');

  const dealDescription =
    typeof description === 'string' && description.trim()
      ? description.trim()
      : computedItems.length === 1
        ? `${percent}% off on ${first.variant}`
        : `Buy all ${computedItems.length} products together and save ${percent}%`;

  const dealLink =
    typeof link === 'string' && link.trim()
      ? link.trim()
      : computedItems.length === 1
        ? `/products/${first.product_slug}`
        : '/deals';

  const dealImage =
    typeof image === 'string' && image.trim() ? image.trim() : first.product_image || null;

  return {
    payload: {
      title: dealTitle,
      description: dealDescription,
      image: dealImage,
      link: dealLink,
      is_active: is_active !== false,
      discount_percent: percent,
      free_delivery: toBool(free_delivery),
      start_at: startAt,
      end_at: endAt,
      product_id: first.product_id,
      variant: first.variant,
      price: first.sale_price,
      original_price: first.original_price,
    },
    items: computedItems,
  };
}
