import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import SplashScreen from '@/components/SplashScreen';
import HotDealsSection from '@/components/HotDealsSection';
import CategoryGrid from '@/components/CategoryGrid';
import WhyChooseSection from '@/components/WhyChooseSection';
import BrandStorySection from '@/components/BrandStorySection';
import TestimonialsSection from '@/components/TestimonialsSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import { getActiveDeals, dealsForProduct } from '@/lib/deals';
import { getAllSettings } from '@/lib/settings';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [rows, categories, activeDeals, settings, reviewRows] = await Promise.all([
    sql`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
      WHERE p.is_active = true
      GROUP BY p.id, c.name, c.slug
      ORDER BY p.is_featured DESC, p.id ASC
    `,
    sql`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `,
    getActiveDeals(),
    getAllSettings(),
    sql`
      SELECT r.id, r.reviewer_name, r.rating, r.comment, r.created_at, r.is_verified,
             p.name AS product_name, p.slug AS product_slug
      FROM reviews r
      JOIN products p ON p.id = r.product_id AND p.is_active = true
      WHERE r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 12
    `,
  ]);

  const reviewLimit = Math.min(
    12,
    Math.max(1, Number(settings.homepage?.reviews_limit) || 6)
  );
  const testimonials = reviewRows.slice(0, reviewLimit);

  const products = rows.map((p) => ({
    ...p,
    average_rating: parseFloat(p.average_rating).toFixed(1),
    review_count: parseInt(p.review_count),
    variants: buildVariantsMap(p),
    deals: dealsForProduct(activeDeals, p.id),
  }));

  const featuredProducts = products.filter((product) => product.is_featured);
  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts : products;

  const categoryCards = categories.map((category) => {
    if (category.image) return category;
    const productWithImage = products.find(
      (p) => p.category_slug === category.slug && p.image
    );
    return { ...category, image: productWithImage?.image || null };
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bannumasala.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bannu Masala',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Handcrafted spice blends from Bannu, KPK.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bannu',
      addressRegion: 'KPK',
      addressCountry: 'PK',
    },
  };

  const productListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Our Premium Spices',
    numberOfItems: products.length,
    itemListElement: products.map((p, index) => ({
      '@type': 'Product',
      position: index + 1,
      name: p.name,
      description: p.description,
      image: p.image,
      offers: {
        '@type': 'Offer',
        price: p.price_250g,
        priceCurrency: 'PKR',
        availability:
          p.stock === null || Number(p.stock) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
      />
      <SplashScreen />

      <section id="home">
        {settings.hero?.enabled !== false && <HeroSlider hero={settings.hero} />}
      </section>

      {settings.homepage?.show_categories !== false && (
        <CategoryGrid categories={categoryCards} />
      )}

      {settings.homepage?.show_deals !== false && activeDeals.length > 0 && (
        <HotDealsSection deals={activeDeals} />
      )}

      <section id="products" className={styles.productsSection}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <p className={styles.customerFavsLabel}>
            {featuredProducts.length > 0 ? 'CUSTOMER FAVOURITES' : 'OUR COLLECTION'}
          </p>
          <h2 className={styles.lovedSpicesTitle}>
            Our Most Loved<br />
            <span className={styles.lovedSpicesHighlight}>Spices You Must Try</span>
          </h2>
          <p className={styles.lovedSpicesSubtitle}>
            Pure ingredients, traditional recipes, authentic homemade flavour in every blend.
          </p>
          <div className="gold-line" />

          <div className={styles.grid}>
            {showcaseProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {showcaseProducts.length > 0 && (
            <div className={styles.allBtn}>
              <Link href="/products" className="btn-secondary">
                View All Products <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
          )}

          {showcaseProducts.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Our spice collection is coming soon. Please check back later!
            </p>
          )}
        </div>
      </section>

      <WhyChooseSection />

      {settings.homepage?.show_brand_story !== false && <BrandStorySection />}

      {settings.homepage?.show_reviews !== false && (
        <TestimonialsSection reviews={testimonials} />
      )}
    </>
  );
}
