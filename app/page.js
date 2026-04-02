import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import SplashScreen from '@/components/SplashScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCircleCheck, faFire, faBox, faLeaf, faScroll, faHandHoldingHeart, faHandshake, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import sql from '@/lib/db';
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

  const products = rows.map(p => ({
    ...p,
    average_rating: parseFloat(p.average_rating).toFixed(1),
    review_count: parseInt(p.review_count),
    variants: {
      "250g": p.price_250g,
      "500g": p.price_500g,
      "1kg": p.price_1kg,
    }
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bannu Masala",
    "url": "https://bannu-masala.vercel.app",
    "logo": "https://bannu-masala.vercel.app/logo.png",
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
        <HeroSlider products={products} />
        {/* Free Shipping Banner */}
        <div className={styles.shippingBanner}>
          <span className={styles.bannerItem}><FontAwesomeIcon icon={faTruck} /> FREE DELIVERY on all orders above <strong>Rs 3,000</strong></span>
          <span className={styles.bannerItem}><FontAwesomeIcon icon={faCircleCheck} /> 100% Natural Spices</span>
          <span className={styles.bannerItem}><FontAwesomeIcon icon={faFire} /> Authentic Bannu Recipes</span>
          <span className={styles.bannerItem}><FontAwesomeIcon icon={faBox} /> Pan-Pakistan Delivery</span>
        </div>
      </section>

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
