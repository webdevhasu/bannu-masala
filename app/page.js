import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import SplashScreen from '@/components/SplashScreen';
import HotDealsSection from '@/components/HotDealsSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCircleCheck, faFire, faBox, faLeaf, faScroll, faHandHoldingHeart, faHandshake, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import sql from '@/lib/db';
import { buildVariantsMap } from '@/lib/productVariants';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const rows = await sql`
    SELECT p.*, 
           COALESCE(AVG(r.rating), 0) AS average_rating, 
           COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.id ASC
  `;

  let hotDeals = [];
  try {
    hotDeals = await sql`
      SELECT * FROM hot_deals
      WHERE is_active = true
      ORDER BY id DESC
    `;
  } catch (err) {
    console.error("Error fetching hot deals:", err);
  }

  const products = rows.map(p => ({
    ...p,
    average_rating: parseFloat(p.average_rating).toFixed(1),
    review_count: parseInt(p.review_count),
    variants: buildVariantsMap(p),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bannu Masala",
    "url": "https://bannumasala.vercel.app",
    "logo": "https://bannumasala.vercel.app/logo.png",
    "description": "Premium handcrafted spice blends from Bannu, KPK. Authentic, pure, and preservative-free.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bannu",
      "addressRegion": "KPK",
      "addressCountry": "PK"
    }
  };

  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Our Premium Spices",
    "numberOfItems": products.length,
    "itemListElement": products.map((p, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": p.name,
      "description": p.description,
      "image": p.image,
      "offers": {
        "@type": "Offer",
        "price": p.price_250g,
        "priceCurrency": "PKR",
        "availability": "https://schema.org/InStock"
      }
    }))
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

      {/* Hero Section */}
      <section id="home">
        <HeroSlider />
      </section>

      {/* Hot Deals Section */}
      {hotDeals && hotDeals.length > 0 && (
        <HotDealsSection deals={hotDeals} />
      )}

      {/* Products Section */}
      <section id="products" className={styles.productsSection}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <h2 className="section-title">Our Premium Spices</h2>
          <p className="section-subtitle">Authentic flavors crafted for your kitchen</p>
          <div className="gold-line" />
          
          <div className={styles.grid}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
