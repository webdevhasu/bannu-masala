import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import SplashScreen from '@/components/SplashScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCircleCheck, faFire, faBox, faLeaf, faScroll, faHandHoldingHeart, faHandshake, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import sql from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const rows = await sql`SELECT * FROM products ORDER BY id ASC`;

  const products = rows.map(p => ({
    ...p,
    variants: {
      "250g": p.price_250g,
      "500g": p.price_500g,
      "1kg": p.price_1kg,
    }
  }));

  return (
    <>
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
        <div className="container" style={{ paddingTop: '80px' }}>
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

      {/* About / Values Section */}
      <section id="about" style={{ background: '#f8fafc', padding: '100px 0' }}>
        <div className="container">
          <h2 className="section-title">About Bannu Masala</h2>
          <p className="section-subtitle">A heritage of flavor, straight from the heart of KPK</p>
          <div className="gold-line" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '64px', maxWidth: '800px', margin: '0 auto 64px auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--maroon)' }}>Our Founder & Owner</h3>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.8' }}>
              Welcome to Bannu Masala! I started this journey with a simple vision: to bring the authentic, unfiltered taste of Bannu to tables across Pakistan. Growing up, the rich aromas of traditional spices were a staple in our home. I realized that the market was flooded with commercial blends that lacked the true essence of KPK's culinary heritage.
            </p>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.8' }}>
              That's why I founded Bannu Masala. Every single spice blend we offer is based on my family's time-tested recipes. I personally ensure that we source only the purest ingredients directly from farmers, grinding and blending them in small batches to preserve their natural oils and robust flavors. This isn't just a business for me; it's a tribute to our rich culture and a promise of uncompromising quality to your family.
            </p>
          </div>

          <h3 style={{ fontSize: '1.75rem', color: 'var(--maroon)', textAlign: 'center', marginBottom: '32px' }}>Our Core Values</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { icon: <FontAwesomeIcon icon={faLeaf} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Natural & Pure', desc: 'We never use artificial colors, flavors, or preservatives. Every ingredient is sourced directly from trusted farmers.' },
              { icon: <FontAwesomeIcon icon={faScroll} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Traditional Recipes', desc: 'Our blends are based on time-tested recipes passed down through generations of Bannuchi families.' },
              { icon: <FontAwesomeIcon icon={faHandHoldingHeart} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Handcrafted with Love', desc: 'Every batch is carefully crafted in small quantities to maintain freshness and consistency in every packet.' },
              { icon: <FontAwesomeIcon icon={faHandshake} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Customer First', desc: 'From WhatsApp ordering to free shipping on large orders, we make buying spices as easy as possible for you.' },
              { icon: <FontAwesomeIcon icon={faGlobe} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Supporting Local', desc: 'We work directly with local spice farmers in KPK, helping sustain traditional agriculture and rural livelihoods.' },
              { icon: <FontAwesomeIcon icon={faStar} style={{fontSize: '2.5rem', color: "var(--maroon)"}} />, title: 'Uncompromising Quality', desc: 'Each batch is taste-tested and quality-checked before it leaves our kitchen. You deserve nothing but the best.' },
            ].map((v, i) => (
              <div key={i} style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <span style={{ display: 'inline-block', marginBottom: '16px' }}>{v.icon}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#0f172a' }}>{v.title}</h3>
                <p style={{ color: '#475569', lineHeight: '1.6' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
