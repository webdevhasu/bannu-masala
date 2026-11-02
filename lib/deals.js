import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

function computeSalePrice(originalPrice, percent) {
  const pct = Math.min(99, Math.max(1, Number(percent) || 0));
  const value = Math.round((originalPrice * (100 - pct)) / 100);
  return Math.max(1, Math.min(originalPrice - 1, value));
}

function formatActiveRow(row) {
  const variants = buildVariantsMap(row);
  const fallbackOriginal = Number(variants[row.variant]) || 0;
  const originalPrice = Number(row.original_price) || fallbackOriginal;
  const discountPercent = Number(row.deal_discount_percent) || 0;
  const salePrice =
    Number(row.sale_price) > 0
      ? Number(row.sale_price)
      : computeSalePrice(originalPrice, discountPercent);

  const effectivePercent =
    discountPercent > 0
      ? discountPercent
      : originalPrice > salePrice
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

  return {
    id: row.deal_item_id,
    deal_id: row.deal_id,
    deal_title: row.deal_title,
    deal_description: row.deal_description,
    deal_image: row.deal_image,
    product_id: row.product_id,
    product_name: row.product_name,
    product_slug: row.product_slug,
    product_image: row.product_image,
    stock: row.stock,
    variant: row.variant,
    sale_price: salePrice,
    original_price: originalPrice,
    discount_percent: effectivePercent,
    start_at: row.start_at,
    end_at: row.end_at,
    average_rating: parseFloat(row.average_rating).toFixed(1),
    review_count: Number(row.review_count) || 0,
  };
}

async function getActiveDealsFromItems() {
  const rows = await sql`
    SELECT d.id AS deal_id, d.title AS deal_title, d.description AS deal_description,
           d.image AS deal_image, d.discount_percent AS deal_discount_percent,
           d.start_at, d.end_at,
           di.id AS deal_item_id, di.product_id, di.variant,
           di.original_price, di.sale_price,
           p.name AS product_name, p.slug AS product_slug, p.image AS product_image,
           p.stock, p.price_250g, p.price_500g, p.price_1kg, p.custom_variants,
           COALESCE(AVG(r.rating), 0) AS average_rating,
           COUNT(r.id)::int AS review_count
    FROM deal_items di
    JOIN hot_deals d ON d.id = di.deal_id
    JOIN products p ON p.id = di.product_id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
    WHERE d.is_active = true
      AND p.is_active = true
      AND (d.start_at IS NULL OR d.start_at <= NOW())
      AND (d.end_at IS NULL OR d.end_at >= NOW())
    GROUP BY d.id, di.id, p.id
    ORDER BY d.id DESC, di.id ASC
  `;

  return rows
    .map(formatActiveRow)
    .filter((deal) => deal.sale_price > 0 && deal.original_price > deal.sale_price);
}

async function getActiveDealsFromLegacy() {
  const rows = await sql`
    SELECT d.id AS deal_id, d.title AS deal_title, d.description AS deal_description,
           d.image AS deal_image,
           (to_jsonb(d)->>'discount_percent')::int AS deal_discount_percent,
           d.start_at, d.end_at,
           d.id AS deal_item_id, d.product_id, d.variant,
           d.original_price, d.price AS sale_price,
           p.name AS product_name, p.slug AS product_slug, p.image AS product_image,
           p.stock, p.price_250g, p.price_500g, p.price_1kg, p.custom_variants,
           COALESCE(AVG(r.rating), 0) AS average_rating,
           COUNT(r.id)::int AS review_count
    FROM hot_deals d
    JOIN products p ON p.id = d.product_id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
    WHERE d.is_active = true
      AND p.is_active = true
      AND d.product_id IS NOT NULL
      AND d.variant IS NOT NULL
      AND (d.start_at IS NULL OR d.start_at <= NOW())
      AND (d.end_at IS NULL OR d.end_at >= NOW())
    GROUP BY d.id, p.id
    ORDER BY d.id DESC
  `;

  return rows
    .map(formatActiveRow)
    .filter((deal) => deal.sale_price > 0 && deal.original_price > deal.sale_price);
}

export async function getActiveDeals() {
  try {
    return await getActiveDealsFromItems();
  } catch (error) {
    if (/deal_items/i.test(error?.message || '')) {
      return getActiveDealsFromLegacy();
    }
    throw error;
  }
}

export async function getActiveDealById(dealId) {
  const deals = await getActiveDeals();
  const items = deals.filter((deal) => String(deal.deal_id) === String(dealId));

  if (items.length === 0) return null;

  const first = items[0];

  return {
    id: first.deal_id,
    title: first.deal_title,
    description: first.deal_description,
    image: first.deal_image,
    discount_percent: Math.max(...items.map((item) => Number(item.discount_percent) || 0)),
    start_at: first.start_at,
    end_at: first.end_at,
    items,
  };
}

export function findDealForVariant(deals, productId, variant) {
  return (
    deals.find(
      (deal) => String(deal.product_id) === String(productId) && deal.variant === variant
    ) || null
  );
}

export function dealsForProduct(deals, productId) {
  return deals.filter((deal) => String(deal.product_id) === String(productId));
}
