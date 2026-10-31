import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductGallery from './ProductGallery';
import ProductActions from './ProductActions';
import ReviewsSection from './ReviewsSection';
import ProductCard from '@/components/ProductCard';
import { buildVariantsMap } from '@/lib/productVariants';
import { getActiveDeals, dealsForProduct } from '@/lib/deals';
import { getAllSettings } from '@/lib/settings';
import styles from './page.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar } from '@fortawesome/free-solid-svg-icons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const productRes = await sql`SELECT name, description, image FROM products WHERE slug = ${slug} LIMIT 1`;
  if (!productRes.length) return { title: 'Product Not Found' };

  return {
    title: `${productRes[0].name} - Bannu Masala`,
    description: productRes[0].description,
    openGraph: {
      images: [productRes[0].image],
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  const products = await sql`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `;

  if (products.length === 0) {
    notFound();
  }

  const productData = products[0];
  const gallery = (() => {
    if (!productData.gallery) return [];
    if (Array.isArray(productData.gallery)) return productData.gallery;
    if (typeof productData.gallery === 'string') {
      try {
        const parsed = JSON.parse(productData.gallery);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const [reviewStats, activeDeals, settings] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count, AVG(rating) AS average
      FROM reviews
      WHERE product_id = ${productData.id} AND is_approved = true
    `,
    getActiveDeals(),
    getAllSettings(),
  ]);

  const productDeals = dealsForProduct(activeDeals, productData.id);
  const product = {
    ...productData,
    gallery,
    variants: buildVariantsMap(productData),
    deals: productDeals,
  };

  const reviewCount = parseInt(reviewStats[0].count, 10);
  const averageRating = parseFloat(reviewStats[0].average || 0).toFixed(1);

  let relatedRows = [];
  if (productData.category_id) {
    relatedRows = await sql`
      SELECT p.*, COALESCE(AVG(r.rating), 0) AS average_rating, COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
      WHERE p.is_active = true AND p.category_id = ${productData.category_id} AND p.id <> ${productData.id}
      GROUP BY p.id
      ORDER BY p.is_featured DESC, p.id ASC
      LIMIT 3
    `;
  }

  if (relatedRows.length === 0) {
    relatedRows = await sql`
      SELECT p.*, COALESCE(AVG(r.rating), 0) AS average_rating, COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
      WHERE p.is_active = true AND p.id <> ${productData.id}
      GROUP BY p.id
      ORDER BY p.is_featured DESC, p.id ASC
      LIMIT 3
    `;
  }

  const relatedProducts = relatedRows.map((row) => ({
    ...row,
    average_rating: parseFloat(row.average_rating).toFixed(1),
    review_count: parseInt(row.review_count, 10),
    variants: buildVariantsMap(row),
    deals: dealsForProduct(activeDeals, row.id),
  }));

  const allImages = [product.image, ...gallery].filter(Boolean);
  const effectivePrices = Object.entries(product.variants)
    .map(([label, price]) => {
      const deal = productDeals.find((item) => item.variant === label);
      return Number(deal?.sale_price || price) || 0;
    })
    .filter((price) => price > 0);

  const lowPrice = effectivePrices.length ? Math.min(...effectivePrices) : product.price_250g;
  const highPrice = effectivePrices.length ? Math.max(...effectivePrices) : product.price_1kg;
  const inStock = product.stock === null || Number(product.stock) > 0;
  const maxDiscount = productDeals.length
    ? Math.max(...productDeals.map((deal) => deal.discount_percent))
    : 0;

  const flatRate = Number(settings.shipping?.flat_rate) || 0;
  const freeThreshold = Number(settings.shipping?.free_threshold) || 0;
  const shippingAreas = settings.shipping?.areas?.trim();
  const shippingPerk =
    freeThreshold > 0
      ? `Free delivery on orders above Rs ${freeThreshold.toLocaleString()}`
      : flatRate > 0
        ? `Rs ${flatRate} shipping${shippingAreas ? ` — ${shippingAreas}` : ''}`
        : shippingAreas
          ? `Delivery: ${shippingAreas}`
          : 'Shipping details are shown at checkout';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allImages,
    description: product.description,
    category: product.category_name || 'Spices',
    brand: {
      '@type': 'Brand',
      name: 'Bannu Masala',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PKR',
      lowPrice,
      highPrice,
      offerCount: effectivePrices.length || Object.keys(product.variants).length,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating:
      reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount,
          }
        : undefined,
  };

  return (
    <div className={styles.pageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className={styles.container}>
        <Link href="/products" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
        </Link>

        <div className={styles.mainGrid}>
          <div className={styles.galleryColumn}>
            <ProductGallery images={allImages} altText={product.name} />
          </div>

          <div className={styles.detailsColumn}>
            <div className={styles.badges}>
              {maxDiscount > 0 && (
                <span className={styles.badgeDeal}>{maxDiscount}% OFF</span>
              )}
              {product.badge && <span className={styles.badgeTop}>{product.badge}</span>}
              {product.is_featured && !product.badge && (
                <span className={styles.badgeTop}>Best Seller</span>
              )}
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            {product.category_name && (
              <Link
                href={`/products?category=${product.category_slug}`}
                className={styles.categoryLink}
              >
                {product.category_name}
              </Link>
            )}

            <div className={styles.reviewSummary}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={
                      star <= (reviewCount > 0 ? Math.round(Number(averageRating)) : 5)
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  />
                ))}
              </div>
              <a href="#reviews" className={styles.ratingTextLink}>
                <span className={styles.ratingScore}>
                  {reviewCount > 0 ? averageRating : '5.0'}
                </span>
                <span className={styles.ratingCount}>
                  {reviewCount > 0
                    ? `(${reviewCount} ${reviewCount === 1 ? 'Customer Review' : 'Customer Reviews'})`
                    : '(Bannu Quality • 100% Pure)'}
                </span>
                <span className={styles.writeReviewCta}>• Write a Review</span>
              </a>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>✅ 100% Pure</span>
              <span className={styles.trustBadge}>🌿 No Preservatives</span>
              <span className={styles.trustBadge}>🏠 Authentic Blend</span>
              <span className={styles.trustBadge}>📍 Made in Bannu</span>
            </div>

            <ProductActions product={product} storeWhatsapp={settings.store?.whatsapp} />

            <div className={styles.perks}>
              <div className={styles.perk}>🚚 {shippingPerk}</div>
              {settings.payment?.cod_enabled && (
                <div className={styles.perk}>💵 Cash on Delivery available</div>
              )}
              <div className={styles.perk}>💬 WhatsApp order support</div>
              <div className={styles.perk}>📍 Made in Bannu, KPK</div>
            </div>
          </div>
        </div>

        {(product.ingredients || product.how_to_use || product.storage) && (
          <div className={styles.infoGrid}>
            {product.ingredients && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Ingredients</h3>
                <p className={styles.infoText}>{product.ingredients}</p>
              </div>
            )}
            {product.how_to_use && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>How to Use</h3>
                <p className={styles.infoText}>{product.how_to_use}</p>
              </div>
            )}
            {product.storage && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Storage</h3>
                <p className={styles.infoText}>{product.storage}</p>
              </div>
            )}
          </div>
        )}

        <div id="reviews" className={styles.reviewsWrapper}>
          <ReviewsSection productId={product.id} />
        </div>

        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <p className={styles.relatedSubtitle}>More blends from the Bannu Masala kitchen</p>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
