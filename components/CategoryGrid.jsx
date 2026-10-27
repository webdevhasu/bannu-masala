import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Find the perfect blend for every dish</p>
        <div className="gold-line" />

        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                {category.image ? (
                  <img
                    src={category.image}
                    alt={`${category.name} - Bannu Masala`}
                    className={styles.image}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <span>{category.name.charAt(0)}</span>
                  </div>
                )}
                <div className={styles.overlay} />
                <span className={styles.count}>
                  {category.product_count} {Number(category.product_count) === 1 ? 'product' : 'products'}
                </span>
              </div>

              <div className={styles.body}>
                <h3 className={styles.name}>{category.name}</h3>
                {category.description && <p className={styles.description}>{category.description}</p>}
                <span className={styles.link}>
                  Explore <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
