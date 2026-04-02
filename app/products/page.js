import sql from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Complete Spice Collection | Bannu Masala',
  description: 'Explore our full range of 100% natural, handcrafted spice blends. Pure, authentic, and delivered across Pakistan.',
};

export default async function ProductsListPage() {
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

  return (
    <div className={styles.productsSection} style={{ minHeight: '80vh', padding: '100px 0' }}>
      <div className="container">
        <h1 className="section-title">Our Premium Spices</h1>
        <p className="section-subtitle">The complete collection of authentic handcrafted blends</p>
        <div className="gold-line" />
        
        <div className={styles.grid}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p>Our spice collection is coming soon. Please check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
