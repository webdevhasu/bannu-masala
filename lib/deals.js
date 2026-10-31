import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';

export async function getActiveDeals() {
  const rows = await sql`
    SELECT d.id, d.product_id, d.variant, d.price AS sale_price, d.start_at, d.end_at,
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
    .map((row) => {
      const variants = buildVariantsMap(row);
      const originalPrice = variants[row.variant] || 0;
      const salePrice = Number(row.sale_price) || 0;

      return {
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_slug: row.product_slug,
        product_image: row.product_image,
        stock: row.stock,
        variant: row.variant,
        sale_price: salePrice,
        original_price: originalPrice,
        discount_percent:
          originalPrice > salePrice && originalPrice > 0
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0,
        start_at: row.start_at,
        end_at: row.end_at,
        average_rating: parseFloat(row.average_rating).toFixed(1),
        review_count: Number(row.review_count) || 0,
      };
    })
    .filter((deal) => deal.sale_price > 0 && deal.original_price > deal.sale_price);
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
