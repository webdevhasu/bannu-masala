import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import sql from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { buildVariantsMap } from '@/lib/productVariants';
import { getActiveDeals, dealsForProduct } from '@/lib/deals';
import styles from './products.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Complete Spice Collection | Bannu Masala',
  description:
    'Explore our full range of handcrafted spice blends from Bannu, KPK.',
};

function effectiveMinPrice(product) {
  const prices = Object.entries(product.variants)
    .map(([weight, price]) => {
      const deal = (product.deals || []).find((d) => d.variant === weight);
      return Number(deal?.sale_price || price) || 0;
    })
    .filter((price) => price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

export default async function ProductsListPage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const sort = typeof params.sort === 'string' ? params.sort : 'featured';
  const focusSearch = params.focus === 'search';

  const [rows, categories, activeDeals] = await Promise.all([
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
  ]);

  const allProducts = rows.map((p) => ({
    ...p,
    average_rating: parseFloat(p.average_rating).toFixed(1),
    review_count: parseInt(p.review_count),
    variants: buildVariantsMap(p),
    deals: dealsForProduct(activeDeals, p.id),
  }));

  const categoryCounts = new Map();
  for (const product of allProducts) {
    if (!product.category_slug) continue;
    categoryCounts.set(product.category_slug, (categoryCounts.get(product.category_slug) || 0) + 1);
  }

  let products = [...allProducts];

  if (category) {
    products = products.filter((p) => p.category_slug === category);
  }

  if (q) {
    const needle = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description || '').toLowerCase().includes(needle) ||
        (p.category_name || '').toLowerCase().includes(needle)
    );
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => effectiveMinPrice(a) - effectiveMinPrice(b));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => effectiveMinPrice(b) - effectiveMinPrice(a));
  } else if (sort === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'newest') {
    products.sort((a, b) => b.id - a.id);
  }

  const selectedCategory = categories.find((c) => c.slug === category);
  const hasFilters = Boolean(q || category || sort !== 'featured');

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Bannu Masala Collection</span>
          <h1 className={styles.title}>{selectedCategory?.name || 'Our Premium Spices'}</h1>
          <p className={styles.subtitle}>
            {selectedCategory?.description ||
              'The complete collection of authentic handcrafted blends'}
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.chips}>
          <Link
            href={q ? `/products?q=${encodeURIComponent(q)}` : '/products'}
            className={`${styles.chip} ${!category ? styles.chipActive : ''}`}
          >
            All <span className={styles.chipCount}>{allProducts.length}</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`${styles.chip} ${category === cat.slug ? styles.chipActive : ''}`}
            >
              {cat.name}
              <span className={styles.chipCount}>{categoryCounts.get(cat.slug) || 0}</span>
            </Link>
          ))}
        </div>

        <form className={styles.toolbar} action="/products" method="get">
          <div className={styles.searchWrap}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search spices..."
              className={styles.searchInput}
              aria-label="Search spices"
              id="product-search"
              autoFocus={focusSearch}
            />
          </div>

          <select name="category" defaultValue={category} className={styles.select} aria-label="Filter by category">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <select name="sort" defaultValue={sort} className={styles.select} aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>

          <button type="submit" className={styles.submitBtn}>
            Apply
          </button>

          {hasFilters && (
            <Link href="/products" className={styles.clearBtn}>
              Clear
            </Link>
          )}
        </form>

        <div className={styles.resultsRow}>
          <p className={styles.resultsText}>
            Showing <strong>{products.length}</strong>{' '}
            {products.length === 1 ? 'product' : 'products'}
            {q && (
              <>
                {' '}
                for <strong>&ldquo;{q}&rdquo;</strong>
              </>
            )}
          </p>
        </div>

        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h2>No products found</h2>
            <p>Try a different search term or browse our full collection.</p>
            <Link href="/products" className={styles.emptyBtn}>
              Browse All Products <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
